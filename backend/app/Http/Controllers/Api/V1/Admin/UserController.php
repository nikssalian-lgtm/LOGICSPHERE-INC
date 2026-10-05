<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query()->with('assignedRole.permissions')->withCount('assignedEnquiries');
        if ($request->filled('search')) {
            $term = mb_substr(trim((string) $request->query('search')), 0, 100);
            $query->where(fn ($q) => $q->where('name', 'like', "%$term%")->orWhere('email', 'like', "%$term%"));
        }
        if ($request->filled('role')) {
            $query->where('role', $request->query('role'));
        }
        $users = $query->orderBy('name')->paginate(min(max($request->integer('per_page', 30), 1), 100));

        return response()->json(['data' => UserResource::collection($users)->resolve(), 'meta' => ['total' => $users->total(), 'current_page' => $users->currentPage(), 'last_page' => $users->lastPage()], 'roles' => Role::orderBy('name')->get(['name', 'slug'])]);
    }

    public function store(Request $request, ActivityLogger $activity): JsonResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:100'], 'email' => ['required', 'email', 'max:254', 'unique:users,email'], 'role' => ['required', 'string', Rule::exists('roles', 'slug')], 'is_active' => ['sometimes', 'boolean']]);
        $user = User::forceCreate(['name' => $data['name'], 'email' => mb_strtolower($data['email']), 'password' => Hash::make(Str::random(64)), 'role' => $data['role'], 'is_active' => $data['is_active'] ?? true]);
        $sent = $user->isActive() ? Password::sendResetLink(['email' => $user->email]) === Password::RESET_LINK_SENT : false;
        $activity->record($request->user()->id, 'invited', 'user', $user->id);

        return response()->json(['data' => new UserResource($user->load('assignedRole.permissions')), 'message' => $sent ? 'Account created and password setup email queued.' : 'Account created. The user can set their password using Forgot password.'], 201);
    }

    public function update(Request $request, User $user, ActivityLogger $activity): UserResource
    {
        $data = $request->validate(['name' => ['sometimes', 'required', 'string', 'max:100'], 'email' => ['sometimes', 'required', 'email', 'max:254', Rule::unique('users', 'email')->ignore($user->id)], 'role' => ['sometimes', 'required', 'string', Rule::exists('roles', 'slug')], 'is_active' => ['sometimes', 'boolean']]);
        $removingAdmin = $user->isAdministrator() && (($data['role'] ?? $user->role) !== 'admin' || (array_key_exists('is_active', $data) && ! $data['is_active']));
        if ($removingAdmin && User::where('role', 'admin')->where('is_active', true)->count() < 2) {
            throw ValidationException::withMessages(['role' => ['Create or activate another administrator before changing the last active administrator.']]);
        }
        if ($user->is((int) $request->user()->id) && ($data['role'] ?? $user->role) !== 'admin') {
            throw ValidationException::withMessages(['role' => ['You cannot remove your own administrator access.']]);
        }
        $oldRole = $user->role;
        $user->fill(collect($data)->except('role')->all());
        if (array_key_exists('role', $data)) {
            $user->role = $data['role'];
        }
        if (isset($data['email']) && $data['email'] !== $user->getOriginal('email')) {
            $user->email_verified_at = null;
        }
        $user->remember_token = Str::random(60);
        $user->save();
        if (array_key_exists('is_active', $data) && ! $data['is_active']) {
            DB::table(config('session.table', 'sessions'))->where('user_id', $user->id)->delete();
        }
        $activity->record($request->user()->id, 'updated', 'user', $user->id, ['role_changed' => $oldRole !== $user->role]);

        return new UserResource($user->fresh()->load('assignedRole.permissions'));
    }

    public function destroy(Request $request, User $user, ActivityLogger $activity): JsonResponse
    {
        abort_if($user->is((int) $request->user()->id), 409, 'You cannot disable your own account.');
        if ($user->isAdministrator() && User::where('role', 'admin')->where('is_active', true)->count() < 2) {
            abort(409, 'Create another administrator before disabling the last active administrator.');
        }
        $user->update(['is_active' => false, 'remember_token' => Str::random(60)]);
        DB::table(config('session.table', 'sessions'))->where('user_id', $user->id)->delete();
        $activity->record($request->user()->id, 'disabled', 'user', $user->id);

        return response()->json(['message' => 'Account disabled.']);
    }
}
