<?php

namespace App\Http\Requests\Auth;

use Illuminate\Validation\Rules\Password;

class ResetPasswordRequest extends ForgotPasswordRequest
{
    public function rules(): array
    {
        return [...parent::rules(), 'token' => ['required', 'string', 'max:255'], 'password' => ['required', 'string', 'confirmed', 'max:128', Password::defaults()]];
    }
}
