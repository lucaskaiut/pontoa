<?php 

namespace App\Services;

use App\Models\Service;

final class ServiceService 
{
    public function create(array $data): Service
    {
        if (isset($data['photo']) && $data['photo'] == 'delete') {
            unset($data['photo']);
        }

        $service = Service::create($data);

        return $service->load('user');
    }

    /**
     * @return Service[]
     */
    public function list(array $filters = [])
    {
        $query = Service::with('user');

        if (isset($filters['sort'])) {
            $parts = explode(',', $filters['sort']);
            $column = $parts[0] ?? null;
            $direction = strtoupper($parts[1] ?? 'ASC');

            if ($column && in_array($direction, ['ASC', 'DESC'])) {
                $allowedColumns = ['name', 'price', 'duration', 'created_at', 'updated_at'];
                if (in_array($column, $allowedColumns)) {
                    $query->orderBy($column, $direction);
                }
            }
        } else {
            $query->orderBy('created_at', 'DESC');
        }

        return $query->paginate();
    }

    public function findOrFail($id): Service
    {
        return Service::with('user')->findOrFail($id);
    }

    public function update(Service $service, array $data)
    {
        $service->update($data);

        return $service->load('user');
    }

    public function delete(Service $service)
    {
        $service->delete();
    }
}