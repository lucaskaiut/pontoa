<?php 

namespace App\Services;

use App\Models\Notification;

final class NotificationService 
{
    public function create(array $data): Notification
    {
        $notification = Notification::create($data);

        return $notification;
    }

    public function list(array $filters = [])
    {
        $query = Notification::query();

        if (isset($filters['sort'])) {
            $parts = explode(',', $filters['sort']);
            $column = $parts[0] ?? null;
            $direction = strtoupper($parts[1] ?? 'ASC');

            if ($column && in_array($direction, ['ASC', 'DESC'])) {
                $allowedColumns = ['title', 'created_at', 'updated_at'];
                if (in_array($column, $allowedColumns)) {
                    $query->orderBy($column, $direction);
                }
            }
        } else {
            $query->orderBy('created_at', 'DESC');
        }

        return $query->paginate();
    }

    public function findOrFail($id): Notification
    {
        return Notification::findOrFail($id);
    }

    public function update(Notification $notification, array $data)
    {
        $notification->update($data);

        return $notification;
    }

    public function delete(Notification $notification)
    {
        $notification->delete();
    }
}

