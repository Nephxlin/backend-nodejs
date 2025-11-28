# 🔐 Configuração do Kwai Pixel

## ✅ **Configuração Atual (Banco de Dados)**

```
Pixel ID: 296262408561528
Access Token: kJL-0JsfVjtHQagFj6ReFCp0KCIjerngblSnJjd76uw
Status: Ativo
```

---

## 📊 **Detalhes**

- **Tabela:** `kwai_pixels`
- **Campo Pixel ID:** `pixel_id` = `296262408561528`
- **Campo Access Token:** `access_token` = `kJL-0JsfVjtHQagFj6ReFCp0KCIjerngblSnJjd76uw`
- **Ativo:** `is_active` = `true`

---

## 🔍 **Como Verificar**

### **Via Prisma Studio:**
```bash
cd backend-nodejs
npx prisma studio
```

Abra a tabela `kwai_pixels` e verifique os dados.

---

### **Via API:**
```
GET http://localhost:3005/api/settings/kwai-pixels
```

**Response esperado:**
```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "pixelId": "296262408561528",
      "name": "Kwai Pixel Principal",
      "isActive": true
    }
  ]
}
```

⚠️ **Nota:** O `accessToken` NÃO é exposto na API pública por segurança.

---

## 🧪 **Testar no Frontend**

### **1. Sem parâmetros (usa pixel da API):**
```
http://localhost:3006
```

**Console esperado:**
```
✅ [Kwai Config] Pixel carregado da API: 296262408561528
✅ [Kwai Pixel] 🚀 Carregando pixel ID: 296262408561528
✅ [Kwai Pixel] ✅ SDK carregado com sucesso!
```

---

### **2. Com debug mode:**
```
http://localhost:3006?debug=true
```

**Debug Panel deve mostrar:**
```
SDK Status: 🟢 Carregado
Pixel ID: 296262408561528
```

---

### **3. Com Click ID de teste:**
```
http://localhost:3006?clickid=0D0NElE9N8onlSxVmaAuGA&debug=true
```

Para testar eventos no Kwai Test Server.

---

## 🔐 **Segurança**

### **Access Token:**
- ✅ Armazenado no banco de dados
- ✅ NÃO exposto na API pública (`/api/settings/kwai-pixels`)
- ✅ Apenas acessível via admin routes (se implementado)
- ✅ Usado para eventos server-side (futuro)

### **Pixel ID:**
- ✅ Público (pode ser exposto no frontend)
- ✅ Necessário para `kwaiq.load(PIXEL_ID)`

---

## 📝 **SQL de Referência**

### **Verificar dados:**
```sql
SELECT * FROM kwai_pixels;
```

### **Atualizar Pixel ID:**
```sql
UPDATE kwai_pixels 
SET pixel_id = '296262408561528' 
WHERE id = 1;
```

### **Atualizar Access Token:**
```sql
UPDATE kwai_pixels 
SET access_token = 'kJL-0JsfVjtHQagFj6ReFCp0KCIjerngblSnJjd76uw' 
WHERE id = 1;
```

### **Ativar/Desativar:**
```sql
UPDATE kwai_pixels 
SET is_active = true 
WHERE id = 1;
```

---

**Data:** 28 de Novembro de 2025  
**Pixel ID:** 296262408561528  
**Status:** ✅ Configurado no Banco

