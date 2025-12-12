import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loginMutation = useLogin();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 text-slate-900">
      <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-8 w-full max-w-md space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">Entrar</h1>
          <p className="text-sm text-slate-600">
            Acesse para otimizar e acompanhar suas rotas.
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
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
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="••••••••"
            />
          </div>
          {loginMutation.isError && (
            <p className="text-sm text-red-600">
              Não foi possível fazer login. Verifique suas credenciais e tente novamente.
            </p>
          )}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-sky-600 text-white rounded-lg py-2 font-semibold hover:bg-sky-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-600">
          Ainda não tem conta?{' '}
          <Link to="/dashboard" className="text-sky-600 hover:text-sky-700 font-medium">
            Ver demo
          </Link>
        </p>
      </div>
    </div>
  );
}
