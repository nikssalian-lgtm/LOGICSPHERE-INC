<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $role = $this->resource->relationLoaded('assignedRole')
            ? $this->resource->assignedRole
            : $this->resource->assignedRole()->with('permissions')->first();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'permissions' => $role?->permissions->pluck('key')->all() ?? [],
            'active' => (bool) $this->is_active,
        ];
    }
}
