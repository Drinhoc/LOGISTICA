import { Link, NavLink, Outlet } from 'react-router-dom';

const navLinkBase =
  'text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors';

const activeClass = 'text-slate-900 font-semibold';

export function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="text-lg font-semibold text-slate-900">
            Route Optimizer
          </Link>
          <nav className="flex items-center gap-4">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `${navLinkBase} ${isActive ? activeClass : ''}`.trim()
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/routes/new"
              className={({ isActive }) =>
                `${navLinkBase} ${isActive ? activeClass : ''}`.trim()
              }
            >
              Nova rota
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `${navLinkBase} ${isActive ? activeClass : ''}`.trim()
              }
            >
              Configurações
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
