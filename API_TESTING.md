# API Testing Guide - Route Optimizer

## 🚀 Deploy Status: SUCESSO!

Seu backend está rodando perfeitamente no Railway! O erro "Cannot GET /" que você viu é **normal** - é uma API REST, não um site web.

## 📍 Endpoints da API

Substitua `YOUR_RAILWAY_URL` pela URL do seu deploy no Railway (ex: `https://logistica-production.up.railway.app`)

### 1. Health Check (Teste rápido)

```bash
curl https://YOUR_RAILWAY_URL/health
```

**Resposta esperada:**
```json
{
  "status": "ok"
}
```

### 2. Root Endpoint (Documentação da API)

```bash
curl https://YOUR_RAILWAY_URL/
```

**Resposta esperada:**
```json
{
  "name": "Route Optimizer API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": { ... }
}
```

---

## 🔐 Fluxo de Autenticação

### 1. Registrar Novo Usuário

```bash
curl -X POST https://YOUR_RAILWAY_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@empresa.com",
    "password": "senha123"
  }'
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "name": "João Silva",
    "email": "joao@empresa.com"
  }
}
```

**Guarde o token!** Você vai precisar dele para todas as outras requisições.

### 2. Login (se já tiver conta)

```bash
curl -X POST https://YOUR_RAILWAY_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@empresa.com",
    "password": "senha123"
  }'
```

### 3. Ver Meus Dados

```bash
curl https://YOUR_RAILWAY_URL/api/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 🏢 Gerenciar Business

### 1. Criar Empresa

```bash
curl -X POST https://YOUR_RAILWAY_URL/api/business \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Entregas Rápidas LTDA",
    "address": "Av Paulista, 1000, São Paulo - SP"
  }'
```

### 2. Listar Empresas

```bash
curl https://YOUR_RAILWAY_URL/api/business \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 🚗 Gerenciar Motoristas

### 1. Criar Motorista

```bash
curl -X POST https://YOUR_RAILWAY_URL/api/drivers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Carlos Motorista",
    "phone": "11999999999",
    "vehicleType": "VAN"
  }'
```

### 2. Listar Motoristas

```bash
curl https://YOUR_RAILWAY_URL/api/drivers \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 3. Atualizar Motorista

```bash
curl -X PUT https://YOUR_RAILWAY_URL/api/drivers/DRIVER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Carlos Silva",
    "phone": "11988888888"
  }'
```

### 4. Deletar Motorista

```bash
curl -X DELETE https://YOUR_RAILWAY_URL/api/drivers/DRIVER_ID \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 🗺️ Otimizar Rotas (Principal Funcionalidade!)

### 1. Criar e Otimizar Rota com 1 Motorista

```bash
curl -X POST https://YOUR_RAILWAY_URL/api/routes/optimize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Entregas Zona Sul - 13/12/2025",
    "date": "2025-12-13",
    "start_address": "Av Paulista, 1000, São Paulo - SP",
    "num_drivers": 1,
    "mode": "SINGLE_DRIVER",
    "stops": [
      {
        "client_name": "Cliente 1",
        "address": "Rua Augusta, 500, São Paulo - SP",
        "priority": "HIGH"
      },
      {
        "client_name": "Cliente 2",
        "address": "Av Brigadeiro Faria Lima, 1000, São Paulo - SP",
        "priority": "NORMAL"
      },
      {
        "client_name": "Cliente 3",
        "address": "Rua Oscar Freire, 200, São Paulo - SP",
        "priority": "NORMAL"
      }
    ]
  }'
```

### 2. Criar e Otimizar Rota com Múltiplos Motoristas

```bash
curl -X POST https://YOUR_RAILWAY_URL/api/routes/optimize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Entregas Grande SP - 13/12/2025",
    "date": "2025-12-13",
    "start_address": "Av Paulista, 1000, São Paulo - SP",
    "num_drivers": 3,
    "mode": "AUTO_DISTRIBUTION",
    "stops": [
      {
        "client_name": "Cliente Zona Sul 1",
        "address": "Av Ibirapuera, 500, São Paulo - SP",
        "priority": "HIGH"
      },
      {
        "client_name": "Cliente Zona Norte 1",
        "address": "Av Cruzeiro do Sul, 1000, São Paulo - SP",
        "priority": "NORMAL"
      },
      {
        "client_name": "Cliente Zona Leste 1",
        "address": "Av Radial Leste, 2000, São Paulo - SP",
        "priority": "NORMAL"
      },
      {
        "client_name": "Cliente Zona Sul 2",
        "address": "Av Santo Amaro, 1500, São Paulo - SP",
        "priority": "HIGH"
      },
      {
        "client_name": "Cliente Centro 1",
        "address": "Praça da Sé, São Paulo - SP",
        "priority": "LOW"
      }
    ]
  }'
```

