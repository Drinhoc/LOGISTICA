export function NewRoutePage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Nova rota</h1>
          <p className="text-slate-600">Monte as entregas e atribua motoboys.</p>
        </div>
        <button className="bg-sky-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-sky-700 transition-colors">
          Otimizar rota
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-dashed border-slate-300 rounded-lg p-4 h-40 flex items-center justify-center text-slate-500">
          Formulário de paradas (endereço, prioridade)
        </div>
        <div className="border border-dashed border-slate-300 rounded-lg p-4 h-40 flex items-center justify-center text-slate-500">
          Seleção de motoboys e início
        </div>
      </div>
    </div>
  );
}
