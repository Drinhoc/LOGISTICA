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
O repositório inclui um `start.sh` na raiz para facilitar o deploy automático no Railway ou em qualquer buildpack que espere um comando de inicialização. O script instala dependências do backend, compila o TypeScript e inicia o servidor compilado:

```bash
./start.sh
```

Certifique-se de definir as variáveis de ambiente necessárias (vide `route-optimizer-app/backend/.env.example`).
