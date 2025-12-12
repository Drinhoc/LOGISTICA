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
