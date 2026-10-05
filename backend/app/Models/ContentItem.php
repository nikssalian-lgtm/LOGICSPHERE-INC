<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContentItem extends Model
{
    use SoftDeletes;

    protected $fillable = ['type', 'title', 'slug', 'summary', 'body', 'attributes', 'status', 'featured', 'sort_order', 'published_at', 'created_by', 'updated_by'];

    protected function casts(): array
    {
        return ['body' => 'array', 'attributes' => 'array', 'featured' => 'boolean', 'published_at' => 'datetime'];
    }

    public function media(): BelongsToMany
    {
        return $this->belongsToMany(MediaAsset::class, 'content_media')->withPivot(['role', 'sort_order', 'alt_text'])->withTimestamps()->orderByPivot('sort_order');
    }

    public function taxonomies(): BelongsToMany
    {
        return $this->belongsToMany(ContentTaxonomy::class, 'content_taxonomy')->withTimestamps();
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(ContentTaxonomy::class, 'blog_post_categories', 'content_item_id', 'content_taxonomy_id');
    }
}
