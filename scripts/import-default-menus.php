<?php

// Move the former built-in public links into the existing CMS without overwriting menus.
require __DIR__.'/../backend/vendor/autoload.php';
$app = require __DIR__.'/../backend/bootstrap/app.php';
if (in_array('--test', $argv, true)) {
    $app->loadEnvironmentFrom('.env.e2e');
}
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
if (in_array('--test', $argv, true) && config('database.connections.mysql.database') !== 'logicsphere_test') {
    throw new RuntimeException('Menu test fixtures require the isolated test database.');
}

Illuminate\Support\Facades\DB::transaction(function (): void {
    if (App\Models\ContentItem::withTrashed()->where('type', 'menu')->exists()) {
        echo "Existing navigation records preserved; nothing imported.\n";
        return;
    }
    $groups = [
        'primary' => ['Services' => '/services', 'Solutions' => '/solutions', 'Work' => '/portfolio', 'About' => '/about', 'Insights' => '/blog'],
        'footer-services' => ['Capabilities' => '/services', 'Solutions' => '/solutions'],
        'footer-company' => ['About' => '/about', 'Contact' => '/contact'],
        'footer-resources' => ['Industries' => '/industries', 'Technologies' => '/technologies', 'Insights' => '/blog'],
    ];
    foreach ($groups as $group => $links) {
        $order = 0;
        foreach ($links as $label => $url) {
            App\Models\ContentItem::create([
                'type' => 'menu', 'title' => $label,
                'slug' => $group.'-'.Illuminate\Support\Str::slug($label),
                'status' => 'published', 'published_at' => now(), 'sort_order' => $order++,
                'attributes' => ['label' => $label, 'url' => $url, 'menu' => $group, 'open_new_tab' => false],
            ]);
        }
    }
    echo "Imported 12 existing website links into Admin > Menus.\n";
});
