# 🚀 Guia de Deploy - Route Optimizer

## Railway Deploy (Backend + Database)

### 1. Criar conta no Railway
- Acesse https://railway.app
- Faça login com GitHub

### 2. Criar novo projeto
```bash
# Via Railway CLI (recomendado)
npm install -g @railway/cli
railway login
railway init
```

### 3. Adicionar PostgreSQL
No Railway Dashboard:
- Clique em "New" → "Database" → "PostgreSQL"
- O Railway vai gerar automaticamente a `DATABASE_URL`

### 4. Configurar Variáveis de Ambiente

**VARIÁVEIS OBRIGATÓRIAS:**
```bash
# No Railway Dashboard → Variables
PORT=8080
NODE_ENV=production
DATABASE_URL=${DATABASE_URL}  # Auto-preenchido pelo Railway
JWT_SECRET=GERE_UM_SECRET_FORTE_AQUI
JWT_EXPIRES_IN=7d
```

**VARIÁVEIS OPCIONAIS (mas recomendadas):**
```bash
# OpenRouteService (grátis até 2000 req/dia)
# Criar conta em: https://openrouteservice.org/dev/#/signup
OPENROUTE_API_KEY=sua_key_aqui
```

### 5. Gerar JWT Secret Forte
```bash
# Execute isso localmente para gerar um secret:
openssl rand -base64 32

# Ou use Node:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 6. Deploy
```bash
# Se estiver usando Railway CLI:
railway up

# Ou conecte o repositório GitHub no Railway Dashboard
# O Railway detecta automaticamente e usa o start.sh
```

### 7. Executar Migrations
```bash
# Depois do deploy, rode as migrations:
railway run npm run prisma:migrate:deploy --prefix route-optimizer-app/backend
railway run npm run prisma:generate --prefix route-optimizer-app/backend

# Ou conecte via shell:
railway shell
cd route-optimizer-app/backend
npx prisma migrate deploy
npx prisma generate
```

---

## 📝 Variáveis de Ambiente - Resumo Completo

### Backend (Railway)
| Variável | Obrigatória? | Valor Exemplo | Descrição |
|----------|--------------|---------------|-----------|
| `PORT` | ✅ Sim | `8080` | Porta do servidor |
| `NODE_ENV` | ✅ Sim | `production` | Ambiente |
| `DATABASE_URL` | ✅ Sim | `postgresql://...` | URL do PostgreSQL (Railway auto-gera) |
| `JWT_SECRET` | ✅ Sim | `[gerar com openssl]` | Secret para JWT tokens |
| `JWT_EXPIRES_IN` | ⚠️ Opcional | `7d` | Validade do token (default: 7d) |
| `OPENROUTE_API_KEY` | ⚠️ Opcional | `5b3ce...` | API key do OpenRouteService |

**Notas importantes:**
- ✅ **Sem `OPENROUTE_API_KEY`**: Sistema usa Nominatim (OSM) + Haversine (100% grátis, menos preciso)
- ✅ **Com `OPENROUTE_API_KEY`**: Sistema usa OpenRouteService (2000 req/dia grátis, mais preciso)
- ⚠️ **Nunca mais usar Google Maps API** (caro demais!)

---

## 🔑 Como Conseguir API Keys Grátis

### OpenRouteService (RECOMENDADO)
1. Acesse: https://openrouteservice.org/dev/#/signup
2. Crie conta grátis
3. Vá em "Request a Token"
4. Free tier: **2000 requests/dia** (suficiente para começar)
5. Copie a key e adicione como `OPENROUTE_API_KEY`

**Custo estimado:**
- Free tier: $0/mês (2000 req/dia)
- Se precisar mais: migrar pra OSRM self-hosted (grátis ilimitado)

### Alternativas (caso queira testar)

**Mapbox** (também tem free tier):
- 100,000 requests/mês grátis
- https://www.mapbox.com/pricing

**OSRM (totalmente grátis, self-hosted):**
- Precisa rodar servidor próprio
- Grátis ilimitado
- Mais complexo de configurar

---

## 🧪 Testando Localmente

### Backend
```bash
cd route-optimizer-app/backend

# 1. Criar arquivo .env (copiar do .env.example)
cp .env.example .env

# 2. Editar .env com suas variáveis
# Mínimo necessário:
# DATABASE_URL=postgresql://...
# JWT_SECRET=qualquer_coisa_aqui_local

# 3. Instalar dependências
npm install

# 4. Rodar migrations
npx prisma migrate dev
npx prisma generate

# 5. Iniciar servidor dev
npm run dev
```

### Frontend
```bash
cd route-optimizer-app/frontend

# 1. Instalar dependências
npm install

# 2. Criar .env (opcional)
# Adicionar VITE_API_URL se precisar apontar pra backend específico

# 3. Rodar dev server
npm run dev
```

---

## 📊 Checklist de Deploy

**Antes do primeiro deploy:**
- [ ] PostgreSQL criado no Railway
- [ ] Variável `DATABASE_URL` configurada (auto)
- [ ] Variável `JWT_SECRET` gerada e configurada
- [ ] Variável `PORT=8080` configurada
- [ ] Variável `NODE_ENV=production` configurada
- [ ] (Opcional) `OPENROUTE_API_KEY` criada e configurada
- [ ] Migrations rodadas (`prisma migrate deploy`)
- [ ] Build testado localmente (`npm run build`)

**Após deploy:**
- [ ] Backend respondendo (testar `https://seu-app.railway.app/health` ou similar)
- [ ] Criar primeiro usuário admin via API
- [ ] Testar autenticação
- [ ] Testar criação de business
- [ ] Testar otimização de rota básica

---

## 🐛 Troubleshooting

### "Missing env var: DATABASE_URL"
- Certifique-se que o PostgreSQL está adicionado no Railway
- Verifique se a variável está no dashboard

### "Missing env var: JWT_SECRET"
- Gere um secret: `openssl rand -base64 32`
- Adicione nas variáveis do Railway

### "OpenRouteService API error"
- Verifique se a key está correta
- Confirme se não excedeu o limite de 2000 req/dia
- O sistema funciona SEM a key (usa fallback grátis)

### Migrations não rodam
```bash
# Conecte no Railway e rode manualmente:
railway shell
cd route-optimizer-app/backend
npx prisma migrate deploy
npx prisma generate
```

### Build falha
```bash
# Teste localmente primeiro:
cd route-optimizer-app/backend
npm run build

# Verifique erros de TypeScript
npx tsc --noEmit
```

---

## 💰 Estimativa de Custos

### Grátis (Free Tier):
- **Railway**: $5 grátis/mês (suficiente para começar)
- **PostgreSQL**: Incluído no Railway
- **OpenRouteService**: 2000 req/dia grátis
- **Nominatim + Haversine**: Ilimitado grátis (fallback)

### Produção (após escalar):
- **Railway**: ~$10-20/mês (Hobby plan)
- **OpenRouteService**: Continua grátis se < 2000 req/dia
- **Se precisar mais**: Migrar pra OSRM self-hosted ($0)

**Total MVP: $0-5/mês** 🎉

---

## 📞 Suporte

Problemas com deploy?
1. Verifique logs no Railway Dashboard
2. Teste as variáveis de ambiente
3. Rode migrations manualmente se necessário
4. Verifique se o build passou

Tudo certo? Seu app deve estar rodando! 🚀
