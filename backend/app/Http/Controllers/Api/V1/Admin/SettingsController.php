<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class SettingsController extends Controller
{
    public function __construct(private readonly ActivityLogger $activity) {}

    private const FIELDS = [
        'site' => [
            'site_name' => ['label' => 'Company name', 'type' => 'text', 'required' => true], 'site_tagline' => ['label' => 'Tagline', 'type' => 'text'],
            'hero_headline' => ['label' => 'Homepage hero heading', 'type' => 'text'], 'hero_description' => ['label' => 'Homepage hero statement', 'type' => 'textarea'],
            'hero_primary_cta' => ['label' => 'Primary call to action', 'type' => 'text'], 'hero_primary_url' => ['label' => 'Primary call to action URL', 'type' => 'path'],
            'hero_secondary_cta' => ['label' => 'Secondary call to action', 'type' => 'text'], 'hero_secondary_url' => ['label' => 'Secondary call to action URL', 'type' => 'path'],
            'footer_description' => ['label' => 'Footer statement', 'type' => 'textarea'], 'logo_media_id' => ['label' => 'Logo media ID', 'type' => 'media'],
            'favicon_media_id' => ['label' => 'Favicon media ID', 'type' => 'media'], 'copyright' => ['label' => 'Copyright text', 'type' => 'text'],
        ],
        'contact' => ['email' => ['label' => 'Public email', 'type' => 'email'], 'phone' => ['label' => 'Phone', 'type' => 'text'], 'address' => ['label' => 'Address', 'type' => 'textarea'], 'timezone' => ['label' => 'Timezone', 'type' => 'text']],
        'social' => ['linkedin' => ['label' => 'LinkedIn URL', 'type' => 'url'], 'instagram' => ['label' => 'Instagram URL', 'type' => 'url'], 'facebook' => ['label' => 'Facebook URL', 'type' => 'url'], 'youtube' => ['label' => 'YouTube URL', 'type' => 'url'], 'x' => ['label' => 'X URL', 'type' => 'url']],
        'seo' => [
            'default_title' => ['label' => 'Default page title', 'type' => 'text'], 'default_description' => ['label' => 'Default description', 'type' => 'textarea'],
            'canonical_base' => ['label' => 'Canonical website URL', 'type' => 'url'], 'default_image_media_id' => ['label' => 'Default social image media ID', 'type' => 'media'],
            'allow_indexing' => ['label' => 'Allow public search indexing', 'type' => 'boolean'], 'google_analytics_id' => ['label' => 'Google Analytics ID', 'type' => 'text'],
            'tag_manager_id' => ['label' => 'Google Tag Manager ID', 'type' => 'text'], 'meta_pixel_id' => ['label' => 'Meta Pixel ID', 'type' => 'text'],
        ],
    ];

    public function show(string $group): JsonResponse
    {
        return response()->json(['data' => self::FIELDS[$group], 'values' => $this->values($group)]);
    }

    public function showSeo(): JsonResponse
    {
        return $this->show('seo');
    }

    public function updateSeo(Request $request): JsonResponse
    {
        return $this->update($request, 'seo');
    }

    public function update(Request $request, string $group): JsonResponse
    {
        $fields = self::FIELDS[$group];
        $rules = [];
        foreach ($fields as $key => $field) {
            $rule = match ($field['type']) {
                'email' => ['nullable', 'email', 'max:254'], 'url' => ['nullable', 'url:https,http', 'max:2048'],
                'path' => ['nullable', 'string', 'max:2048', function ($attribute, $value, $fail): void {
                    $internal = str_starts_with($value, '/') && ! str_starts_with($value, '//') && ! str_contains($value, '\\') && ! preg_match('/[\\x00-\\x20]/', $value);
                    $external = filter_var($value, FILTER_VALIDATE_URL) !== false && str_starts_with(strtolower($value), 'https://');
                    if (! $internal && ! $external) {
                        $fail('Use a relative site path or an https URL.');
                    }
                }],
                'textarea' => ['nullable', 'string', 'max:5000'], 'boolean' => ['nullable', 'boolean'],
                'media' => ['nullable', 'integer', Rule::exists('media_assets', 'id')->whereNull('deleted_at')],
                default => ['nullable', 'string', 'max:500'],
            };
            if ($key === 'google_analytics_id') {
                $rule[] = 'regex:/^G-[A-Z0-9]+$/';
            }
            if ($key === 'tag_manager_id') {
                $rule[] = 'regex:/^GTM-[A-Z0-9]+$/';
            }
            if ($key === 'meta_pixel_id') {
                $rule[] = 'regex:/^[0-9]{5,20}$/';
            }
            if (($field['required'] ?? false) === true) {
                $rule[0] = 'required';
            }
            $rules[$key] = $rule;
        }
        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
        $values = $validator->validated();
        DB::transaction(function () use ($values, $group, $request, $fields): void {
            foreach ($values as $key => $value) {
                if ($value === '') {
                    $value = null;
                }
                SiteSetting::updateOrCreate(['key' => $key], ['group' => $group, 'value' => $value, 'type' => $fields[$key]['type'], 'updated_by' => $request->user()->id]);
            }
        });
        $this->activity->record($request->user()->id, 'settings_updated', $group);

        return response()->json(['message' => ucfirst($group).' settings saved.', 'values' => $this->values($group)]);
    }

    private function values(string $group): array
    {
        return SiteSetting::where('group', $group)->get()->mapWithKeys(fn ($setting) => [$setting->key => $setting->value])->all();
    }
}
