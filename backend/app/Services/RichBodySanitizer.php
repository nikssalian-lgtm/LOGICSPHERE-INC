<?php

namespace App\Services;

use Illuminate\Validation\ValidationException;

class RichBodySanitizer
{
    private const NODES = ['doc', 'paragraph', 'heading', 'blockquote', 'bulletList', 'orderedList', 'listItem', 'hardBreak', 'horizontalRule', 'text', 'image'];

    private const MARKS = ['bold', 'italic', 'strike', 'code', 'link'];

    private int $visited = 0;

    public function clean(?array $body): ?array
    {
        if ($body === null) {
            return null;
        }
        $this->visited = 0;
        $body = $this->node($body, 0);
        if (($body['type'] ?? null) !== 'doc') {
            throw ValidationException::withMessages(['body' => ['Rich text must contain a document root.']]);
        }

        return $body;
    }

    private function node(array $node, int $depth): array
    {
        if (++$this->visited > 1500 || $depth > 35) {
            throw ValidationException::withMessages(['body' => ['Rich text is too deeply nested or too large.']]);
        }
        $type = $node['type'] ?? '';
        if (! in_array($type, self::NODES, true)) {
            throw ValidationException::withMessages(['body' => ['The editor contains an unsupported content element.']]);
        }
        $result = ['type' => $type];
        if ($type === 'text') {
            $text = $node['text'] ?? '';
            if (! is_string($text) || mb_strlen($text) > 20000) {
                throw ValidationException::withMessages(['body' => ['Editor text is too long.']]);
            }
            $result['text'] = strip_tags($text);
        }
        if ($type === 'heading') {
            $level = (int) ($node['attrs']['level'] ?? 2);
            if (! in_array($level, [2, 3, 4], true)) {
                throw ValidationException::withMessages(['body' => ['Headings must use levels 2 through 4.']]);
            }
            $result['attrs'] = ['level' => $level];
        }
        if ($type === 'image') {
            $src = $node['attrs']['src'] ?? '';
            $alt = $node['attrs']['alt'] ?? '';
            if (! is_string($src) || ! preg_match('#^/api/v1/public/media/[1-9][0-9]*/file$#', $src) || ! is_string($alt) || mb_strlen($alt) > 255) {
                throw ValidationException::withMessages(['body' => ['Images must reference published media and include concise alt text.']]);
            }
            $result['attrs'] = ['src' => $src, 'alt' => $alt];
        }
        if (! empty($node['marks']) && is_array($node['marks'])) {
            foreach (array_slice($node['marks'], 0, 5) as $mark) {
                $markType = $mark['type'] ?? '';
                if (! in_array($markType, self::MARKS, true)) {
                    continue;
                }
                if ($markType === 'link') {
                    $href = $mark['attrs']['href'] ?? '';
                    if (! is_string($href) || strlen($href) > 2048 || preg_match('/[\\x00-\\x20\\\\]/', $href)) {
                        continue;
                    }
                    $internal = str_starts_with($href, '/') && ! str_starts_with($href, '//');
                    $external = filter_var($href, FILTER_VALIDATE_URL) !== false && str_starts_with(strtolower($href), 'https://');
                    if (! $internal && ! $external) {
                        continue;
                    }
                    $result['marks'][] = ['type' => 'link', 'attrs' => ['href' => $href, 'target' => '_blank', 'rel' => 'noopener noreferrer nofollow']];
                } else {
                    $result['marks'][] = ['type' => $markType];
                }
            }
        }
        if (! empty($node['content']) && is_array($node['content'])) {
            foreach ($node['content'] as $child) {
                if (! is_array($child)) {
                    continue;
                }
                $result['content'][] = $this->node($child, $depth + 1);
            }
        }

        return $result;
    }
}
