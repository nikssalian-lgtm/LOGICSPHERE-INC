<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;

class PublicSettingsController extends Controller
{
    public function index(): JsonResponse
    {
        $values = SiteSetting::whereIn('group', ['site', 'seo', 'contact', 'social'])
            ->get(['group', 'key', 'value'])
            ->groupBy('group')
            ->map(fn ($items) => $items->mapWithKeys(fn ($setting) => [$setting->key => $setting->value]));

        return response()->json(['data' => $values])->header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    }

    public function __invoke(string $group): JsonResponse
    {
        $values = SiteSetting::where('group', $group)->get()->mapWithKeys(fn ($setting) => [$setting->key => $setting->value]);

        return response()->json(['data' => $values])->header('Cache-Control', 'public, max-age=60');
    }
}
