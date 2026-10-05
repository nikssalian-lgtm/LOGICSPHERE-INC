<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    protected $fillable = ['key', 'group', 'value', 'type', 'updated_by'];

    protected function casts(): array
    {
        return ['value' => 'array'];
    }
}
