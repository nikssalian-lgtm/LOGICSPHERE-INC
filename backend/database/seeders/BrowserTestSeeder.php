<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class BrowserTestSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment('e2e') || config('database.connections.mysql.database') !== 'logicsphere_test') {
            throw new RuntimeException('Browser fixtures require the isolated e2e environment and test database.');
        }
        $password = 'Test!'.bin2hex(random_bytes(16));
        foreach (['admin', 'member'] as $role) {
            $user = User::firstOrNew(['email' => $role.'@example.test']);
            $user->name = $role === 'admin' ? 'Test Administrator' : 'Test Member';
            $user->password = $password;
            $user->role = $role;
            $user->save();
        }
        file_put_contents(base_path('../.local/e2e.json'), json_encode(['password' => $password]));
    }
}
