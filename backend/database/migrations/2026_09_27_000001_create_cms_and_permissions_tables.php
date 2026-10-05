<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 80);
            $table->string('slug', 80)->unique();
            $table->text('description')->nullable();
            $table->boolean('is_system')->default(false);
            $table->timestamps();
        });
        Schema::create('permissions', function (Blueprint $table): void {
            $table->id();
            $table->string('key', 120)->unique();
            $table->string('label', 140);
            $table->string('group', 80)->index();
            $table->timestamps();
        });
        Schema::create('permission_role', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('permission_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['permission_id', 'role_id']);
        });
        foreach ([['Administrator', 'admin', true], ['Member', 'member', true]] as [$name, $slug, $system]) {
            DB::table('roles')->insert(['name' => $name, 'slug' => $slug, 'is_system' => $system, 'created_at' => now(), 'updated_at' => now()]);
        }
        $modules = ['dashboard', 'users', 'roles', 'services', 'solutions', 'portfolio', 'clients', 'testimonials', 'team', 'technologies', 'industries', 'blog', 'pages', 'menus', 'media', 'enquiries', 'seo', 'settings'];
        $permissions = [['key' => '*', 'label' => 'All workspace permissions', 'group' => 'system', 'created_at' => now(), 'updated_at' => now()]];
        foreach ($modules as $module) {
            foreach (['view', 'create', 'update', 'delete', 'publish'] as $action) {
                $permissions[] = ['key' => "$module.$action", 'label' => ucfirst($action).' '.ucfirst($module), 'group' => $module, 'created_at' => now(), 'updated_at' => now()];
            }
        }
        foreach (['enquiries.assign' => 'Assign enquiries', 'enquiries.export' => 'Export enquiries', 'users.manage' => 'Manage user accounts', 'roles.manage' => 'Manage roles and permissions'] as $key => $label) {
            $permissions[] = ['key' => $key, 'label' => $label, 'group' => explode('.', $key)[0], 'created_at' => now(), 'updated_at' => now()];
        }
        DB::table('permissions')->insert($permissions);
        $adminId = DB::table('roles')->where('slug', 'admin')->value('id');
        $permissionIds = DB::table('permissions')->pluck('id')->map(fn ($id) => ['role_id' => $adminId, 'permission_id' => $id, 'created_at' => now(), 'updated_at' => now()])->all();
        DB::table('permission_role')->insert($permissionIds);

        Schema::create('content_items', function (Blueprint $table): void {
            $table->id();
            $table->string('type', 40);
            $table->string('title', 180);
            $table->string('slug', 200);
            $table->string('summary', 500)->nullable();
            $table->json('body')->nullable();
            $table->json('attributes')->nullable();
            $table->string('status', 20)->default('draft');
            $table->boolean('featured')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['type', 'slug']);
            $table->index(['type', 'status', 'sort_order']);
            $table->index(['type', 'published_at']);
        });
        Schema::create('content_taxonomies', function (Blueprint $table): void {
            $table->id();
            $table->string('type', 20);
            $table->string('name', 100);
            $table->string('slug', 120);
            $table->text('description')->nullable();
            $table->timestamps();
            $table->unique(['type', 'slug']);
        });
        Schema::create('content_taxonomy', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('content_item_id')->constrained('content_items')->cascadeOnDelete();
            $table->foreignId('content_taxonomy_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['content_item_id', 'content_taxonomy_id']);
        });
        Schema::create('media_assets', function (Blueprint $table): void {
            $table->id();
            $table->uuid()->unique();
            $table->string('disk', 30);
            $table->string('path', 500);
            $table->string('original_name', 255);
            $table->string('mime_type', 120);
            $table->string('extension', 16);
            $table->unsignedBigInteger('size');
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->string('alt_text', 255)->default('');
            $table->string('caption', 500)->nullable();
            $table->boolean('is_public')->default(false);
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['mime_type', 'created_at']);
        });
        Schema::create('content_media', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('content_item_id')->constrained('content_items')->cascadeOnDelete();
            $table->foreignId('media_asset_id')->constrained('media_assets')->cascadeOnDelete();
            $table->string('role', 32)->default('gallery');
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('alt_text', 255)->nullable();
            $table->timestamps();
            $table->unique(['content_item_id', 'media_asset_id', 'role']);
        });
        Schema::create('enquiries', function (Blueprint $table): void {
            $table->id();
            $table->string('reference', 18)->unique();
            $table->string('name', 120);
            $table->string('email', 254)->index();
            $table->string('phone', 40)->nullable();
            $table->string('company', 160)->nullable();
            $table->string('project_type', 80)->nullable();
            $table->string('budget', 80)->nullable();
            $table->text('message');
            $table->string('status', 20)->default('new')->index();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->string('source', 120)->nullable();
            $table->string('ip_hash', 64)->nullable()->index();
            $table->timestamp('contacted_at')->nullable();
            $table->timestamp('won_at')->nullable();
            $table->timestamp('lost_at')->nullable();
            $table->timestamp('consented_at');
            $table->timestamps();
            $table->softDeletes();
            $table->index(['status', 'created_at']);
        });
        Schema::create('enquiry_notes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('enquiry_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->text('note');
            $table->timestamps();
        });
        Schema::create('enquiry_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('enquiry_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('event', 40);
            $table->string('previous_value', 160)->nullable();
            $table->string('new_value', 160)->nullable();
            $table->timestamp('created_at')->useCurrent()->index();
        });
        Schema::create('site_settings', function (Blueprint $table): void {
            $table->id();
            $table->string('key', 100)->unique();
            $table->string('group', 40)->index();
            $table->json('value')->nullable();
            $table->string('type', 20)->default('text');
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
        Schema::create('admin_activity_logs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 60);
            $table->string('entity_type', 60)->nullable();
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->json('context')->nullable();
            $table->timestamp('created_at')->useCurrent()->index();
            $table->index(['entity_type', 'entity_id']);
        });
        Schema::create('blog_post_categories', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('content_item_id')->constrained('content_items')->cascadeOnDelete();
            $table->foreignId('content_taxonomy_id')->constrained('content_taxonomies')->cascadeOnDelete();
            $table->unique('content_item_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_post_categories');
        Schema::dropIfExists('admin_activity_logs');
        Schema::dropIfExists('site_settings');
        Schema::dropIfExists('enquiry_events');
        Schema::dropIfExists('enquiry_notes');
        Schema::dropIfExists('enquiries');
        Schema::dropIfExists('content_media');
        Schema::dropIfExists('media_assets');
        Schema::dropIfExists('content_taxonomy');
        Schema::dropIfExists('content_taxonomies');
        Schema::dropIfExists('content_items');
        Schema::dropIfExists('permission_role');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
    }
};
