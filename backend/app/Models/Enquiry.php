<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Enquiry extends Model
{
    use SoftDeletes;

    protected $fillable = ['reference', 'name', 'email', 'phone', 'company', 'project_type', 'budget', 'message', 'status', 'assigned_to', 'source', 'ip_hash', 'consented_at', 'contacted_at', 'won_at', 'lost_at'];

    protected function casts(): array
    {
        return ['consented_at' => 'datetime', 'contacted_at' => 'datetime', 'won_at' => 'datetime', 'lost_at' => 'datetime'];
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function notes(): HasMany
    {
        return $this->hasMany(EnquiryNote::class)->latest();
    }

    public function events(): HasMany
    {
        return $this->hasMany(EnquiryEvent::class)->latest();
    }
}
