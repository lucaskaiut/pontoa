<?php

namespace App\Observers;

use App\Models\User;
use App\Services\UserService;
use Illuminate\Support\Str;

class UserObserver
{
    public function created(User $user)
    {
        (new UserService())->dispathUserRegistrationMail($user);
    }

    public function creating(User $user)
    {
        $user->company_id = app('company')->company->id;

        if (empty($user->url) && !empty($user->name)) {
            $user->url = $this->generateUniqueUrl($user->name, $user->company_id);
        }
    }

    public function updating(User $user)
    {
        if (empty($user->url) && !empty($user->name) && $user->isDirty('name')) {
            $user->url = $this->generateUniqueUrl($user->name, $user->company_id, $user->id);
        }
    }

    private function generateUniqueUrl(string $name, int $companyId, ?int $userId = null): string
    {
        $baseUrl = Str::slug($name);
        $url = $baseUrl;
        $counter = 1;

        while ($this->urlExists($url, $companyId, $userId)) {
            $url = $baseUrl . '-' . $counter;
            $counter++;
        }

        return $url;
    }

    private function urlExists(string $url, int $companyId, ?int $userId = null): bool
    {
        $query = User::where('url', $url)
            ->where('company_id', $companyId);

        if ($userId) {
            $query->where('id', '!=', $userId);
        }

        return $query->exists();
    }
}
