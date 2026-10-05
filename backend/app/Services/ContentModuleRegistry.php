<?php

namespace App\Services;

use Illuminate\Validation\Rule;
use InvalidArgumentException;

class ContentModuleRegistry
{
    private const BASE = [
        'services' => ['type' => 'service', 'label' => 'Services', 'item' => 'Service', 'icon' => 'Layers3', 'summary' => true, 'body' => true, 'fields' => [
            'service_type' => ['label' => 'Service category', 'type' => 'select', 'options' => ['Custom software', 'ERP development', 'CRM development', 'POS software', 'Website development', 'E-commerce development', 'Mobile applications', 'Web applications', 'API integrations', 'Dedicated resources']],
            'benefits' => ['label' => 'Benefits', 'type' => 'tags'], 'technologies' => ['label' => 'Technologies', 'type' => 'tags'],
            'cta_label' => ['label' => 'Button label', 'type' => 'text'], 'cta_url' => ['label' => 'Button URL', 'type' => 'path'],
        ]],
        'solutions' => ['type' => 'solution', 'label' => 'Solutions', 'item' => 'Solution', 'icon' => 'PanelsTopLeft', 'summary' => true, 'body' => true, 'fields' => [
            'category' => ['label' => 'Solution type', 'type' => 'select', 'options' => ['ERP', 'CRM', 'POS', 'HRMS', 'Inventory management', 'Manufacturing management', 'Business management', 'Custom enterprise software']],
            'capabilities' => ['label' => 'Capabilities', 'type' => 'tags'], 'technologies' => ['label' => 'Technologies', 'type' => 'tags'],
        ]],
        'portfolio' => ['type' => 'project', 'label' => 'Portfolio', 'item' => 'Project', 'icon' => 'BriefcaseBusiness', 'summary' => true, 'body' => true, 'fields' => [
            'project_type' => ['label' => 'Project category', 'type' => 'select', 'options' => ['ERP', 'CRM', 'POS', 'E-commerce', 'Website', 'Mobile application', 'Custom software']],
            'client' => ['label' => 'Client name', 'type' => 'text'], 'industry' => ['label' => 'Industry', 'type' => 'text'],
            'services' => ['label' => 'Services provided', 'type' => 'tags'], 'features' => ['label' => 'Key features', 'type' => 'tags'],
            'challenge' => ['label' => 'Challenge', 'type' => 'richtext'], 'approach' => ['label' => 'Our approach', 'type' => 'richtext'],
            'solution' => ['label' => 'Solution', 'type' => 'richtext'], 'results' => ['label' => 'Results', 'type' => 'richtext'],
            'technologies' => ['label' => 'Technologies', 'type' => 'tags'], 'url' => ['label' => 'Project URL', 'type' => 'url'],
            'seo_title' => ['label' => 'SEO title', 'type' => 'text'], 'seo_description' => ['label' => 'SEO description', 'type' => 'textarea'],
        ]],
        'clients' => ['type' => 'client', 'label' => 'Clients', 'item' => 'Client', 'icon' => 'Building2', 'summary' => false, 'body' => false, 'featured' => true, 'fields' => [
            'website' => ['label' => 'Website', 'type' => 'url'], 'industry' => ['label' => 'Industry', 'type' => 'text'], 'logo_media_id' => ['label' => 'Logo media ID', 'type' => 'media'],
        ]],
        'testimonials' => ['type' => 'testimonial', 'label' => 'Testimonials', 'item' => 'Testimonial', 'icon' => 'MessageSquareQuote', 'summary' => false, 'body' => false, 'fields' => [
            'quote' => ['label' => 'Quote', 'type' => 'textarea', 'required' => true], 'author_name' => ['label' => 'Person', 'type' => 'text'], 'author_role' => ['label' => 'Role', 'type' => 'text'],
            'company' => ['label' => 'Company', 'type' => 'text'], 'avatar_media_id' => ['label' => 'Portrait media ID', 'type' => 'media'],
        ]],
        'team' => ['type' => 'team', 'label' => 'Team', 'item' => 'Team member', 'icon' => 'UsersRound', 'summary' => true, 'body' => true, 'fields' => [
            'position' => ['label' => 'Position', 'type' => 'text'], 'portrait_media_id' => ['label' => 'Portrait media ID', 'type' => 'media'], 'linkedin' => ['label' => 'LinkedIn URL', 'type' => 'url'],
        ]],
        'technologies' => ['type' => 'technology', 'label' => 'Technologies', 'item' => 'Technology', 'icon' => 'Code2', 'summary' => true, 'body' => false, 'fields' => [
            'category' => ['label' => 'Technology group', 'type' => 'text'], 'website' => ['label' => 'Documentation URL', 'type' => 'url'], 'mark' => ['label' => 'Short name / initials', 'type' => 'text'],
        ]],
        'industries' => ['type' => 'industry', 'label' => 'Industries', 'item' => 'Industry', 'icon' => 'Factory', 'summary' => true, 'body' => true, 'fields' => [
            'icon' => ['label' => 'Icon key', 'type' => 'text'], 'services' => ['label' => 'Relevant services', 'type' => 'tags'],
        ]],
        'blog' => ['type' => 'blog', 'label' => 'Blog', 'item' => 'Article', 'icon' => 'Newspaper', 'summary' => true, 'body' => true, 'fields' => [
            'author' => ['label' => 'Author', 'type' => 'text'],
            'read_time' => ['label' => 'Reading time', 'type' => 'number'], 'seo_title' => ['label' => 'SEO title', 'type' => 'text'], 'seo_description' => ['label' => 'SEO description', 'type' => 'textarea'],
        ]],
        'pages' => ['type' => 'page', 'label' => 'Pages', 'item' => 'Page', 'icon' => 'FileText', 'summary' => true, 'body' => true, 'fields' => [
            'page_type' => ['label' => 'Page template', 'type' => 'select', 'options' => ['Standard', 'About', 'Contact', 'Landing', 'Privacy', 'Terms']],
            'seo_title' => ['label' => 'SEO title', 'type' => 'text'], 'seo_description' => ['label' => 'SEO description', 'type' => 'textarea'], 'canonical_url' => ['label' => 'Canonical URL', 'type' => 'url'],
        ]],
        'menus' => ['type' => 'menu', 'label' => 'Navigation', 'item' => 'Menu link', 'icon' => 'ListTree', 'summary' => false, 'body' => false, 'fields' => [
            'label' => ['label' => 'Link text', 'type' => 'text', 'required' => true], 'url' => ['label' => 'Link URL or path', 'type' => 'path', 'required' => true],
            'menu' => ['label' => 'Menu group', 'type' => 'select', 'options' => ['primary', 'footer-services', 'footer-company', 'footer-resources']],
            'parent_id' => ['label' => 'Parent menu item ID', 'type' => 'number'], 'open_new_tab' => ['label' => 'Open in new tab', 'type' => 'boolean'],
        ]],
    ];

