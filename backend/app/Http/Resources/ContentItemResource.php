<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContentItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id, 'type' => $this->type, 'title' => $this->title, 'slug' => $this->slug,
            'summary' => $this->summary, 'body' => $this->body, 'status' => $this->status,
            'featured' => $this->featured, 'sort_order' => $this->sort_order, 'published_at' => $this->published_at,
            'attributes' => $this->attributes ?? [], 'media' => MediaAssetResource::collection($this->whenLoaded('media')),
            'taxonomies' => TaxonomyResource::collection($this->whenLoaded('taxonomies')),
            'categories' => TaxonomyResource::collection($this->whenLoaded('categories')),
            'created_at' => $this->created_at, 'updated_at' => $this->updated_at,
        ];
    }
}
