<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\MediaAsset;
use Illuminate\Support\Facades\Storage;

class PublicMediaController extends Controller
{
    public function show(MediaAsset $media)
    {
        abort_unless($media->is_public && Storage::disk($media->disk)->exists($media->path), 404);

        return Storage::disk($media->disk)->response($media->path, $media->original_name, ['Content-Type' => $media->mime_type, 'X-Content-Type-Options' => 'nosniff', 'Cache-Control' => 'public, max-age=86400, s-maxage=86400']);
    }
}
