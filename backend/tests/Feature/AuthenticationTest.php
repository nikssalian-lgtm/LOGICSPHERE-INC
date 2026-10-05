<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_read_protected_resources(): void
    {
        $this->getJson('/api/v1/auth/user')->assertUnauthorized();
        $this->getJson('/api/v1/admin/overview')->assertUnauthorized();
    }

    public function test_login_returns_safe_user_resource_and_rotates_session(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->withSession(['marker' => 'retained']);
        $oldSession = session()->getId();
        $this->postJson('/api/v1/auth/login', ['email' => strtoupper($user->email), 'password' => 'password'])
            ->assertOk()->assertJsonPath('data.id', $user->id)->assertJsonPath('data.role', 'admin')
            ->assertJsonMissingPath('data.password')->assertJsonMissingPath('data.remember_token');
        $this->assertAuthenticatedAs($user);
        $this->assertNotSame($oldSession, session()->getId());
    }

    public function test_invalid_credentials_and_inputs_are_rejected(): void
    {
        $user = User::factory()->create();
        $this->postJson('/api/v1/auth/login', ['email' => $user->email, 'password' => 'wrong'])->assertUnprocessable()->assertJsonValidationErrors('email');
        $this->postJson('/api/v1/auth/login', [])->assertUnprocessable()->assertJsonValidationErrors(['email', 'password']);
        $this->postJson('/api/v1/auth/login', ['email' => ['invalid'], 'password' => 'wrong'])->assertUnprocessable()->assertJsonValidationErrors('email');
        $this->assertGuest();
    }

    public function test_login_attempts_are_rate_limited(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/login', ['email' => 'missing@example.test', 'password' => 'wrong'])->assertUnprocessable();
        }
        $this->postJson('/api/v1/auth/login', ['email' => 'missing@example.test', 'password' => 'wrong'])->assertTooManyRequests();
    }

    public function test_member_cannot_read_admin_overview(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'member']))->getJson('/api/v1/admin/overview')->assertForbidden();
    }

    public function test_administrator_gets_actual_counts(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->count(2)->create();
        $this->actingAs($admin)->getJson('/api/v1/admin/overview')->assertOk()->assertJsonPath('data.users', 3)->assertJsonPath('data.administrators', 1);
    }

    public function test_logout_invalidates_authentication(): void
    {
        $this->actingAs(User::factory()->create())->postJson('/api/v1/auth/logout')->assertOk();
        $this->assertGuest('web');
    }

    public function test_password_recovery_does_not_disclose_account_existence(): void
    {
        Notification::fake();
        $user = User::factory()->create();
        $existing = $this->postJson('/api/v1/auth/forgot-password', ['email' => $user->email])->assertOk();
        $missing = $this->postJson('/api/v1/auth/forgot-password', ['email' => 'missing@example.test'])->assertOk();
        $this->assertSame($existing->json(), $missing->json());
        Notification::assertSentTo($user, ResetPasswordNotification::class, function ($notification) use ($user) {
            $this->assertStringStartsWith(config('frontend.url').'/reset-password?', $notification->toMail($user)->actionUrl);

            return true;
        });
    }

    public function test_reset_token_is_single_use_and_password_is_hashed(): void
    {
        $user = User::factory()->create();
        $payload = ['email' => $user->email, 'token' => Password::createToken($user), 'password' => 'New!Password2026', 'password_confirmation' => 'New!Password2026'];
        $this->postJson('/api/v1/auth/reset-password', $payload)->assertOk();
        $this->assertTrue(Hash::check($payload['password'], $user->fresh()->password));
        $this->postJson('/api/v1/auth/reset-password', $payload)->assertUnprocessable();
    }

    public function test_invalid_expired_and_weak_reset_requests_are_rejected(): void
    {
        $user = User::factory()->create();
        $token = Password::createToken($user);
        $payload = ['email' => $user->email, 'token' => $token, 'password' => 'short', 'password_confirmation' => 'short'];
        $this->postJson('/api/v1/auth/reset-password', $payload)->assertUnprocessable()->assertJsonValidationErrors('password');
        $payload['password'] = $payload['password_confirmation'] = 'New!Password2026';
        $this->travel(61)->minutes();
        $this->postJson('/api/v1/auth/reset-password', $payload)->assertUnprocessable();
        $this->travelBack();
        $payload['token'] = 'invalid';
        $this->postJson('/api/v1/auth/reset-password', $payload)->assertUnprocessable();
    }

    public function test_role_cannot_be_mass_assigned(): void
    {
        $user = new User(['name' => 'Example', 'email' => 'example@example.test', 'password' => 'New!Password2026', 'role' => 'admin']);
        $user->save();
        $this->assertSame('member', $user->fresh()->role);
    }

    public function test_public_registration_is_not_available(): void
    {
        $this->postJson('/api/v1/auth/register', [])->assertNotFound();
    }

    public function test_bearer_tokens_do_not_enable_unconfigured_token_authentication(): void
    {
        $this->withHeader('Authorization', 'Bearer 1|'.str_repeat('a', 40))
            ->getJson('/api/v1/admin/overview')->assertUnauthorized();
    }

    public function test_password_reset_revokes_existing_database_sessions(): void
    {
        config(['session.driver' => 'database']);
        $user = User::factory()->create();
        DB::table('sessions')->insert([
            'id' => 'old-session', 'user_id' => $user->id, 'payload' => '', 'last_activity' => time(),
        ]);
        $this->postJson('/api/v1/auth/reset-password', [
            'email' => $user->email, 'token' => Password::createToken($user),
            'password' => 'Changed!Password2026', 'password_confirmation' => 'Changed!Password2026',
        ])->assertOk();
        $this->assertDatabaseMissing('sessions', ['id' => 'old-session']);
    }
}
