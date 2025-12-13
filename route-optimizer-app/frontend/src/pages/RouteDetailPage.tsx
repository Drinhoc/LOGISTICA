import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';

interface Route {
  id: string;
  name: string;
  scheduledDate: string | null;
  status: string;
  totalDistanceKm: string;
  totalDurationMinutes: number;
  totalCost: string;
  googleMapsLink: string | null;
  whatsappMessage: string | null;
  createdAt: string;
  assignments: Assignment[];
  stops: Stop[];
}

interface Assignment {
  id: string;
  driverId: string;
  position: number;
  distanceKm: string;
  durationMinutes: number;
  cost: string;
  driver?: {
    id: string;
    name: string;
  };
}

interface Stop {
  id: string;
  order: number;
  title: string;
  address: string;
  assignedDriverId: string | null;
}

export function RouteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const response = await apiClient.get(`/api/routes/${id}`);
        setRoute(response.data);
      } catch (err: any) {
        console.error('Erro ao carregar rota:', err);
        setError(err.response?.data?.message || 'Erro ao carregar rota');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRoute();
    }
  }, [id]);

  const copyWhatsapp = () => {
    if (route?.whatsappMessage) {
      navigator.clipboard.writeText(route.whatsappMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Sem data';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(date);
  };

  const formatNumber = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-slate-600">Carregando rota...</p>
        </div>
      </div>
    );
  }

  if (error || !route) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
          <p className="font-semibold">Erro</p>
          <p className="text-sm">{error || 'Rota não encontrada'}</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  // Agrupar stops por motorista
  const stopsByDriver = route.stops.reduce((acc, stop) => {
    const driverId = stop.assignedDriverId || 'unassigned';
    if (!acc[driverId]) acc[driverId] = [];
    acc[driverId].push(stop);
    return acc;
  }, {} as Record<string, Stop[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link to="/" className="text-sm text-indigo-600 hover:text-indigo-700 mb-2 inline-block">
            ← Voltar ao Dashboard
          </Link>
          <h1 className="text-2xl font-semibold">{route.name}</h1>
          <p className="text-slate-600">
            {formatDate(route.scheduledDate)} • {route.stops.length} paradas
          </p>
        </div>
        <span className="rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
          {route.status}
        </span>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Distância total</p>
          <p className="text-3xl font-semibold text-slate-900 mt-1">
            {formatNumber(route.totalDistanceKm)} km
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Duração estimada</p>
          <p className="text-3xl font-semibold text-slate-900 mt-1">
            {Math.round(route.totalDurationMinutes)} min
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Custo estimado</p>
          <p className="text-3xl font-semibold text-slate-900 mt-1">
            R$ {formatNumber(route.totalCost)}
          </p>
        </div>
      </div>

      {/* Links úteis */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="font-semibold text-lg">Links e compartilhamento</h2>

        {route.googleMapsLink && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Google Maps
            </label>
            <a
              href={route.googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🗺️ Abrir no Google Maps
            </a>
          </div>
        )}

        {route.whatsappMessage && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Mensagem WhatsApp
            </label>
            <div className="flex gap-2">
              <textarea
                readOnly
                value={route.whatsappMessage}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono bg-slate-50 min-h-[120px]"
              />
              <button
                onClick={copyWhatsapp}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors h-fit"
              >
                {copied ? '✓ Copiado!' : '📋 Copiar'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Motoristas e suas rotas */}
      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Distribuição por motorista</h2>

        {route.assignments.map((assignment, idx) => {
          const driverStops = stopsByDriver[assignment.driverId] || [];
          const sortedStops = driverStops.sort((a, b) => a.order - b.order);

          return (
            <div key={assignment.id} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    Motorista {idx + 1}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {sortedStops.length} paradas
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Distância</p>
                  <p className="font-semibold">{formatNumber(assignment.distanceKm)} km</p>
                  <p className="text-sm text-slate-500 mt-2">Custo</p>
                  <p className="font-semibold">R$ {formatNumber(assignment.cost)}</p>
                </div>
              </div>

              {/* Lista de paradas */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Sequência de paradas:</p>
                <div className="space-y-2">
                  {sortedStops.map((stop) => (
                    <div
                      key={stop.id}
                      className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm">
                        {stop.order}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{stop.title}</p>
                        <p className="text-sm text-slate-600">{stop.address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ações */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
        >
          Voltar ao Dashboard
        </button>
        <button
          onClick={() => navigate('/routes/new')}
          className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
        >
          Nova Rota
        </button>
      </div>
    </div>
  );
}
