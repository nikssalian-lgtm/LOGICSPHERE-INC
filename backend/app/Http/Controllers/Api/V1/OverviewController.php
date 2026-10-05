<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ContentItem;
use App\Models\Enquiry;
use App\Models\MediaAsset;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OverviewController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $contentTypes = ['services' => 'service', 'solutions' => 'solution', 'portfolio' => 'project', 'clients' => 'client', 'testimonials' => 'testimonial', 'team' => 'team', 'technologies' => 'technology', 'industries' => 'industry', 'blog' => 'blog', 'pages' => 'page', 'menus' => 'menu'];
        $content = [];
        foreach ($contentTypes as $key => $type) {
            $content[$key] = ContentItem::where('type', $type)->where('status', 'published')->count();
        }
        $recent = $request->user()->hasPermission('enquiries.view')
            ? Enquiry::query()->latest()->limit(6)->get(['reference', 'name', 'project_type', 'status', 'created_at'])
            : collect();

        return response()->json(['data' => [
            'users' => User::where('is_active', true)->count(), 'administrators' => User::where('role', 'admin')->where('is_active', true)->count(),
            'database' => config('database.default'), 'environment' => app()->environment(),
            'content' => [...$content, 'media' => MediaAsset::count()],
            'enquiries' => Enquiry::count(), 'new_enquiries' => Enquiry::where('status', 'new')->count(),
            'recent_enquiries' => $recent,
        ]]);
    }
}
