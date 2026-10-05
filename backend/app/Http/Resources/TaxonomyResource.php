<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaxonomyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return ['id' => $this->id, 'type' => $this->type, 'name' => $this->name, 'slug' => $this->slug, 'description' => $this->description, 'content_count' => $this->content_count ?? 0];
    }
}
