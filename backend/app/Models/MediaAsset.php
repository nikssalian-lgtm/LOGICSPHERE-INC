<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class MediaAsset extends Model
{
    use SoftDeletes;

    protected $fillable = ['uuid', 'disk', 'path', 'original_name', 'mime_type', 'extension', 'size', 'width', 'height', 'duration', 'alt_text', 'caption', 'visibility', 'uploaded_by'];

    protected function casts(): array
    {
        return ['size' => 'integer', 'width' => 'integer', 'height' => 'integer'];
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function content(): BelongsToMany
    {
        return $this->belongsToMany(ContentItem::class, 'content_media')->withPivot(['role', 'sort_order', 'alt_text'])->withTimestamps();
    }
}
