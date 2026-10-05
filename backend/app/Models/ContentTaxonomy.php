<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ContentTaxonomy extends Model
{
    protected $fillable = ['type', 'name', 'slug', 'description'];

    public function content(): BelongsToMany
    {
        return $this->belongsToMany(ContentItem::class, 'content_taxonomy')->withTimestamps();
    }
}
