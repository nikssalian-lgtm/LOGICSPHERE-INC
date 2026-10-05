<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class RoleController extends Controller
{
    public function index(): JsonResponse
    {
        $roles = Role::with(['permissions'])->withCount('users')->orderBy('name')->paginate(50);

        return response()->json(['data' => $roles->getCollection()->map(fn ($role) => $this->resource($role)), 'meta' => ['total' => $roles->total()]]);
    }

    public function permissions(): JsonResponse
    {
        return response()->json(['data' => Permission::where('key', '!=', '*')->orderBy('group')->orderBy('key')->get(['id', 'key', 'label', 'group'])]);
    }

    public function store(Request $request, ActivityLogger $activity): JsonResponse
    {
        $data = $this->validateRoleInput($request, null);
        $slug = Str::slug($data['name']);
        if (Role::where('slug', $slug)->exists()) {
            throw ValidationException::withMessages(['name' => ['A role with this name already exists.']]);
        }
        $role = DB::transaction(function () use ($data, $slug): Role {
            $role = Role::create(['name' => $data['name'], 'slug' => $slug, 'description' => $data['description'] ?? null, 'is_system' => false]);
            $role->permissions()->sync($data['permission_ids'] ?? []);

            return $role->load('permissions');
        });
        $activity->record($request->user()->id, 'created', 'role', $role->id);

        return response()->json(['data' => $this->resource($role)], 201);
    }

    public function update(Request $request, Role $role, ActivityLogger $activity): JsonResponse
    {
        $data = $this->validateRoleInput($request, $role);
        if ($role->slug === 'admin' && ! in_array((int) Permission::where('key', '*')->value('id'), array_map('intval', $data['permission_ids'] ?? []), true)) {
            throw ValidationException::withMessages(['permission_ids' => ['The administrator role must retain full workspace access.']]);
        }
        if ($role->slug !== 'admin' && $role->slug !== Str::slug($data['name']) && Role::where('slug', Str::slug($data['name']))->exists()) {
            throw ValidationException::withMessages(['name' => ['A role with this name already exists.']]);
        }
        DB::transaction(function () use ($data, $role, $request): void {
            $oldSlug = $role->slug;
            if (! $role->is_system) {
                $role->slug = Str::slug($data['name']);
            }
            $role->name = $data['name'];
            $role->description = $data['description'] ?? null;
            $role->save();
            if ($oldSlug !== $role->slug) {
                DB::table('users')->where('role', $oldSlug)->update(['role' => $role->slug, 'remember_token' => Str::random(60)]);
            }
            $role->permissions()->sync($data['permission_ids'] ?? []);
            DB::table('users')->where('role', $role->slug)->where('id', '!=', $request->user()->id)->update(['remember_token' => Str::random(60)]);
        });
        $activity->record($request->user()->id, 'updated', 'role', $role->id);

        return response()->json(['data' => $this->resource($role->fresh()->load('permissions'))]);
    }

    public function destroy(Request $request, Role $role, ActivityLogger $activity): JsonResponse
    {
        abort_if($role->is_system || $role->users()->exists(), 409, 'System roles and roles assigned to users cannot be deleted.');
        $activity->record($request->user()->id, 'deleted', 'role', $role->id);
        $role->delete();

        return response()->json(['message' => 'Role deleted.']);
    }

    private function validateRoleInput(Request $request, ?Role $role): array
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:80', Rule::unique('roles', 'name')->ignore($role?->id)],
            'description' => ['nullable', 'string', 'max:500'], 'permission_ids' => ['sometimes', 'array', 'max:100'],
            'permission_ids.*' => ['integer', 'distinct', 'exists:permissions,id'],
        ]);
        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
        $data = $validator->validated();
        $allAccessId = Permission::where('key', '*')->value('id');
        if (in_array((int) $allAccessId, array_map('intval', $data['permission_ids'] ?? []), true) && $role?->slug !== 'admin') {
            throw ValidationException::withMessages(['permission_ids' => ['Full workspace access is reserved for administrators.']]);
        }

        return $data;
    }

    private function resource(Role $role): array
    {
        return ['id' => $role->id, 'name' => $role->name, 'slug' => $role->slug, 'description' => $role->description, 'is_system' => $role->is_system, 'users_count' => $role->users_count ?? $role->users()->count(), 'permissions' => $role->permissions->map(fn ($permission) => ['id' => $permission->id, 'key' => $permission->key, 'label' => $permission->label, 'group' => $permission->group])->values()];
    }
}
