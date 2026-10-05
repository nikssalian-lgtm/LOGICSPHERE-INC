<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Laravel\Sanctum\Sanctum;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // This first-party workspace uses sessions only; token APIs are not enabled.
        Sanctum::getAccessTokenFromRequestUsing(fn () => null);
        Password::defaults(fn () => Password::min(12)->mixedCase()->numbers()->symbols());
        RateLimiter::for('login', fn (Request $request) => [
            Limit::perMinute(5)->by('login:'.hash('sha256', mb_strtolower(trim(is_string($request->input('email')) ? $request->input('email') : '')).'|'.$request->ip())),
            Limit::perMinute(30)->by('login-ip:'.$request->ip()),
        ]);
        RateLimiter::for('password-reset', fn (Request $request) => Limit::perMinute(5)->by('reset:'.$request->ip()));
        RateLimiter::for('api', fn (Request $request) => Limit::perMinute(120)->by((string) ($request->user()?->id ?? $request->ip())));
        RateLimiter::for('enquiry', fn (Request $request) => Limit::perMinute(5)->by('enquiry:'.hash_hmac('sha256', (string) $request->ip(), (string) config('app.key'))));
        ResetPassword::createUrlUsing(fn (object $user, string $token) => rtrim(config('frontend.url'), '/').'/reset-password?'.http_build_query(['token' => $token, 'email' => $user->getEmailForPasswordReset()]));
    }
}
