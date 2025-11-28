# 🔐 Credenciais do Sistema

## 👤 Usuário Administrador

Após executar `npm run seed`, o seguinte usuário admin será criado:

```
Email: admin@cassino.com
Senha: admin123
CPF: 00000000000
Código de Convite: ADMIN001
```

### Permissões do Admin

- ✅ Acesso total ao sistema
- ✅ Aprovação de saques
- ✅ Gerenciamento de usuários
- ✅ Configurações do sistema
- ✅ Carteira com R$ 10.000 para testes

## 🗄️ PostgreSQL (Docker)

```
Host: localhost
Porta: 5433
Usuário: cassino_user
Senha: cassino_password
Database: cassino_db
```

**Connection String:**
```
postgresql://cassino_user:cassino_password@localhost:5433/cassino_db?schema=public
```

## 📊 PGAdmin (Docker)

Interface web para gerenciar o PostgreSQL:

```
URL: http://localhost:5050
Email: admin@cassino.com
Senha: admin123
```

### Conectar ao PostgreSQL no PGAdmin:

1. Acesse http://localhost:5050
2. Login com as credenciais acima
3. Add New Server:
   - **Name:** Cassino DB
   - **Host:** `postgres` (ou `host.docker.internal` se não funcionar)
   - **Port:** `5432` (porta interna do container)
   - **Database:** `cassino_db`
   - **Username:** `cassino_user`
   - **Password:** `cassino_password`

## 🎰 Dados Criados pelo Seed

### Configurações do Sistema
- Moeda: BRL (R$)
- Depósito mínimo: R$ 10
- Depósito máximo: R$ 10.000
- Saque mínimo: R$ 20
- Saque máximo: R$ 5.000
- Bônus primeiro depósito: 100%
- Rollover: 30x

### Níveis VIP
1. Bronze (0 - 1.000 pontos)
2. Prata (1.001 - 5.000 pontos)
3. Ouro (5.001 - 20.000 pontos)
4. Platina (20.001 - 50.000 pontos)
5. Diamante (50.001+ pontos)

### Categorias de Jogos
- Slots
- Cassino ao Vivo
- Crash
- Populares
- Novos

## 🔄 Como Executar o Seed

```bash
# Primeira vez ou para resetar dados
npm run seed
```

## ⚠️ Segurança em Produção

**IMPORTANTE:** Antes de colocar em produção, você DEVE:

1. **Alterar a senha do admin:**
```bash
# Fazer login e atualizar via API ou diretamente no banco
```

2. **Alterar credenciais do PostgreSQL:**
Edite o `docker-compose.yml`:
```yaml
POSTGRES_PASSWORD: SUA_SENHA_FORTE_AQUI
```

3. **Alterar senha do PGAdmin:**
```yaml
PGADMIN_DEFAULT_PASSWORD: SUA_SENHA_FORTE_AQUI
```

4. **Gerar JWT_SECRET forte:**
```bash
# No .env
JWT_SECRET="gere-uma-chave-aleatoria-muito-longa-e-segura"
```

5. **Desabilitar PGAdmin em produção:**
Comente/remova o serviço do `docker-compose.yml`

## 📝 Testando o Login

### Via cURL

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cassino.com",
    "password": "admin123"
  }'
```

### Via JavaScript/Axios

```javascript
const response = await axios.post('http://localhost:3000/api/auth/login', {
  email: 'admin@cassino.com',
  password: 'admin123'
});

const { access_token, user } = response.data.data;
console.log('Token:', access_token);
console.log('User:', user);
```

## 🔑 Usando o Token

Após o login, use o token retornado em todas as requisições autenticadas:

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 📚 Outras Credenciais

### Asaas (Gateway de Pagamento)
Configure no `.env`:
```
ASAAS_API_KEY=sua-api-key-asaas
```

### PGSoft (Provider de Jogos)
Configure no `.env`:
```
PGSOFT_AGENT_ID=seu-agent-id
PGSOFT_SECRET_KEY=sua-secret-key
```

## 🆘 Problemas com Login?

1. Certifique-se de que executou o seed:
```bash
npm run seed
```

2. Verifique se o usuário existe no banco:
```bash
docker exec -it cassino-postgres psql -U cassino_user -d cassino_db -c "SELECT id, email, name, is_admin FROM users WHERE email = 'admin@cassino.com';"
```

3. Se necessário, recrie o usuário:
```bash
# Resetar banco (CUIDADO: apaga todos os dados)
docker-compose down -v
docker-compose up -d
npx prisma db push
npm run seed
```

## 💡 Dicas

- Use o PGAdmin para visualizar/editar dados facilmente
- O admin tem saldo inicial de R$ 10.000 para testes
- Todos os endpoints de admin verificam `isAdmin: true`
- Guarde as credenciais em local seguro
- Não commite credenciais no Git

---

**Última atualização:** 2024

