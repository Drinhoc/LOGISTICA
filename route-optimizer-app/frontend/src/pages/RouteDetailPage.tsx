import { useParams } from 'react-router-dom';

export function RouteDetailPage() {
  const { id } = useParams();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Detalhes da rota</h1>
        <p className="text-slate-600">Visualize o itinerário e custos da rota.</p>
      </div>
      <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
        <p className="text-sm text-slate-500">ID da rota</p>
        <p className="text-lg font-semibold">{id}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-dashed border-slate-300 rounded-lg p-4 h-32 flex items-center justify-center text-slate-500">
          Lista de paradas otimizadas
        </div>
        <div className="border border-dashed border-slate-300 rounded-lg p-4 h-32 flex items-center justify-center text-slate-500">
          Cálculo de custos e links compartilháveis
        </div>
      </div>
    </div>
  );
}
