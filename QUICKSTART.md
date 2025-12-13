# 🚀 Quick Start - Route Optimizer

## ✅ Status do Deploy: FUNCIONANDO!

Seu backend está rodando perfeitamente no Railway!

O "Cannot GET /" que você viu é **normal** - é uma API REST, não um site web. A API só responde em endpoints específicos como `/api/auth/login`, `/api/routes`, etc.

---

## 🧪 Teste Rápido (1 minuto)

Substitua `YOUR_RAILWAY_URL` pela URL do Railway (ex: `https://logistica-production.up.railway.app`)

### 1. Verificar se está online:

```bash
curl https://YOUR_RAILWAY_URL/health
```

Deve retornar: `{"status":"ok"}`

### 2. Ver documentação da API:

```bash
curl https://YOUR_RAILWAY_URL/
```

Vai mostrar todos os endpoints disponíveis! 📋

---

## 🖥️ Usando o Frontend

### Opção A: Rodar Localmente (Mais Rápido)

1. **Configure a URL do backend:**
   ```bash
   cd route-optimizer-app/frontend
   echo "VITE_API_BASE_URL=https://YOUR_RAILWAY_URL" > .env.local
   ```

2. **Instale e rode:**
   ```bash
   npm install
   npm run dev
   ```

3. **Abra no navegador:**
   - Acesse: `http://localhost:5173`
   - Clique em "Criar conta"
   - Crie seu primeiro usuário
   - Comece a criar rotas! 🎉

### Opção B: Deploy no Railway (Produção)

1. No Railway, crie um novo serviço
2. Conecte ao seu repositório GitHub
3. Configure variável de ambiente:
   - `VITE_API_BASE_URL` = URL do backend Railway
4. Deploy automático!

---

## 📱 Testando com cURL (Sem Frontend)

Se quiser testar direto pela linha de comando:

### 1. Criar conta:
```bash
curl -X POST https://YOUR_RAILWAY_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Seu Nome",
    "email": "seu@email.com",
    "password": "senha123"
  }'
```

Copie o `token` que vai aparecer na resposta!

### 2. Criar motorista:
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

### 3. Otimizar rota:
```bash
curl -X POST https://YOUR_RAILWAY_URL/api/routes/optimize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Entregas Teste",
    "start_address": "Av Paulista, 1000, São Paulo",
    "num_drivers": 1,
    "mode": "SINGLE_DRIVER",
    "stops": [
      {
        "client_name": "Cliente 1",
        "address": "Rua Augusta, 500, São Paulo",
        "priority": "HIGH"
      },
      {
        "client_name": "Cliente 2",
        "address": "Av Faria Lima, 1000, São Paulo",
        "priority": "NORMAL"
      }
    ]
  }'
```

Vai retornar a rota otimizada com:
- 📊 Distância total
- ⏱️ Tempo estimado
- 💰 Custo calculado
- 🗺️ Link do Google Maps
- 📱 Mensagem pronta para WhatsApp

---

## 📚 Documentação Completa

- **API_TESTING.md** - Todos os endpoints e exemplos detalhados
- **DEPLOY.md** - Guia completo de deploy no Railway
- **README.md** - Visão geral do projeto

---

## 🎯 Resumo do Que Foi Feito

1. ✅ **Backend completo** - Express + TypeScript + Prisma
2. ✅ **Algoritmos de otimização** - K-means + Nearest Neighbour + 2-opt
3. ✅ **API de geocoding gratuita** - OpenRouteService + Nominatim (sem custo!)
4. ✅ **Frontend React** - Interface completa e responsiva
5. ✅ **Deploy no Railway** - Backend rodando em produção
6. ✅ **Autenticação JWT** - Sistema seguro de login
7. ✅ **Multi-tenant** - Suporte para várias empresas

---

## 💡 Próximos Passos Sugeridos

1. **Testar a API** - Use os exemplos acima
2. **Rodar o frontend** - Opção A acima
3. **Criar primeira rota** - Interface gráfica ou cURL
4. **Ver otimização funcionando** - Algoritmo em ação!
5. **Compartilhar** - Mensagem WhatsApp gerada automaticamente

---

## ❓ Dúvidas?

- Erro 401? → Verifique se está enviando o token no header
- Erro 404? → Verifique se tem `/api/` na URL
- Geocoding lento? → Considere adicionar `OPENROUTE_API_KEY` no Railway
- Frontend não conecta? → Verifique se configurou `VITE_API_BASE_URL`

**🎉 Parabéns! Seu app de logística está funcionando!**
