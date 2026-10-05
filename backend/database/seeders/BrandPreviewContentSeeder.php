<?php

namespace Database\Seeders;

use App\Models\ContentItem;
use Illuminate\Database\Seeder;

class BrandPreviewContentSeeder extends Seeder
{
    public function run(): void
    {
        ContentItem::withTrashed()->firstOrCreate(
            ['type' => 'client', 'slug' => 'client-name-placeholder'],
            [
                'title' => 'Client name placeholder — replace before launch',
                'summary' => null,
                'body' => null,
                'attributes' => ['industry' => 'Placeholder — replace with approved client information'],
                'status' => 'draft',
                'featured' => false,
                'sort_order' => 0,
                'published_at' => null,
            ],
        );

        $projects = [
            [
                'slug' => 'project-placeholder-software',
                'title' => 'Software project placeholder — replace before launch',
                'summary' => 'Temporary preview content. Replace with an approved project, client details and real screenshots before launch.',
                'industry' => 'Placeholder — replace with the approved industry',
            ],
            [
                'slug' => 'project-placeholder-digital-experience',
                'title' => 'Digital experience placeholder — replace before launch',
                'summary' => 'Temporary preview content. Replace with an approved website or e-commerce project and real screenshots before launch.',
                'industry' => 'Placeholder — replace with the approved industry',
            ],
            [
                'slug' => 'project-placeholder-mobile-application',
                'title' => 'Mobile application placeholder — replace before launch',
                'summary' => 'Temporary preview content. Replace with an approved mobile application project and real screenshots before launch.',
                'industry' => 'Placeholder — replace with the approved industry',
            ],
        ];

        foreach ($projects as $index => $project) {
            ContentItem::withTrashed()->firstOrCreate(
                ['type' => 'project', 'slug' => $project['slug']],
                [
                    'title' => $project['title'],
                    'summary' => $project['summary'],
                    'body' => null,
                    'attributes' => [
                        'client' => 'Placeholder — replace with approved client name',
                        'industry' => $project['industry'],
                        'challenge' => null,
                        'approach' => null,
                        'solution' => null,
                        'results' => null,
                        'technologies' => [],
                        'url' => null,
                    ],
                    'status' => 'draft',
                    'featured' => false,
                    'sort_order' => 3 - $index,
                    'published_at' => null,
                ],
            );
        }
    }
}
