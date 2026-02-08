<?php 

namespace App\Services;

use App\Models\File;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

final class FileService 
{
    public function create(array $data): File
    {
        $data['path'] = $this->storeFile($data['file'], $data['name']);
        unset($data['file']);
        $file = File::create($data);

        return $file;
    }

    public function paginate(array $data): LengthAwarePaginator
    {
        return $this->buildQuery(File::query(), $data)->paginate();
    }

    /**
     * @return File[]
     */
    public function filter(array $data): Collection
    {
        return $this->buildQuery(File::query(), $data)->get();
    }

    public function findOrFail($id): File
    {
        return File::findOrFail($id);
    }

    public function update(File $file, array $data)
    {
        $file->update($data);

        return $file->refresh();
    }

    public function delete(File $file)
    {
        $file->delete();
    }

    private function buildQuery(Builder $query, array $where): Builder
    {
        foreach ($where as $key => $value) {
            $query->where($key, $value);
        }

        return $query;
    }

    private function storeFile(UploadedFile $file): string
    {
        $name = Str::random('12') . '.' . $file->getClientOriginalExtension();
        return 'storage/' . Storage::disk('public')->putFileAs('uploads', $file, $name);
    }
}