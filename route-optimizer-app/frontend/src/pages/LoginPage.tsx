import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, setAuthToken } from '../lib/apiClient';

export function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        const response = await apiClient.post('/api/auth/register', {
          name,
          email,
          password,
        });

        setAuthToken(response.data.token);
        navigate('/');
      } else {
        const response = await apiClient.post('/api/auth/login', {
          email,
          password,
        });

        setAuthToken(response.data.token);
        navigate('/');
      }
    } catch (err: any) {
      console.error('Erro ao autenticar:', err);
      setError(
        err.response?.data?.message ||
          `Erro ao ${mode === 'register' ? 'criar conta' : 'fazer login'}. Tente novamente.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 flex items-center justify-center px-4 text-slate-900">
      <div className="bg-white shadow-lg border border-slate-200 rounded-2xl p-8 w-full max-w-md space-y-6">
        {/* Logo/Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600 text-white text-2xl mb-2">
            🚀
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Route Optimizer
          </h1>
          <p className="text-sm text-slate-600">
            {mode === 'register'
              ? 'Crie sua conta e comece a otimizar'
              : 'Otimize suas rotas de entrega'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
              mode === 'login'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
              mode === 'register'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Criar conta
          </button>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700" htmlFor="name">
                Nome completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="João Silva"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="voce@empresa.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="••••••••"
              minLength={6}
            />
            {mode === 'register' && (
              <p className="text-xs text-slate-500 mt-1">
                Mínimo 6 caracteres
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-800">
              <p className="text-sm font-medium">Erro</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg py-2.5 font-semibold transition-colors ${
              loading
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            } text-white`}
          >
            {loading
              ? mode === 'register'
                ? 'Criando conta...'
                : 'Entrando...'
              : mode === 'register'
              ? 'Criar conta'
              : 'Entrar'}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200">
          <p className="text-center text-xs text-slate-500">
            {mode === 'register' ? (
              <>
                Ao criar uma conta, você concorda com nossos{' '}
                <a href="#" className="text-indigo-600 hover:text-indigo-700">
                  Termos de Uso
                </a>
              </>
            ) : (
              <>
                Primeira vez aqui? Clique em "Criar conta" acima
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
