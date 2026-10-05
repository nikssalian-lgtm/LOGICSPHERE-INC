<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MediaAssetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id, 'uuid' => $this->uuid, 'name' => $this->original_name,
            'mime_type' => $this->mime_type, 'extension' => $this->extension, 'size' => $this->size,
            'width' => $this->width, 'height' => $this->height, 'alt_text' => $this->alt_text,
            'caption' => $this->caption, 'is_public' => $this->is_public,
            'preview_url' => route('admin.media.file', $this->id, false),
            'public_url' => $this->is_public ? route('public.media.file', $this->id, false) : null,
            'used_in' => $this->whenLoaded('content', fn () => $this->content->map(fn ($item) => ['id' => $item->id, 'title' => $item->title, 'type' => $item->type])),
            'created_at' => $this->created_at,
        ];
    }
}
