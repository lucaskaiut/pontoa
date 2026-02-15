import React, { useState, useEffect } from 'react';
import { roleService } from '../../../services/roleService';
import toast from 'react-hot-toast';

export function RoleStep({ onNext, onSkip, onBack }) {
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [],
  });

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const response = await roleService.getPermissions();
      console.log('RoleStep - Permissions response:', response);
      
      const permissionsData = response.permissions || response || [];
      console.log('RoleStep - Permissions data:', permissionsData);
      
      setAvailablePermissions(permissionsData);
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
      toast.error('Erro ao carregar permissões');
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  const handleTogglePermission = (permissionName) => {
    if (formData.permissions.includes(permissionName)) {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter(p => p !== permissionName),
      });
    } else {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, permissionName],
      });
    }
  };

  const handleCreate = async () => {
    if (!formData.name) {
      toast.error('Informe o nome do perfil');
      return;
    }

    setIsCreating(true);
    try {
      await roleService.create(formData);
      toast.success('Perfil criado com sucesso!');
      onNext(true);
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      toast.error('Erro ao criar perfil. Tente novamente.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🎭</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Crie Perfis de Acesso
        </h3>
        <p className="text-gray-600">
          Configure perfis para controlar o que cada colaborador pode fazer
        </p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-6 mb-6">
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Perfil *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Atendente, Gerente, Profissional"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva as responsabilidades deste perfil"
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
          </div>

          {isLoadingPermissions ? (
            <div className="text-center py-4 text-gray-500">
              Carregando permissões...
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Permissões
              </label>
              <div className="grid gap-2 max-h-64 overflow-y-auto">
                {availablePermissions.map((permission) => {
                  const permissionName = typeof permission === 'string' ? permission : permission.name;
                  const permissionLabel = typeof permission === 'string' 
                    ? permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                    : permission.label || permission.name;
                  
                  return (
                    <label
                      key={permissionName}
                      className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(permissionName)}
                        onChange={() => handleTogglePermission(permissionName)}
                        className="w-5 h-5 text-purple-500 rounded focus:ring-purple-400"
                      />
                      <span className="text-gray-700">
                        {permissionLabel}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Dica:</strong> Você pode criar perfis como "Atendente" com permissões 
              limitadas ou "Gerente" com acesso total. Isso ajuda a organizar sua equipe.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          ← Voltar
        </button>

        <div className="flex gap-3">
          <button
            onClick={onSkip}
            disabled={isCreating}
            className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors disabled:opacity-50"
          >
            Pular esta etapa
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating || isLoadingPermissions}
            className="bg-linear-to-r from-purple-400 to-blue-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isCreating ? 'Criando...' : 'Criar e Continuar'}
          </button>
        </div>
      </div>
    </div>
  );
}

