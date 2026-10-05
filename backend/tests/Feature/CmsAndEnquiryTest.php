<?php

namespace Tests\Feature;

use App\Models\ContentItem;
use App\Models\Enquiry;
use App\Models\SiteSetting;
use App\Models\User;
use App\Services\RichBodySanitizer;
use Database\Seeders\BrandPreviewContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class CmsAndEnquiryTest extends TestCase
{
    use RefreshDatabase;

    public function test_content_is_saved_as_draft_then_exposed_after_publication(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->assertTrue($admin->fresh()->isActive());
        $this->assertTrue($admin->fresh()->hasPermission('services.create'));
        $response = $this->actingAs($admin)->postJson('/api/v1/admin/content/services', [
            'title' => 'Business systems',
            'summary' => 'A concise service summary.',
            'body' => ['type' => 'doc', 'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Service details.']]]]],
            'attributes' => ['service_type' => 'Custom software'],
        ]);
        $response->assertCreated()->assertJsonPath('data.slug', 'business-systems')->assertJsonPath('data.status', 'draft');

        $item = ContentItem::where('type', 'service')->firstOrFail();
        $this->getJson('/api/v1/public/content/services/business-systems')->assertNotFound();

        $this->actingAs($admin)->postJson("/api/v1/admin/content/services/{$item->id}/publication", ['publish' => true])
            ->assertOk()->assertJsonPath('data.status', 'published');
        $this->getJson('/api/v1/public/content/services/business-systems')->assertOk()->assertJsonPath('data.title', 'Business systems');
    }

    public function test_every_content_module_supports_crud_archive_and_restore(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $modules = [
            'services' => [],
            'solutions' => [],
            'portfolio' => [],
            'clients' => [],
            'testimonials' => ['quote' => 'A verified client quote.'],
            'team' => [],
            'technologies' => [],
            'industries' => [],
            'blog' => [],
            'pages' => [],
            'menus' => ['label' => 'Contact', 'url' => '/contact', 'menu' => 'primary'],
        ];

        foreach ($modules as $module => $attributes) {
            $title = ucfirst($module).' audit record';
            $created = $this->actingAs($admin)->postJson("/api/v1/admin/content/$module", [
                'title' => $title,
                'summary' => 'Created during the CMS CRUD verification.',
                'attributes' => $attributes,
            ])->assertCreated()->assertJsonPath('data.status', 'draft');
            $id = $created->json('data.id');

            $this->getJson("/api/v1/admin/content/$module")
                ->assertOk()->assertJsonFragment(['title' => $title]);
            $this->getJson("/api/v1/admin/content/$module/$id")
                ->assertOk()->assertJsonPath('data.title', $title);
            $this->patchJson("/api/v1/admin/content/$module/$id", [
                'title' => "$title updated",
                'summary' => 'Updated during the CMS CRUD verification.',
                'attributes' => $attributes,
            ])->assertOk()->assertJsonPath('data.title', "$title updated");
            $this->deleteJson("/api/v1/admin/content/$module/$id")
                ->assertOk();
            $this->getJson("/api/v1/admin/content/$module/$id")->assertNotFound();
            $this->getJson("/api/v1/admin/content/$module?archived=1")
                ->assertOk()->assertJsonFragment(['title' => "$title updated"]);
            $this->postJson("/api/v1/admin/content/$module/$id/restore")
                ->assertOk()->assertJsonPath('data.title', "$title updated");
        }
    }

    public function test_seo_settings_can_be_saved_and_invalid_values_are_rejected(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->getJson('/api/v1/admin/settings/seo')->assertOk();

        $this->actingAs($admin)->putJson('/api/v1/admin/settings/seo', [
            'default_title' => 'LogicSphere Inc',
            'default_description' => 'Software and digital systems for modern businesses.',
            'canonical_base' => 'https://example.test',
            'allow_indexing' => false,
        ])->assertOk();

        $this->assertDatabaseHas('site_settings', ['key' => 'canonical_base', 'value' => 'https://example.test']);
        $this->assertDatabaseHas('site_settings', ['key' => 'allow_indexing', 'value' => '0']);

        $this->putJson('/api/v1/admin/settings/seo', ['canonical_base' => 'javascript:alert(1)'])
            ->assertUnprocessable()->assertJsonValidationErrors('canonical_base');
    }

    public function test_fictitious_preview_projects_and_clients_remain_private_drafts(): void
    {
        $this->seed(BrandPreviewContentSeeder::class);

        $this->assertSame(0, ContentItem::whereIn('type', ['client', 'project'])->where('status', 'published')->count());
        $this->getJson('/api/v1/public/content/portfolio')->assertOk()->assertJsonPath('data', []);
        $this->getJson('/api/v1/public/content/clients')->assertOk()->assertJsonPath('data', []);
        $this->assertDatabaseCount('content_items', 4);
    }

    public function test_member_cannot_read_or_create_cms_content(): void
    {
        $member = User::factory()->create(['role' => 'member']);
        $this->actingAs($member)->getJson('/api/v1/admin/content/services')->assertForbidden();
        $this->actingAs($member)->postJson('/api/v1/admin/content/services', ['title' => 'Unauthorized'])->assertForbidden();
        $this->assertDatabaseCount('content_items', 0);
    }

    public function test_rich_text_attributes_reject_unsupported_nodes(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)->postJson('/api/v1/admin/content/portfolio', [
            'title' => 'Project record',
            'attributes' => ['challenge' => ['type' => 'script', 'content' => []]],
        ])->assertUnprocessable();
        $this->assertDatabaseCount('content_items', 0);
    }

    public function test_rich_text_sanitizer_rejects_backslash_based_external_links(): void
    {
        $body = app(RichBodySanitizer::class)->clean([
            'type' => 'doc',
            'content' => [[
                'type' => 'paragraph',
                'content' => [[
                    'type' => 'text',
                    'text' => 'unsafe destination',
                    'marks' => [['type' => 'link', 'attrs' => ['href' => '/\\\\attacker.example']]],
                ]],
            ]],
        ]);

        $this->assertArrayNotHasKey('marks', $body['content'][0]['content'][0]);
    }

    public function test_navigation_rejects_backslash_based_external_paths(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)->postJson('/api/v1/admin/content/menus', [
            'title' => 'Unsafe link',
            'attributes' => [
                'label' => 'Unsafe link',
                'url' => '/\\\\attacker.example',
                'menu' => 'primary',
            ],
        ])->assertUnprocessable();

        $this->assertDatabaseCount('content_items', 0);
    }

    public function test_unsafe_svg_uploads_are_rejected(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)->postJson('/api/v1/admin/media', [
            'file' => UploadedFile::fake()->createWithContent('payload.svg', '<svg xmlns="http://www.w3.org/2000/svg"></svg>'),
            'alt_text' => 'Unsafe vector upload',
        ])->assertUnprocessable();

        $this->assertDatabaseCount('media_assets', 0);
    }

    public function test_portfolio_supports_cms_categories_services_and_features(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $response = $this->actingAs($admin)->postJson('/api/v1/admin/content/portfolio', [
            'title' => 'Operations platform',
            'summary' => 'A project summary provided by the CMS editor.',
            'attributes' => [
                'project_type' => 'ERP',
                'industry' => 'Manufacturing',
                'services' => ['ERP development', 'API integration'],
                'features' => ['Inventory workflows', 'Operations reporting'],
                'technologies' => ['Laravel', 'React'],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.attributes.project_type', 'ERP')
            ->assertJsonPath('data.attributes.services.0', 'ERP development')
            ->assertJsonPath('data.attributes.features.1', 'Operations reporting');

        $item = ContentItem::where('type', 'project')->firstOrFail();
        $this->actingAs($admin)->postJson("/api/v1/admin/content/portfolio/{$item->id}/publication", ['publish' => true])->assertOk();
        $this->getJson('/api/v1/public/content/portfolio/operations-platform')
            ->assertOk()
            ->assertJsonPath('data.attributes.project_type', 'ERP')
            ->assertJsonPath('data.attributes.technologies.1', 'React');
    }

    public function test_public_enquiry_requires_consent_and_is_stored(): void
    {
        $payload = [
            'name' => 'Alex Example', 'email' => 'alex@example.test', 'company' => 'Example Co',
            'project_type' => 'Custom software', 'message' => 'We would like to discuss a software project.',
        ];
        $this->postJson('/api/v1/enquiries', $payload)->assertUnprocessable()->assertJsonValidationErrors('privacy_consent');

        $this->postJson('/api/v1/enquiries', [...$payload, 'privacy_consent' => true])
            ->assertCreated()->assertJsonStructure(['data' => ['reference']]);
        $this->assertDatabaseHas('enquiries', ['email' => 'alex@example.test', 'status' => 'new', 'company' => 'Example Co']);
        $this->assertSame(1, Enquiry::count());
    }

    public function test_public_settings_are_returned_as_cached_groups(): void
    {
        SiteSetting::create([
            'key' => 'contact_email',
            'group' => 'contact',
            'value' => 'hello@example.test',
        ]);
        SiteSetting::create([
            'key' => 'default_title',
            'group' => 'seo',
            'value' => 'LogicSphere example title',
        ]);

        $this->getJson('/api/v1/public/settings')
            ->assertOk()
            ->assertJsonPath('data.contact.contact_email', 'hello@example.test')
            ->assertJsonPath('data.seo.default_title', 'LogicSphere example title')
            ->assertHeader('Cache-Control', 'max-age=60, public, stale-while-revalidate=300');
    }
}
