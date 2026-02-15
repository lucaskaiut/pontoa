<?php

namespace App\Services;

use App\Models\RequestLog;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

final class RequestLogService
{
    public function create(array $data)
    {
        $logData = collect($data)->except(['params', 'body'])->all();

        $logData['file'] = $this->renderFile(collect($data)->only(['params', 'body'])->all());


        Log::info('RequestLog', $logData);

        return RequestLog::create($logData);
    }

    private function renderFile($data): string
    {
        $content = json_encode($data);

        $fileName = md5(microtime(true)) . '.json';

        Storage::put($fileName, $content);

        return $fileName;
    }
}