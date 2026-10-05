<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaxonomyResource;
use App\Models\ContentItem;
use App\Models\ContentTaxonomy;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class TaxonomyController extends Controller
{
    public function index(Request $request, string $type): JsonResponse
    {
        $items = ContentTaxonomy::where('type', $type)->orderBy('name')->paginate(min(max($request->integer('per_page', 50), 1), 100));
        $items->getCollection()->each(function (ContentTaxonomy $taxonomy) use ($type): void {
            $table = $type === 'category' ? 'blog_post_categories' : 'content_taxonomy';
            $taxonomy->setAttribute('content_count', DB::table($table)->join('content_items', 'content_items.id', '=', "$table.content_item_id")->where("$table.content_taxonomy_id", $taxonomy->id)->where('content_items.type', 'blog')->whereNull('content_items.deleted_at')->count());
        });

        return response()->json(['data' => TaxonomyResource::collection($items)->resolve(), 'meta' => ['total' => $items->total()]]);
    }

    public function store(Request $request, string $type, ActivityLogger $activity): JsonResponse
    {
        $data = $this->validated($request, $type);
        $taxonomy = ContentTaxonomy::create(['type' => $type, 'name' => $data['name'], 'slug' => $data['slug'] ?: Str::slug($data['name']), 'description' => $data['description'] ?? null]);
        $activity->record($request->user()->id, 'created', 'blog_'.$type, $taxonomy->id);

        return response()->json(['data' => new TaxonomyResource($taxonomy)], 201);
    }

    public function update(Request $request, ContentTaxonomy $taxonomy, ActivityLogger $activity): TaxonomyResource
    {
        $data = $this->validated($request, $taxonomy->type, $taxonomy->id);
        $taxonomy->update(['name' => $data['name'], 'slug' => $data['slug'] ?: Str::slug($data['name']), 'description' => $data['description'] ?? null]);
        $activity->record($request->user()->id, 'updated', 'blog_'.$taxonomy->type, $taxonomy->id);

        return new TaxonomyResource($taxonomy->fresh());
    }

    public function destroy(Request $request, ContentTaxonomy $taxonomy, ActivityLogger $activity): JsonResponse
    {
        abort_if(DB::table('blog_post_categories')->where('content_taxonomy_id', $taxonomy->id)->exists() || DB::table('content_taxonomy')->where('content_taxonomy_id', $taxonomy->id)->exists(), 409, 'Remove this category or tag from published articles before deleting it.');
        $activity->record($request->user()->id, 'deleted', 'blog_'.$taxonomy->type, $taxonomy->id);
        $taxonomy->delete();

        return response()->json(['message' => ucfirst($taxonomy->type).' deleted.']);
    }

    public function assignCategory(Request $request, ContentItem $content, ActivityLogger $activity): JsonResponse
    {
        abort_unless($content->type === 'blog', 404);
        $data = $request->validate(['category_id' => ['nullable', 'integer', Rule::exists('content_taxonomies', 'id')->where('type', 'category')]]);
        DB::table('blog_post_categories')->where('content_item_id', $content->id)->delete();
        if (! empty($data['category_id'])) {
            DB::table('blog_post_categories')->insert(['content_item_id' => $content->id, 'content_taxonomy_id' => $data['category_id']]);
        }
        $activity->record($request->user()->id, 'category_assigned', 'blog', $content->id);

        return response()->json(['message' => 'Article category updated.']);
    }

    public function assignTags(Request $request, ContentItem $content, ActivityLogger $activity): JsonResponse
    {
        abort_unless($content->type === 'blog', 404);
        $data = $request->validate(['tag_ids' => ['sometimes', 'array', 'max:30'], 'tag_ids.*' => ['integer', 'distinct', Rule::exists('content_taxonomies', 'id')->where('type', 'tag')]]);
        $content->taxonomies()->sync($data['tag_ids'] ?? []);
        $activity->record($request->user()->id, 'tags_updated', 'blog', $content->id);

        return response()->json(['message' => 'Article tags updated.']);
    }

    private function validated(Request $request, string $type, ?int $id = null): array
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:100'], 'slug' => ['nullable', 'string', 'max:120', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('content_taxonomies', 'slug')->where('type', $type)->ignore($id)],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);
        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
        $data = $validator->validated();
        $data['slug'] = mb_strtolower($data['slug'] ?: Str::slug($data['name']));

        return $data;
    }
}
