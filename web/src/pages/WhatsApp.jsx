import React, { useState, useEffect, useRef } from 'react';
import { companyService } from '../services/companyService';
import toast from 'react-hot-toast';

export function WhatsApp() {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [qrcode, setQrcode] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    status: 'not_configured',
    message: 'Aguardando configuração'
  });
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    checkInitialStatus();

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (connectionStatus.connected) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      toast.success('WhatsApp conectado com sucesso!');
    }
  }, [connectionStatus.connected]);

  const checkInitialStatus = async () => {
    setIsLoading(true);
    try {
      const data = await companyService.getWhatsAppQrCode();
      
      if (data.qrcode) {
        setQrcode(data.qrcode);
      }
      
      if (data.connection_status) {
        setConnectionStatus(data.connection_status);
        
        if (!data.connection_status.connected && data.connection_status.status !== 'not_configured') {
          startPolling();
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status inicial:', error);
      if (error.response?.status === 404 || error.response?.status === 400) {
        setConnectionStatus({
          connected: false,
          status: 'not_configured',
          message: 'WhatsApp não conectado'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigure = async () => {
    setIsConfiguring(true);
    try {
      const response = await companyService.configureWhatsApp();
      
      if (response.data) {
        if (response.data.qrcode) {
          setQrcode(response.data.qrcode);
        }
        
        if (response.data.connection_status) {
          setConnectionStatus(response.data.connection_status);
          
          if (!response.data.connection_status.connected) {
            startPolling();
          }
        }
        
        toast.success('WhatsApp pronto para conectar! Escaneie o código QR.');
      }
    } catch (error) {
      console.error('Erro ao configurar WhatsApp:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao conectar WhatsApp. Tente novamente.';
      toast.error(errorMessage);
    } finally {
      setIsConfiguring(false);
    }
  };

  const startPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const statusData = await companyService.getWhatsAppConnectionStatus();
        setConnectionStatus(statusData);

        if (statusData.connected) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        } else if (statusData.status === 'close' && qrcode) {
          try {
            const qrData = await companyService.getWhatsAppQrCode();
            if (qrData.qrcode) {
              setQrcode(qrData.qrcode);
            }
          } catch (error) {
            console.error('Erro ao atualizar QR Code:', error);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    }, 3000);
  };

  const getStatusMessage = () => {
    switch (connectionStatus.status) {
      case 'open':
        return { text: 'Conectado', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
      case 'close':
        return { text: 'Desconectado', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
      case 'connecting':
        return { text: 'Conectando...', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
      case 'not_configured':
        return { text: 'Não conectado', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
      case 'error':
        return { text: 'Erro', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
      default:
        return { text: connectionStatus.message || 'Aguardando', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="overflow-auto min-h-full w-full pb-24 md:pb-0">
      <div className="mt-4 md:mt-10 px-4 md:px-10">
        <h1 className="text-2xl md:text-4xl text-navy-900 dark:text-dark-text font-bold mb-6">
          Configuração do WhatsApp
        </h1>

        <div className="bg-white dark:bg-dark-surface rounded-2xl max-w-4xl border border-gray-100 dark:border-dark-border p-6 md:p-10">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">📱</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text mb-2">
              Conecte seu WhatsApp
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Conecte sua conta do WhatsApp para enviar notificações aos seus clientes
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-dark-surface-hover rounded-2xl p-6 mb-6">
            {!qrcode && connectionStatus.status === 'not_configured' ? (
              <div className="text-center py-8">
                <div className="mb-4">
                  <div className="text-6xl mb-4">📱</div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-2">
                    Conectar WhatsApp
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Clique no botão abaixo para gerar o código QR e conectar sua conta do WhatsApp
                  </p>
                </div>
                <button
                  onClick={handleConfigure}
                  disabled={isConfiguring}
                  className="bg-linear-to-r from-green-400 to-emerald-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isConfiguring ? 'Conectando...' : 'Conectar WhatsApp'}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className={`${statusInfo.bg} ${statusInfo.border} border rounded-lg p-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-semibold ${statusInfo.color}`}>
                        Status: {statusInfo.text}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {connectionStatus.message}
                      </p>
                    </div>
                    {connectionStatus.connected && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-green-600">Conectado</span>
                      </div>
                    )}
                  </div>
                </div>

                {qrcode && !connectionStatus.connected && (
                  <div className="bg-white dark:bg-dark-surface rounded-lg p-6 border border-gray-200 dark:border-dark-border">
                    <div className="text-center mb-4">
                      <h4 className="font-semibold text-gray-900 dark:text-dark-text mb-2">
                        Escaneie o QR Code
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Abra o WhatsApp no seu celular, vá em Configurações → Aparelhos conectados → 
                        Conectar um aparelho e escaneie o código abaixo
                      </p>
                    </div>
                    
                    <div className="flex justify-center mb-4">
                      <div className="bg-white dark:bg-dark-surface p-4 rounded-lg border-2 border-gray-200 dark:border-dark-border">
                        <img 
                          src={qrcode.startsWith('data:') ? qrcode : `data:image/png;base64,${qrcode}`}
                          alt="QR Code WhatsApp"
                          className="w-64 h-64 mx-auto"
                        />
                      </div>
                    </div>

                    <div className="text-center">
                      <button
                        onClick={handleConfigure}
                        disabled={isConfiguring}
                        className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium disabled:opacity-50"
                      >
                        {isConfiguring ? 'Gerando novo código...' : 'Gerar novo código'}
                      </button>
                    </div>
                  </div>
                )}

                {connectionStatus.connected && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                    <div className="text-4xl mb-3">✅</div>
                    <h4 className="font-semibold text-green-900 dark:text-green-400 mb-2">
                      WhatsApp Conectado!
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Sua conta do WhatsApp está conectada e pronta para enviar notificações
                    </p>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    💡 <strong>Dica:</strong> O código QR expira após alguns minutos. 
                    Se o código não funcionar, clique em "Gerar novo código" para obter um novo.
                  </p>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Carregando...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

