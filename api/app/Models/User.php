<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Models\Scopes\CompanyScope;
use App\Utilities\FilterBuilder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'document',
        'company_id',
        'bank',
        'branch_number',
        'account_number',
        'account_check_digit',
        'bank_account_type',
        'is_collaborator',
        'image',
        'description',
        'url',
    ];

    protected $guarded = [
        'type',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_collaborator' => 'boolean',
    ];

    protected function phone(): Attribute
    {
        return Attribute::make(
            set: fn ($value) => preg_replace('/[^0-9]/', '', $value)
        );
    }

    protected function document(): Attribute
    {
        return Attribute::make(
            set: fn ($value) => preg_replace('/[^0-9]/', '', $value)
        );
    }

    protected function password(): Attribute
    {
        return Attribute::make(
            set: fn ($value) => Hash::make($value)
        );
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function invitations()
    {
        return $this->hasMany(Invitation::class);
    }

    public function services()
    {
        return $this->hasMany(Service::class);
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_role');
    }

    public function hasPermission(string $permission): bool
    {
        if ($this->type === 'customer') {
            return false;
        }

        $query = $this->roles();
        
        if ($this->type === 'superadmin') {
            $query->withoutGlobalScopes();
            $query->where('company_id', $this->company_id);
        }

        return $query->whereJsonContains('permissions', $permission)->exists();
    }

    public function hasAnyPermission(array $permissions): bool
    {
        if ($this->type === 'customer') {
            return false;
        }

        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }

        return false;
    }

    public function scopeFilterBy($query, $filters)
    {
        $namespace = 'App\Filters\Users';

        return (new FilterBuilder($query, $filters, $namespace))->apply();
    }
}
