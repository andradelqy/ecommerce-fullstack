# 🛍️ NEXUS Commerce - E-commerce Full Stack Profissional

Plataforma de comércio eletrônico full stack de alta performance desenvolvida com **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Supabase (PostgreSQL, Auth e Storage)**, **Stripe** e **Resend**.

Projetada como projeto âncora para portfólio, demonstrando regras de negócio complexas, segurança contra adulteração de preços, controle transacional de estoque, painel administrativo e deploy contínuo no **Netlify**.

---

## ✨ Funcionalidades Principais

### 🛒 Loja & Experiência do Cliente
- **Catálogo Inteligente**: Busca textual em tempo real, filtros por categoria, ordenação (menor preço, maior preço, mais bem avaliados) e paginação no servidor.
- **Página de Produto Interativa**:
  - Galeria de imagens em alta resolução com miniaturas.
  - Seleção de variações de produto (tamanhos e cores).
  - Cálculo de frete simulado via CEP.
  - Sistema de avaliações de clientes com notas de 1 a 5 estrelas e recalculo automático via triggers no PostgreSQL.
- **Carrinho de Compras Persistente**:
  - Drawer lateral (*slide-over*) e página dedicada.
  - Sincronização segura com `localStorage`.
  - Agrupamento único por variação (`id + tamanho + cor`).
  - Aplicação e validação de **Cupons de Desconto**.
- **Checkout Seguro com Stripe**:
  - Validação estrita de preços no servidor (impede fraudes via DevTools).
  - Registro de pedido preliminar no banco (evita limites de metadata do Stripe).
  - Suporte a Cartão de Crédito, Boleto e Pix.
- **Área do Cliente**:
  - Login e Cadastro com Supabase Auth.
  - Histórico de pedidos (*"Meus Pedidos"*) com status em tempo real (*Pendente*, *Pago*, *Enviado*, *Entregue*).

### ⚙️ Painel Administrativo (`/admin`)
- **Dashboard com Métricas**: Faturamento total de pedidos pagos, volume de transações, contagem de produtos e alerta de itens com estoque crítico (< 5 unidades).
- **CRUD de Produtos**: Criação e edição de produtos com variações personalizadas e upload de fotos direto no Supabase Storage.
- **Gestão de Pedidos**: Alteração de status com 1 clique e visualização completa de dados de entrega.
- **Gestão de Cupons**: Criação de cupons percentuais ou de valor fixo, limites de uso e controle de ativação.

### 🔒 Segurança & Backend
- **Baixa de Estoque Automática**: Executada via Stored Procedure (`RPC`) no webhook do Stripe quando o pagamento é aprovado.
- **E-mails Transacionais com Resend**: Template HTML profissional enviado automaticamente na confirmação da compra.
- **Row Level Security (RLS)**: Políticas ativadas em todas as tabelas do PostgreSQL.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
| :--- | :--- |
| **Frontend & Framework** | Next.js 16+ (App Router), React 19, TypeScript |
| **Estilização** | Tailwind CSS v4, Lucide React Icons |
| **Banco de Dados & Auth** | Supabase (PostgreSQL, Auth, Storage, Stored Procedures) |
| **Pagamentos** | Stripe SDK (Checkout Sessions + Webhooks) |
| **E-mails** | Resend API |
| **Deploy & Hosting** | Netlify (`@netlify/plugin-nextjs`) |

---

## 🚀 Como Rodar o Projeto Localmente

### 1. Clonar o repositório e instalar dependências
```bash
git clone <url-do-repositorio>
cd ecommerce-fullstack
npm install
```

### 2. Configurar o Supabase
1. Acesse seu painel no [Supabase](https://supabase.com/dashboard) e crie um novo projeto.
2. Abra o **SQL Editor** do Supabase.
3. Copie e execute o conteúdo do arquivo [`supabase/schema.sql`](supabase/schema.sql) para criar as tabelas, triggers, procedures e RLS.
4. Copie e execute o conteúdo do arquivo [`supabase/seed.sql`](supabase/seed.sql) para popular a loja com produtos reais.
5. No menu **Storage** do Supabase, certifique-se de que o bucket `products` foi criado como **Public**.
6. *(Opcional)* Para definir seu usuário como administrador, execute no SQL Editor:
   ```sql
   update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}' where email = 'seuemail@exemplo.com';
   ```

### 3. Configurar Variáveis de Ambiente (`.env.local`)
Preencha o arquivo `.env.local` na raiz do projeto:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_publica
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_secreta

STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

RESEND_API_KEY=re_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Executar em Desenvolvimento
```bash
npm run dev
```
Acesse [http://localhost:3000](http://localhost:3000).

---

## 🌐 Deploy no Netlify

1. Faça push do seu repositório para o GitHub / GitLab.
2. No [Netlify](https://app.netlify.com), clique em **Add new site > Import an existing project**.
3. Selecione o repositório. O Netlify detectará automaticamente o arquivo [`netlify.toml`](netlify.toml).
4. Em **Site Configuration > Environment Variables**, adicione todas as variáveis do seu `.env.local`.
   - Lembre-se de atualizar a variável `NEXT_PUBLIC_SITE_URL` para a URL final do seu site no Netlify (ex: `https://meu-ecommerce.netlify.app`).
5. No painel do Stripe, configure o endpoint de Webhook apontando para:
   `https://meu-ecommerce.netlify.app/api/stripe/webhook`
   e selecione o evento `checkout.session.completed`.

---

## 📄 Licença
Distribuído sob a licença MIT. Desenvolvido para fins de portfólio.
