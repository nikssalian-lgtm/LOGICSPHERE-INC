<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\MediaAssetResource;
use App\Models\MediaAsset;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MediaAsset::query()->with('content:id,title,type')->orderByDesc('created_at');
        if ($request->filled('search')) {
            $term = mb_substr(trim((string) $request->query('search')), 0, 100);
            $query->where(fn ($q) => $q->where('original_name', 'like', "%$term%")->orWhere('alt_text', 'like', "%$term%"));
        }
        if ($request->filled('kind')) {
            $query->where('mime_type', 'like', $request->query('kind') === 'image' ? 'image/%' : 'video/%');
        }
        $items = $query->paginate(min(max($request->integer('per_page', 30), 1), 100));

        return response()->json(['data' => MediaAssetResource::collection($items)->resolve(), 'meta' => ['total' => $items->total(), 'current_page' => $items->currentPage(), 'last_page' => $items->lastPage()]]);
    }

    public function store(Request $request, ActivityLogger $activity): JsonResponse
    {
        $request->validate(['file' => ['required', 'file', 'mimes:jpg,jpeg,png,gif,webp,avif,mp4,webm,mov', 'max:102400'], 'alt_text' => ['nullable', 'string', 'max:255'], 'caption' => ['nullable', 'string', 'max:500']]);
        $file = $request->file('file');
        $mime = $file->getMimeType();
        abort_unless(is_string($mime) && (str_starts_with($mime, 'image/') || str_starts_with($mime, 'video/')), 422, 'Only supported image and video files can be uploaded.');
        $dimensions = false;
        if (str_starts_with($mime, 'image/')) {
            abort_if($file->getSize() > 20 * 1024 * 1024, 422, 'Images must be 20 MB or smaller.');
            $dimensions = @getimagesize($file->getRealPath());
            abort_unless($dimensions !== false, 422, 'The uploaded image could not be decoded.');
            abort_if($dimensions[0] > 12000 || $dimensions[1] > 12000 || $dimensions[0] * $dimensions[1] > 50000000, 422, 'The image dimensions are too large.');
        }
        $path = $file->store('media/'.now()->format('Y/m'), 'local');
        $asset = MediaAsset::create(['uuid' => (string) Str::uuid(), 'disk' => 'local', 'path' => $path, 'original_name' => mb_substr($file->getClientOriginalName(), 0, 255), 'mime_type' => $mime, 'extension' => strtolower($file->guessExtension() ?: $file->getClientOriginalExtension()), 'size' => $file->getSize(), 'width' => $dimensions[0] ?? null, 'height' => $dimensions[1] ?? null, 'alt_text' => $request->string('alt_text')->limit(255)->toString(), 'caption' => $request->input('caption'), 'is_public' => false, 'uploaded_by' => $request->user()->id]);
        $activity->record($request->user()->id, 'uploaded', 'media', $asset->id);

        return response()->json(['data' => new MediaAssetResource($asset)], 201);
    }

    public function show(MediaAsset $media): MediaAssetResource
    {
        return new MediaAssetResource($media->load('content:id,title,type'));
    }

    public function preview(MediaAsset $media)
    {
        abort_unless(Storage::disk($media->disk)->exists($media->path), 404);

        return Storage::disk($media->disk)->response($media->path, $media->original_name, ['Content-Type' => $media->mime_type, 'X-Content-Type-Options' => 'nosniff', 'Cache-Control' => 'private, max-age=300']);
    }

    public function update(Request $request, MediaAsset $media, ActivityLogger $activity): MediaAssetResource
    {
        $data = $request->validate(['alt_text' => ['sometimes', 'string', 'max:255'], 'caption' => ['sometimes', 'nullable', 'string', 'max:500'], 'is_public' => ['sometimes', 'boolean']]);
        if (array_key_exists('is_public', $data) && ! $request->user()->hasPermission('media.publish')) {
            abort(403);
        }
        $media->update($data);
        $activity->record($request->user()->id, 'updated', 'media', $media->id);

        return new MediaAssetResource($media->fresh()->load('content:id,title,type'));
    }

    public function destroy(Request $request, MediaAsset $media, ActivityLogger $activity): JsonResponse
    {
        abort_if($media->content()->exists(), 409, 'This file is in use. Remove it from linked content before archiving.');
        $media->delete();
        $activity->record($request->user()->id, 'archived', 'media', $media->id);

        return response()->json(['message' => 'Media archived.']);
    }
}
