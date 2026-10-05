<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ContentItemResource;
use App\Models\ContentItem;
use App\Services\ContentModuleRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicContentController extends Controller
{
    public function __construct(private readonly ContentModuleRegistry $registry) {}

    public function index(Request $request, string $module): JsonResponse
    {
        abort_unless(in_array($module, $this->registry->keys(), true), 404);
        $spec = $this->registry->get($module);
        $query = ContentItem::where('type', $spec['type'])->where('status', 'published')->where(fn ($query) => $query->whereNull('published_at')->orWhere('published_at', '<=', now()));
        if ($request->filled('featured')) {
            $query->where('featured', $request->boolean('featured'));
        }
        if ($request->filled('search')) {
            $query->where('title', 'like', '%'.mb_substr((string) $request->query('search'), 0, 80).'%');
        }
        $items = $query->with(['media' => fn ($media) => $media->where('is_public', true), 'taxonomies', 'categories'])->orderBy('sort_order')->orderByDesc('published_at')->paginate(min(max((int) $request->query('per_page', 20), 1), 50));

        return response()->json(['data' => ContentItemResource::collection($items)->resolve(), 'meta' => ['current_page' => $items->currentPage(), 'last_page' => $items->lastPage(), 'total' => $items->total()]])->header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    }

    public function show(string $module, string $slug): ContentItemResource
    {
        abort_unless(in_array($module, $this->registry->keys(), true), 404);
        $item = ContentItem::where('type', $this->registry->get($module)['type'])->where('slug', $slug)->where('status', 'published')->where(fn ($query) => $query->whereNull('published_at')->orWhere('published_at', '<=', now()))->with(['media' => fn ($media) => $media->where('is_public', true), 'taxonomies', 'categories'])->firstOrFail();

        return new ContentItemResource($item);
    }
}
