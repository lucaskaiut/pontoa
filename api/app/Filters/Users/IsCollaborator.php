<?php

namespace App\Filters\Users;

class IsCollaborator
{
    protected $query;

    public function __construct($query)
    {
        $this->query = $query;
    }

    public function handle($value = null): void
    {
        if ($value === null || $value === '') {
            return;
        }

        $isCollaborator = filter_var($value, FILTER_VALIDATE_BOOLEAN);
        $this->query->where('is_collaborator', $isCollaborator);
    }
}

