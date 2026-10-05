<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class ActivityLogger
{
    public function record(?int $userId, string $action, ?string $entity = null, ?int $entityId = null, array $context = []): void
    {
        DB::table('admin_activity_logs')->insert([
            'user_id' => $userId, 'action' => $action, 'entity_type' => $entity, 'entity_id' => $entityId,
            'context' => $context === [] ? null : json_encode($context, JSON_THROW_ON_ERROR), 'created_at' => now(),
        ]);
    }
}
