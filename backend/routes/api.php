<?php

use App\Http\Controllers\Api\V1\Admin\ActivityController;
use App\Http\Controllers\Api\V1\Admin\ContentController;
use App\Http\Controllers\Api\V1\Admin\EnquiryController;
use App\Http\Controllers\Api\V1\Admin\MediaController;
use App\Http\Controllers\Api\V1\Admin\RoleController;
use App\Http\Controllers\Api\V1\Admin\SettingsController;
use App\Http\Controllers\Api\V1\Admin\TaxonomyController;
use App\Http\Controllers\Api\V1\Admin\UserController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\OverviewController;
use App\Http\Controllers\Api\V1\PublicContentController;
use App\Http\Controllers\Api\V1\PublicMediaController;
use App\Http\Controllers\Api\V1\PublicSettingsController;
use App\Models\ContentItem;
use App\Services\ContentModuleRegistry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware('throttle:api')->group(function (): void {
    Route::get('health', HealthController::class);
    Route::post('enquiries', [EnquiryController::class, 'submit'])->middleware('throttle:enquiry');
    Route::get('public/content/{module}', [PublicContentController::class, 'index']);
    Route::get('public/content/{module}/{slug}', [PublicContentController::class, 'show']);
    Route::get('public/media/{media}/file', [PublicMediaController::class, 'show'])->whereNumber('media')->name('public.media.file');
    Route::get('public/settings', [PublicSettingsController::class, 'index']);
    Route::get('public/settings/{group}', PublicSettingsController::class)->whereIn('group', ['site', 'seo', 'contact', 'social']);
    // Sanctum's stateful middleware already validates the web session password hash.
    Route::middleware(['auth:sanctum', 'active'])->group(function (): void {
        Route::get('auth/user', [AuthController::class, 'user']);
        Route::get('admin/overview', OverviewController::class)->middleware('permission:dashboard.view');
        Route::get('admin/content/modules', [ContentController::class, 'modules'])->middleware('permission:dashboard.view');
        foreach (app(ContentModuleRegistry::class)->keys() as $module) {
            $base = "admin/content/$module";
            Route::get($base, fn (Request $request) => app(ContentController::class)->index($request, $module))->middleware("permission:$module.view");
            Route::post($base, fn (Request $request) => app(ContentController::class)->store($request, $module))->middleware("permission:$module.create");
            Route::get("$base/{content}", fn (ContentItem $content) => app(ContentController::class)->show($module, $content))->middleware("permission:$module.view")->whereNumber('content');
            Route::match(['put', 'patch'], "$base/{content}", fn (Request $request, ContentItem $content) => app(ContentController::class)->update($request, $module, $content))->middleware("permission:$module.update")->whereNumber('content');
            Route::post("$base/{content}/publication", fn (Request $request, ContentItem $content) => app(ContentController::class)->publish($request, $module, $content))->middleware("permission:$module.publish")->whereNumber('content');
            Route::post("$base/{content}/restore", fn (Request $request, ContentItem $content) => app(ContentController::class)->restore($request, $module, $content))->middleware("permission:$module.update")->withTrashed()->whereNumber('content');
            Route::delete("$base/{content}", fn (Request $request, ContentItem $content) => app(ContentController::class)->destroy($request, $module, $content))->middleware("permission:$module.delete")->whereNumber('content');
        }
        Route::get('admin/blog/taxonomies/{type}', [TaxonomyController::class, 'index'])->middleware('permission:blog.view')->whereIn('type', ['category', 'tag']);
        Route::post('admin/blog/taxonomies/{type}', [TaxonomyController::class, 'store'])->middleware('permission:blog.update')->whereIn('type', ['category', 'tag']);
        Route::patch('admin/blog/taxonomies/{taxonomy}', [TaxonomyController::class, 'update'])->middleware('permission:blog.update')->whereNumber('taxonomy');
        Route::delete('admin/blog/taxonomies/{taxonomy}', [TaxonomyController::class, 'destroy'])->middleware('permission:blog.update')->whereNumber('taxonomy');
        Route::post('admin/blog/{content}/category', [TaxonomyController::class, 'assignCategory'])->middleware('permission:blog.update')->whereNumber('content');
        Route::post('admin/blog/{content}/tags', [TaxonomyController::class, 'assignTags'])->middleware('permission:blog.update')->whereNumber('content');
        Route::get('admin/media', [MediaController::class, 'index'])->middleware('permission:media.view');
        Route::post('admin/media', [MediaController::class, 'store'])->middleware('permission:media.create');
        Route::get('admin/media/{media}', [MediaController::class, 'show'])->middleware('permission:media.view')->whereNumber('media');
        Route::get('admin/media/{media}/file', [MediaController::class, 'preview'])->middleware('permission:media.view')->whereNumber('media')->name('admin.media.file');
        Route::patch('admin/media/{media}', [MediaController::class, 'update'])->middleware('permission:media.update')->whereNumber('media');
        Route::delete('admin/media/{media}', [MediaController::class, 'destroy'])->middleware('permission:media.delete')->whereNumber('media');
        Route::get('admin/enquiries/export', [EnquiryController::class, 'export'])->middleware('permission:enquiries.export');
        Route::get('admin/enquiries', [EnquiryController::class, 'index'])->middleware('permission:enquiries.view');
        Route::get('admin/enquiries/{enquiry}', [EnquiryController::class, 'show'])->middleware('permission:enquiries.view')->whereNumber('enquiry');
        Route::patch('admin/enquiries/{enquiry}', [EnquiryController::class, 'update'])->middleware('permission:enquiries.update')->whereNumber('enquiry');
        Route::post('admin/enquiries/{enquiry}/restore', [EnquiryController::class, 'restore'])->middleware('permission:enquiries.update')->withTrashed()->whereNumber('enquiry');
        Route::post('admin/enquiries/{enquiry}/notes', [EnquiryController::class, 'note'])->middleware('permission:enquiries.update')->whereNumber('enquiry');
        Route::delete('admin/enquiries/{enquiry}', [EnquiryController::class, 'archive'])->middleware('permission:enquiries.delete')->whereNumber('enquiry');
        Route::get('admin/roles', [RoleController::class, 'index'])->middleware('permission:roles.view');
        Route::get('admin/permissions', [RoleController::class, 'permissions'])->middleware('permission:roles.view');
        Route::post('admin/roles', [RoleController::class, 'store'])->middleware('permission:roles.manage');
        Route::put('admin/roles/{role}', [RoleController::class, 'update'])->middleware('permission:roles.manage')->whereNumber('role');
        Route::delete('admin/roles/{role}', [RoleController::class, 'destroy'])->middleware('permission:roles.manage')->whereNumber('role');
        Route::get('admin/users', [UserController::class, 'index'])->middleware('permission:users.view');
        Route::post('admin/users', [UserController::class, 'store'])->middleware('permission:users.manage');
        Route::patch('admin/users/{user}', [UserController::class, 'update'])->middleware('permission:users.manage')->whereNumber('user');
        Route::delete('admin/users/{user}', [UserController::class, 'destroy'])->middleware('permission:users.manage')->whereNumber('user');
        Route::get('admin/settings/{group}', [SettingsController::class, 'show'])->middleware('permission:settings.view')->whereIn('group', ['site', 'contact', 'social']);
        Route::put('admin/settings/{group}', [SettingsController::class, 'update'])->middleware('permission:settings.update')->whereIn('group', ['site', 'contact', 'social']);
        Route::get('admin/settings/seo', [SettingsController::class, 'showSeo'])->middleware('permission:seo.view');
        Route::put('admin/settings/seo', [SettingsController::class, 'updateSeo'])->middleware('permission:seo.update');
        Route::get('admin/activity', [ActivityController::class, 'index'])->middleware('permission:dashboard.view');
    });
});
