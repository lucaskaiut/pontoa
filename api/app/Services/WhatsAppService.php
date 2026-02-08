<?php

namespace App\Services;

use App\Models\Company;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

final class WhatsAppService
{
    public function createInstance(Company $company): array
    {
        $this->validateApiConfig();

        $instanceName = $company->id . '-' . $this->generateInstanceToken();

        $payload = [
            'instanceName' => $instanceName,
            'token' => $this->generateInstanceToken(),
            'integration' => 'WHATSAPP-BAILEYS',
        ];

        $response = $this->execute('instance/create', 'post', $payload);

        if (!$response || !isset($response['instance']['instanceName'])) {
            Log::error('Erro ao criar instância WhatsApp', [
                'company_id' => $company->id,
                'instance_name' => $instanceName,
                'response' => $response,
            ]);

            throw new \Exception('Falha ao criar instância na Evolution API.');
        }

        $connectResponse = $this->execute('instance/connect/' . $instanceName);

        if (!$connectResponse) {
            Log::error('Erro ao conectar instância WhatsApp', [
                'company_id' => $company->id,
                'instance_name' => $instanceName,
                'response' => $connectResponse,
            ]);

            throw new \Exception('Falha ao conectar instância na Evolution API.');
        }

        $this->configureWebhook($instanceName);

        $settingService = new SettingService;
        $settingService->save(key: 'whatsapp_instance_name', value: $instanceName, label: 'WhatsApp - Nome da instância');

        return [
            'instance_name' => $instanceName,
            'instance_token' => $payload['token'],
            'response' => $connectResponse,
        ];
    }

    private function configureWebhook(string $instanceName): void
    {
        $webhookPayload = [
            'webhook' => [
                'enabled' => true,
                'url' => 'https://api.pontoa.com.br/api/webhooks/whatsapp',
                'byEvents' => false,
                'base64' => false,
                'events' => [
                    'MESSAGES_UPSERT'
                ]
            ]
        ];

        $response = $this->execute('webhook/set/' . $instanceName, 'post', $webhookPayload);

        if (!$response) {
            Log::error('Erro ao configurar webhook WhatsApp', [
                'instance_name' => $instanceName,
                'response' => $response,
            ]);

            throw new \Exception('Falha ao configurar webhook na Evolution API.');
        }
    }

    private function generateInstanceToken(): string
    {
        return Str::random(32);
    }

    public function getQrCode(Company $company): ?string
    {
        $this->validateApiConfig();

        $settingService = new SettingService;
        $instanceName = $settingService->get('whatsapp_instance_name');

        if (!$instanceName) {
            return null;
        }

        try {
            $response = $this->execute('instance/connect/' . $instanceName);

            if (!$response) {
                return null;
            }

            return $response['qrcode']['base64'] 
                ?? $response['qrcode']['code'] 
                ?? $response['base64'] 
                ?? $response['qrcode'] 
                ?? null;
        } catch (\Exception $e) {
            Log::error('Exceção ao obter QR Code', [
                'company_id' => $company->id,
                'instance_name' => $instanceName,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    public function getConnectionStatus(Company $company): array
    {
        $settingService = new SettingService;
        $instanceName = $settingService->get('whatsapp_instance_name');

        if (!$instanceName) {
            return [
                'connected' => false,
                'status' => 'not_configured',
                'message' => 'Instância não configurada',
            ];
        }

        try {
            $this->validateApiConfig();
            $response = $this->execute('instance/connectionState/' . $instanceName);

            if (!$response) {
                return [
                    'connected' => false,
                    'status' => 'error',
                    'message' => 'Erro ao verificar status da conexão',
                ];
            }

            $state = $response['instance']['state'] ?? $response['instance']['status'] ?? 'unknown';
            $connected = in_array(strtolower($state), ['open', 'connected', 'ready']);

            return [
                'connected' => $connected,
                'status' => strtolower($state),
                'message' => $this->getStatusMessage($state),
            ];
        } catch (\Exception $e) {
            Log::error('Exceção ao verificar status da conexão', [
                'company_id' => $company->id,
                'instance_name' => $instanceName,
                'error' => $e->getMessage(),
            ]);

            return [
                'connected' => false,
                'status' => 'error',
                'message' => 'Erro ao verificar status da conexão',
            ];
        }
    }

    private function getStatusMessage(string $state): string
    {
        return match (strtolower($state)) {
            'open', 'connected', 'ready' => 'Conectado',
            'close' => 'Desconectado',
            'connecting' => 'Conectando...',
            default => 'Aguardando conexão',
        };
    }

    private function validateApiConfig(): void
    {
        $apiKey = config('app.evolution_api_key');
        $apiUrl = config('app.evolution_api_url');

        if (!$apiKey || !$apiUrl) {
            throw new \Exception('Evolution API não configurada. Verifique as variáveis de ambiente EVOLUTION_API_KEY e EVOLUTION_API_URL.');
        }
    }

    private function execute(string $endpoint, string $method = 'get', ?array $params = []): ?array
    {
        $apiKey = config('app.evolution_api_key');
        $apiUrl = config('app.evolution_api_url');
        $fullUrl = rtrim($apiUrl, '/') . '/' . ltrim($endpoint, '/');

        try {
            $response = Http::withHeaders(['apikey' => $apiKey])
                ->timeout(30)
                ->$method($fullUrl, $params);

            if ($response->failed()) {
                Log::error('Erro na requisição Evolution API', [
                    'url' => $fullUrl,
                    'method' => $method,
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);

                return null;
            }

            $data = $response->json();

            if ($response->successful() && $data !== null) {
                return $data;
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Exceção na requisição Evolution API', [
                'url' => $fullUrl,
                'method' => $method,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
