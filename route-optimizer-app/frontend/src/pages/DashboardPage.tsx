import { Link } from 'react-router-dom';
import { useRoutes } from '../hooks/useRoutes';

function formatDate(value: string | null) {
  if (!value) return 'Sem data';
  const date = new Date(value);
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(date);
}

function formatNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) return '0';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(num)) return '0';
  return num.toFixed(1);
}

export function DashboardPage() {
  const { data, isLoading, isError, error } = useRoutes();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-slate-600">
            Acompanhe suas rotas otimizadas e acesse atalhos rápidos.
          </p>
        </div>
        <Link
          to="/routes/new"
          className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          Nova rota
        </Link>
      </div>

      {isLoading && <p className="text-slate-600">Carregando rotas...</p>}
      {isError && (
        <p className="text-red-600">Erro ao carregar rotas: {(error as Error).message}</p>
      )}

      {data && data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((route) => (
            <Link
              to={`/routes/${route.id}`}
              key={route.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Rota</p>
                  <h2 className="text-lg font-semibold text-slate-900">{route.name}</h2>
                  <p className="text-sm text-slate-600">{formatDate(route.scheduledDate || route.createdAt)}</p>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {route.assignments?.length ?? 0} motoboy(s)
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Distância total</span>
                  <span className="font-semibold">{formatNumber(route.totalDistanceKm)} km</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Entregas</span>
                  <span className="font-semibold">{route.stops?.length ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Custo estimado</span>
                  <span className="font-semibold">
                    R$ {formatNumber(route.totalCost)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        !isLoading && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
            <p className="font-semibold text-slate-700">Nenhuma rota criada ainda.</p>
            <p className="mt-2">Crie a primeira rota para ver o histórico aqui.</p>
            <Link
              to="/routes/new"
              className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Nova rota
            </Link>
          </div>
        )
      )}
export function DashboardPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-slate-600">
          Acompanhe suas rotas, motoboys e custos em um só lugar.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
          <p className="text-sm text-slate-500">Rotas otimizadas</p>
          <p className="text-3xl font-semibold">0</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
          <p className="text-sm text-slate-500">Motoboys ativos</p>
          <p className="text-3xl font-semibold">0</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
          <p className="text-sm text-slate-500">Custo médio / rota</p>
          <p className="text-3xl font-semibold">R$ 0,00</p>
        </div>
      </div>
    </div>
  );
}
