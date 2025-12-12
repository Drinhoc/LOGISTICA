export function SettingsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Configurações</h1>
        <p className="text-slate-600">
          Gerencie dados do negócio, custos e preferências de rota.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-dashed border-slate-300 rounded-lg p-4 h-32 flex items-center justify-center text-slate-500">
          Dados do negócio e contato
        </div>
        <div className="border border-dashed border-slate-300 rounded-lg p-4 h-32 flex items-center justify-center text-slate-500">
          Custos (R$/km, R$/hora) e integração
        </div>
      </div>
    </div>
  );
}