    public function all(): array
    {
        return self::BASE;
    }

    public function get(string $module): array
    {
        return self::BASE[$module] ?? throw new InvalidArgumentException('Unknown content module.');
    }

    public function keys(): array
    {
        return array_keys(self::BASE);
    }

    public function validation(string $module, ?int $id = null): array
    {
        $spec = $this->get($module);
        $rules = [
            'title' => ['required', 'string', 'max:180'],
            'slug' => ['nullable', 'string', 'max:200', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('content_items', 'slug')->where('type', $spec['type'])->ignore($id)],
            'summary' => ['nullable', 'string', 'max:500'],
            'body' => ['nullable', 'array'],
            'status' => ['sometimes', 'in:draft,published'],
            'featured' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:1000000'],
            'media_ids' => ['sometimes', 'array', 'max:40'],
            'media_ids.*' => ['integer', 'distinct', 'exists:media_assets,id,deleted_at,NULL'],
            'attributes' => ['sometimes', 'array'],
        ];
        foreach ($spec['fields'] as $key => $field) {
            $base = match ($field['type']) {
                'url' => ['nullable', 'url:https,http', 'max:2048'],
                'path' => ['nullable', 'string', 'max:2048', function ($attribute, $value, $fail): void {
                    $internal = str_starts_with($value, '/') && ! str_starts_with($value, '//') && ! str_contains($value, '\\') && ! preg_match('/[\\x00-\\x20]/', $value);
                    $external = filter_var($value, FILTER_VALIDATE_URL) !== false && str_starts_with(strtolower($value), 'https://');
                    if (! $internal && ! $external) {
                        $fail('Use a relative site path or an https URL.');
                    }
                }],
                'textarea' => ['nullable', 'string', 'max:10000'],
                'richtext' => ['nullable', 'array'],
                'tags' => ['nullable', 'array', 'max:60'],
                'boolean' => ['nullable', 'boolean'],
                'number', 'media' => ['nullable', 'integer', 'min:1'],
                'select' => ['nullable', 'string', 'max:160', Rule::in($field['options'])],
                default => ['nullable', 'string', 'max:1000'],
            };
            if (in_array($field['type'], ['richtext', 'tags'], true)) {
                $base[] = $field['type'] === 'tags' ? 'distinct' : 'max:500';
            }
            if ($field['type'] === 'tags') {
                $rules["attributes.$key.*"] = ['string', 'max:80', 'distinct'];
            }
            if ($field['type'] === 'media') {
                $base[] = Rule::exists('media_assets', 'id')->whereNull('deleted_at');
            }
            if (($field['required'] ?? false) === true) {
                $base[0] = 'required';
            }
            $rules["attributes.$key"] = $base;
        }

        return $rules;
    }

    public function permission(string $module, string $action): string
    {
        $this->get($module);

        return "$module.$action";
    }
}
