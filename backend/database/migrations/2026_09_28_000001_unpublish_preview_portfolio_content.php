<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('content_items')
            ->whereIn('slug', [
                'client-name-placeholder',
                'project-placeholder-software',
                'project-placeholder-digital-experience',
                'project-placeholder-mobile-application',
            ])
            ->whereIn('type', ['client', 'project'])
            ->update([
                'status' => 'draft',
                'featured' => false,
                'published_at' => null,
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        // These records are explicitly fictitious preview content and must stay unpublished.
    }
};
