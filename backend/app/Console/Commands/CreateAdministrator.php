<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class CreateAdministrator extends Command
{
    protected $signature = 'app:create-admin';

    protected $description = 'Securely create an administrator using interactive prompts';

    public function handle(): int
    {
        $data = ['name' => $this->ask('Administrator name'), 'email' => mb_strtolower(trim((string) $this->ask('Email address'))), 'password' => $this->secret('Password (12+ characters, mixed case, number and symbol)'), 'password_confirmation' => $this->secret('Confirm password')];
        $validator = Validator::make($data, ['name' => ['required', 'string', 'max:100'], 'email' => ['required', 'email', 'max:254', 'unique:users,email'], 'password' => ['required', 'confirmed', 'max:128', Password::defaults()]]);
        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $message) {
                $this->error($message);
            }

            return self::FAILURE;
        }
        $user = new User(['name' => $data['name'], 'email' => $data['email'], 'password' => $data['password']]);
        $user->role = 'admin';
        $user->save();
        $this->info('Administrator created. Sign in through the React workspace.');

        return self::SUCCESS;
    }
}
