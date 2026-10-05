<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ContentItemResource;
use App\Models\ContentItem;
use App\Services\ActivityLogger;
use App\Services\ContentModuleRegistry;
use App\Services\RichBodySanitizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ContentController extends Controller
{
    public function __construct(private readonly ContentModuleRegistry $registry, private readonly ActivityLogger $activity, private readonly RichBodySanitizer $sanitizer) {}

    public function modules(Request $request): JsonResponse
    {
        $user = $request->user();
        $modules = collect($this->registry->all())->map(function ($spec, $key) use ($user) {
            return ['key' => $key, 'label' => $spec['label'], 'item' => $spec['item'], 'icon' => $spec['icon'], 'permissions' => collect(['view', 'create', 'update', 'delete', 'publish'])->filter(fn ($action) => $user->hasPermission("$key.$action"))->values()];
        })->filter(fn ($spec) => $spec['permissions']->isNotEmpty())->values();

        return response()->json(['data' => $modules]);
    }

    public function index(Request $request, string $module): JsonResponse
    {
        $spec = $this->registry->get($module);
        $query = ContentItem::query()->where('type', $spec['type']);
        if ($request->boolean('archived')) {
            $query->onlyTrashed();
        }
        if ($request->filled('search')) {
            $term = mb_substr(trim((string) $request->query('search')), 0, 100);
            $query->where(fn ($q) => $q->where('title', 'like', "%$term%")->orWhere('slug', 'like', "%$term%")->orWhere('summary', 'like', "%$term%"));
        }
        if (in_array($request->query('status'), ['draft', 'published'], true)) {
            $query->where('status', $request->query('status'));
        }
        if ($request->filled('featured')) {
            $query->where('featured', $request->boolean('featured'));
        }
        $sort = in_array($request->query('sort'), ['title', 'sort_order', 'created_at', 'updated_at', 'published_at'], true) ? $request->query('sort') : 'sort_order';
        $direction = $request->query('direction') === 'asc' ? 'asc' : 'desc';
        $items = $query->with(['media', 'taxonomies', 'categories'])->orderBy($sort, $direction)->orderByDesc('id')->paginate(min(max((int) $request->query('per_page', 20), 1), 100));

        return response()->json(['data' => ContentItemResource::collection($items)->resolve(), 'meta' => ['current_page' => $items->currentPage(), 'last_page' => $items->lastPage(), 'per_page' => $items->perPage(), 'total' => $items->total()], 'module' => ['key' => $module, 'label' => $spec['label'], 'item' => $spec['item'], 'fields' => $spec['fields'], 'has_summary' => $spec['summary'], 'has_body' => $spec['body']]]);
    }

    public function show(string $module, ContentItem $content): ContentItemResource
    {
        $this->assertType($module, $content);

        return new ContentItemResource($content->load(['media', 'taxonomies', 'categories']));
    }

    public function store(Request $request, string $module): JsonResponse
    {
        $spec = $this->registry->get($module);
        $input = $this->validateInput($request, $module);
        $title = $input['title'];
        $record = DB::transaction(function () use ($request, $spec, $module, $input, $title): ContentItem {
            $item = ContentItem::create([
                'type' => $spec['type'], 'title' => $title, 'slug' => $input['slug'] ?: Str::slug($title),
                'summary' => $input['summary'] ?? null, 'body' => $this->sanitizer->clean($input['body'] ?? null),
                'attributes' => $this->attributes($module, $input['attributes'] ?? []),
                'status' => 'draft', 'featured' => $input['featured'] ?? false, 'sort_order' => $input['sort_order'] ?? 0,
                'created_by' => $request->user()->id, 'updated_by' => $request->user()->id,
            ]);
            $this->syncMedia($item, $input['media_ids'] ?? []);

            return $item;
        });
        $this->activity->record($request->user()->id, 'created', $module, $record->id);

        return response()->json(['data' => new ContentItemResource($record->load(['media', 'taxonomies', 'categories']))], 201);
    }

    public function update(Request $request, string $module, ContentItem $content): ContentItemResource
    {
        $this->assertType($module, $content);
        $input = $this->validateInput($request, $module, $content->id);
        if (array_key_exists('status', $input) && $input['status'] !== $content->status) {
            throw ValidationException::withMessages(['status' => ['Use the publish or unpublish action to change publication status.']]);
        }
        DB::transaction(function () use ($request, $module, $input, $content): void {
            $content->fill([
                'title' => $input['title'], 'slug' => $input['slug'] ?: Str::slug($input['title']),
                'summary' => $input['summary'] ?? null, 'body' => $this->sanitizer->clean($input['body'] ?? null),
                'attributes' => $this->attributes($module, $input['attributes'] ?? []),
                'featured' => $input['featured'] ?? false, 'sort_order' => $input['sort_order'] ?? 0,
                'updated_by' => $request->user()->id,
            ])->save();
            if (array_key_exists('media_ids', $input)) {
                $this->syncMedia($content, $input['media_ids']);
            }
        });
        $this->activity->record($request->user()->id, 'updated', $module, $content->id);

        return new ContentItemResource($content->fresh()->load(['media', 'taxonomies', 'categories']));
    }

    public function publish(Request $request, string $module, ContentItem $content): ContentItemResource
    {
        $this->assertType($module, $content);
        $action = $request->boolean('publish', true) ? 'published' : 'draft';
        $content->forceFill(['status' => $action, 'published_at' => $action === 'published' ? ($content->published_at ?? now()) : null, 'updated_by' => $request->user()->id])->save();
        $this->activity->record($request->user()->id, $action, $module, $content->id);

        return new ContentItemResource($content->fresh()->load(['media', 'taxonomies', 'categories']));
    }

    public function destroy(Request $request, string $module, ContentItem $content): JsonResponse
    {
        $this->assertType($module, $content);
        $content->delete();
        $this->activity->record($request->user()->id, 'archived', $module, $content->id);

        return response()->json(['message' => $this->registry->get($module)['item'].' archived.']);
    }

    public function restore(Request $request, string $module, ContentItem $content): ContentItemResource
    {
        $this->assertType($module, $content);
        abort_unless($content->trashed(), 409, 'This item is already active.');
        $content->restore();
        $content->forceFill(['updated_by' => $request->user()->id])->save();
        $this->activity->record($request->user()->id, 'restored', $module, $content->id);

        return new ContentItemResource($content->fresh()->load(['media', 'taxonomies', 'categories']));
    }

    private function validateInput(Request $request, string $module, ?int $id = null): array
    {
        $data = $request->all();
        $validator = Validator::make($data, $this->registry->validation($module, $id));
        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
        $input = $validator->validated();
        if (empty($input['slug'])) {
            $input['slug'] = Str::slug($input['title']);
        }
        if ($input['slug'] === '') {
            throw ValidationException::withMessages(['title' => ['Add a title that can be used to create a URL.']]);
        }
        $input['slug'] = mb_strtolower($input['slug']);

        return $input;
    }

    private function attributes(string $module, array $attributes): array
    {
        $fields = $this->registry->get($module)['fields'];
        $result = array_intersect_key($attributes, array_flip(array_keys($fields)));
        foreach ($fields as $key => $field) {
            if (($field['type'] ?? null) === 'richtext' && isset($result[$key])) {
                $result[$key] = $this->sanitizer->clean($result[$key]);
            }
        }

        return $result;
    }

    private function syncMedia(ContentItem $item, array $ids): void
    {
        $item->media()->sync(collect($ids)->mapWithKeys(fn ($id, $index) => [$id => ['role' => $index === 0 ? 'featured' : 'gallery', 'sort_order' => $index]])->all());
    }

    private function assertType(string $module, ContentItem $content): void
    {
        abort_unless($content->type === $this->registry->get($module)['type'], 404);
    }
}
