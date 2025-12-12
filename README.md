# Route Optimizer App

Estrutura inicial do monorepo `route-optimizer-app`, contendo backend (Node.js + TypeScript + Express + Prisma) e frontend (React + TypeScript + Vite + Tailwind + React Query).

## Como rodar

### Backend
```bash
cd route-optimizer-app/backend
npm install
npm run dev
```

### Frontend
```bash
cd route-optimizer-app/frontend
npm install
npm run dev
```

### Build e preview
- Backend: `npm run build`
- Frontend: `npm run build` e `npm run preview`

### Deploy no Railway
Há um `package.json` na raiz que expõe o comando `npm start`, o qual chama o script `start.sh` (também na raiz) para instalar as dependências do backend, compilar o TypeScript e iniciar o servidor compilado. Isso ajuda o buildpack do Railway a detectar o projeto como Node e provisionar o Node/npm automaticamente.

```bash
npm start
# ou, se preferir, execute o script diretamente
O repositório inclui um `start.sh` na raiz para facilitar o deploy automático no Railway ou em qualquer buildpack que espere um comando de inicialização. O script instala dependências do backend, compila o TypeScript e inicia o servidor compilado:

```bash
./start.sh
```

Certifique-se de definir as variáveis de ambiente necessárias (vide `route-optimizer-app/backend/.env.example`).
