import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';

interface Stop {
  id: string;
  client_name: string;
  address: string;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
}

export function NewRoutePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [routeName, setRouteName] = useState('');
  const [routeDate, setRouteDate] = useState('');
  const [startAddress, setStartAddress] = useState('');
  const [numDrivers, setNumDrivers] = useState(1);
  const [stops, setStops] = useState<Stop[]>([
    { id: '1', client_name: '', address: '', priority: 'NORMAL' },
  ]);

  const addStop = () => {
    const newStop: Stop = {
      id: Date.now().toString(),
      client_name: '',
      address: '',
      priority: 'NORMAL',
    };
    setStops([...stops, newStop]);
  };

  const removeStop = (id: string) => {
    if (stops.length > 1) {
      setStops(stops.filter((stop) => stop.id !== id));
    }
  };

  const updateStop = (id: string, field: keyof Stop, value: string) => {
    setStops(
      stops.map((stop) =>
        stop.id === id ? { ...stop, [field]: value } : stop
      )
    );
  };

  const handleOptimize = async () => {
    setError('');

    // Validações
    if (!routeName.trim()) {
      setError('Nome da rota é obrigatório');
      return;
    }

    if (!startAddress.trim()) {
      setError('Endereço de início é obrigatório');
      return;
    }

    const validStops = stops.filter(
      (s) => s.client_name.trim() && s.address.trim()
    );

    if (validStops.length === 0) {
      setError('Adicione pelo menos uma parada válida');
      return;
    }

    if (numDrivers < 1) {
      setError('Número de motoristas deve ser pelo menos 1');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: routeName,
        date: routeDate || undefined,
        start_address: startAddress,
        num_drivers: numDrivers,
        mode: numDrivers === 1 ? 'SINGLE_DRIVER' : 'AUTO_DISTRIBUTION',
        stops: validStops.map((stop) => ({
          client_name: stop.client_name,
          address: stop.address,
          priority: stop.priority,
        })),
      };

      const response = await apiClient.post('/api/routes/optimize', payload);

      // Redireciona para a rota criada
      navigate(`/routes/${response.data.id}`);
    } catch (err: any) {
      console.error('Erro ao otimizar rota:', err);
      setError(
        err.response?.data?.message ||
          'Erro ao otimizar rota. Verifique os dados e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Nova rota</h1>
          <p className="text-slate-600">
            Configure as entregas e otimize automaticamente
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
          <p className="font-semibold">Erro</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Informações básicas */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <h2 className="font-semibold text-lg">Informações básicas</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nome da rota *
              </label>
              <input
                type="text"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                placeholder="Ex: Entregas Zona Sul"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Data (opcional)
              </label>
              <input
                type="date"
                value={routeDate}
                onChange={(e) => setRouteDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Endereço de início *
              </label>
              <input
                type="text"
                value={startAddress}
                onChange={(e) => setStartAddress(e.target.value)}
                placeholder="Ex: Av Paulista, 1000, São Paulo"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Ponto de partida dos motoristas
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Número de motoristas *
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={numDrivers}
                onChange={(e) => setNumDrivers(parseInt(e.target.value) || 1)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                As entregas serão distribuídas entre os motoristas
              </p>
            </div>
          </div>
        </div>

        {/* Coluna 2 e 3: Paradas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">
                Paradas ({stops.length})
              </h2>
              <button
                onClick={addStop}
                className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-medium transition-colors"
              >
                + Adicionar parada
              </button>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {stops.map((stop, index) => (
                <div
                  key={stop.id}
                  className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">
                      Parada {index + 1}
                    </span>
                    {stops.length > 1 && (
                      <button
                        onClick={() => removeStop(stop.id)}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Remover
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Nome do cliente *
                      </label>
                      <input
                        type="text"
                        value={stop.client_name}
                        onChange={(e) =>
                          updateStop(stop.id, 'client_name', e.target.value)
                        }
                        placeholder="Ex: João Silva"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Prioridade
                      </label>
                      <select
                        value={stop.priority}
                        onChange={(e) =>
                          updateStop(
                            stop.id,
                            'priority',
                            e.target.value as Stop['priority']
                          )
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="NORMAL">Normal</option>
                        <option value="HIGH">Alta</option>
                        <option value="LOW">Baixa</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Endereço *
                    </label>
                    <input
                      type="text"
                      value={stop.address}
                      onChange={(e) =>
                        updateStop(stop.id, 'address', e.target.value)
                      }
                      placeholder="Ex: Rua das Flores, 123, São Paulo"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botão de otimizar */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleOptimize}
              disabled={loading}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-colors ${
                loading
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } text-white`}
            >
              {loading ? 'Otimizando...' : '🚀 Otimizar rota'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