**Resposta esperada:**
```json
{
  "id": "route-uuid",
  "name": "Entregas Grande SP - 13/12/2025",
  "status": "PENDING",
  "scheduledDate": "2025-12-13T00:00:00.000Z",
  "totalDistanceKm": "45.32",
  "totalDurationMinutes": 125,
  "totalCost": "67.98",
  "googleMapsLink": "https://www.google.com/maps/dir/...",
  "whatsappMessage": "🚚 *Rota Otimizada: Entregas Grande SP*\n\n📅 *Data:* 13/12/2025...",
  "assignments": [
    {
      "id": "assignment-uuid-1",
      "driverId": "driver-uuid-1",
      "position": 0,
      "distanceKm": "15.20",
      "durationMinutes": 42,
      "cost": "22.80"
    },
    ...
  ],
  "stops": [
    {
      "id": "stop-uuid-1",
      "order": 1,
      "title": "Cliente Zona Sul 1",
      "address": "Av Ibirapuera, 500, São Paulo - SP",
      "assignedDriverId": "driver-uuid-1"
    },
    ...
  ]
}
```

### 3. Listar Rotas

```bash
curl https://YOUR_RAILWAY_URL/api/routes \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 4. Ver Detalhes de Uma Rota

```bash
curl https://YOUR_RAILWAY_URL/api/routes/ROUTE_ID \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 🧪 Teste Completo (Passo a Passo)

Execute esses comandos na ordem para testar todo o fluxo:

```bash
# 1. Verificar se API está rodando
curl https://YOUR_RAILWAY_URL/health

# 2. Criar conta
TOKEN=$(curl -s -X POST https://YOUR_RAILWAY_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste User",
    "email": "teste@empresa.com",
    "password": "senha123"
  }' | jq -r '.token')

echo "Token: $TOKEN"

# 3. Criar business
BUSINESS_ID=$(curl -s -X POST https://YOUR_RAILWAY_URL/api/business \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Empresa Teste",
    "address": "Av Paulista, 1000, São Paulo"
  }' | jq -r '.id')

echo "Business ID: $BUSINESS_ID"

# 4. Criar motoristas
DRIVER1_ID=$(curl -s -X POST https://YOUR_RAILWAY_URL/api/drivers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Motorista 1",
    "phone": "11999999999",
    "vehicleType": "CAR"
  }' | jq -r '.id')

echo "Driver 1 ID: $DRIVER1_ID"

# 5. Otimizar rota
ROUTE=$(curl -s -X POST https://YOUR_RAILWAY_URL/api/routes/optimize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Teste Rota",
    "start_address": "Av Paulista, 1000, São Paulo",
    "num_drivers": 1,
    "mode": "SINGLE_DRIVER",
    "stops": [
      {
        "client_name": "Cliente A",
        "address": "Rua Augusta, 500, São Paulo",
        "priority": "HIGH"
      },
      {
        "client_name": "Cliente B",
        "address": "Av Faria Lima, 1000, São Paulo",
        "priority": "NORMAL"
      }
    ]
  }')

echo "Rota criada:"
echo "$ROUTE" | jq .

# 6. Ver link do Google Maps
echo "Link Google Maps:"
echo "$ROUTE" | jq -r '.googleMapsLink'

# 7. Ver mensagem WhatsApp
echo "Mensagem WhatsApp:"
echo "$ROUTE" | jq -r '.whatsappMessage'
```

---

## 🌐 Conectar Frontend ao Backend

### Opção 1: Deploy do Frontend no Railway

1. Crie um novo serviço no Railway para o frontend
2. Configure a variável de ambiente:
   ```
   VITE_API_BASE_URL=https://YOUR_BACKEND_RAILWAY_URL
   ```
3. Deploy automático do frontend

### Opção 2: Rodar Frontend Localmente

1. No arquivo `.env` do frontend:
   ```bash
   VITE_API_BASE_URL=https://YOUR_RAILWAY_URL
   ```

2. Rodar o frontend:
   ```bash
   cd route-optimizer-app/frontend
   npm install
   npm run dev
   ```

3. Acessar: `http://localhost:5173`

---

## 🐛 Troubleshooting

### Erro 401 Unauthorized
- Verifique se está enviando o token no header `Authorization: Bearer TOKEN`
- O token expira em 7 dias, faça login novamente se necessário

### Erro 404 Not Found
- Verifique se a URL está correta
- Lembre-se: rotas protegidas precisam de `/api/` no início

### Erro 500 Internal Server Error
- Verifique os logs no Railway Dashboard
- Pode ser erro de geocoding (endereço inválido)
- Verifique se o `OPENROUTE_API_KEY` está configurado (opcional)

### Performance de Geocoding
- Com `OPENROUTE_API_KEY`: ~2-5 segundos por rota
- Sem API key (Nominatim): ~5-10 segundos por rota
- Com muitas paradas: pode levar mais tempo

---

## 💰 Custos Estimados

### Railway (com banco PostgreSQL)
- **Tier Grátis**: $5/mês de créditos grátis
- **Uso Estimado**: ~$3-5/mês (backend + PostgreSQL)
- **Resultado**: Praticamente grátis! 🎉

### APIs de Geocoding
- **OpenRouteService**: Grátis até 2000 requisições/dia
- **Nominatim**: 100% grátis (respeitando rate limits)
- **Resultado**: Custo ZERO vs $13+ por otimização do Google Maps 🔥

---

## 📊 Próximos Passos

1. ✅ Deploy do backend funcionando
2. ⏳ Testar API com curl/Postman
3. ⏳ Deploy do frontend no Railway
4. ⏳ Criar primeiros usuários e testar interface
5. ⏳ Adicionar mais funcionalidades (histórico, analytics, etc)

**Parabéns! Seu app está no ar! 🚀**
