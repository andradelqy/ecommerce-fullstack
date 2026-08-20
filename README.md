# 🛍️ NEXUS Commerce 

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js&logoColor=white)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?logo=typescript&logoColor=white)](#)
[![Supabase](https://img.shields.io/badge/Supabase-Database_&_Auth-3ECF8E?logo=supabase&logoColor=white)](#)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe&logoColor=white)](#)
[![Netlify](https://img.shields.io/badge/Netlify-Deploy-00C7B7?logo=netlify&logoColor=white)](#)

O **NEXUS Commerce** é uma plataforma de e-commerce full-stack end-to-end desenvolvida para simular cenários reais de alto tráfego e regras de negócio complexas. 

Construído com foco em **segurança transacional**, **performance no lado do servidor** e **experiência do usuário**, este projeto demonstra o domínio sobre o ciclo de vida completo de uma aplicação web moderna — desde a modelagem do banco de dados até o deploy contínuo.

---

## 🎯 Destaques Arquiteturais & Segurança (Recruiter Focus)

Para garantir que a plataforma opere com a mesma confiabilidade de um software em produção, as seguintes abordagens foram implementadas:

*   **Validação Estrita de Preços (Server-Side):** Todo o carrinho é recalculado no servidor no momento do checkout, cruzando o ID do produto com o banco de dados (PostgreSQL). Isso impede fraudes de adulteração de preços via DevTools do navegador.
*   **Controle Transacional Assíncrono (Webhooks):** A baixa de estoque e o envio de e-mails de confirmação não dependem da tela de "sucesso" do usuário. Eles são disparados via Webhooks diretos da API da Stripe para o servidor, garantindo consistência mesmo se o cliente fechar a aba do navegador durante o pagamento.
*   **Integridade de Dados no Banco (PostgreSQL):** Uso avançado de *Stored Procedures* (RPC) e *Triggers* para automatizar lógicas pesadas direto no banco de dados, como o recálculo automático da nota média de um produto sempre que uma nova avaliação é inserida.
*   **Row Level Security (RLS):** Políticas de segurança configuradas em todas as tabelas do Supabase, garantindo que usuários comuns só tenham acesso aos seus próprios pedidos, enquanto administradores possuem acesso total.

---

## ✨ Funcionalidades

### 🛒 Experiência do Cliente (B2C)
*   **Catálogo de Alta Performance:** Busca textual em tempo real, filtros dinâmicos e ordenação de produtos.
*   **Gestão de Variações:** Suporte a produtos complexos com variação de tamanho e cor, agrupados inteligentemente no carrinho (`id + tamanho + cor`).
*   **Checkout Seguro:** Integração com Stripe Checkout Sessions (Cartão de Crédito, Pix, Boleto).
*   **Área do Cliente Autenticada:** Histórico de compras completo, rastreamento de status de pedidos em tempo real e sistema de avaliações.

### ⚙️ Painel Administrativo (Backoffice)
*   **Dashboard de Métricas:** Acompanhamento de faturamento, volume de vendas e sistema de alerta para produtos com estoque crítico (< 5 unidades).
*   **Gestão de Inventário & Pedidos:** CRUD completo de produtos (com upload direto de imagens para o Supabase Storage) e alteração de status de pedidos com 1 clique.
*   **Motor de Promoções:** Criação e gerenciamento de cupons de desconto (percentuais ou fixos) com limite de uso e datas de validade.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia Utilizada |
| :--- | :--- |
| **Framework Base** | Next.js 16+ (App Router) e React 19 |
| **Linguagem** | TypeScript |
| **Estilização** | Tailwind CSS v4 e Lucide Icons |
| **Banco de Dados & Auth** | Supabase (PostgreSQL, Auth, Storage, Stored Procedures) |
| **Gateway de Pagamento** | Stripe SDK & Webhooks |
| **Comunicação Transacional**| Resend API (E-mails em HTML) |
| **Hospedagem & CI/CD** | Netlify (`@netlify/plugin-nextjs`) |

---

## 🚀 Como Executar Localmente

### 1. Clonar e Instalar
```bash
git clone <sua-url-do-repositorio-aqui>
cd ecommerce-fullstack
npm install

2. Configuração do Backend (Supabase)

    Crie um projeto no Supabase.

    No SQL Editor, execute os scripts presentes na pasta do projeto:

        Execute supabase/schema.sql (Criação de tabelas, RLS, RPCs e Triggers).

        Execute supabase/seed.sql (Popula a loja com dados de teste).

    No menu Storage, crie um bucket público chamado products.

3. Variáveis de Ambiente

Crie um arquivo .env.local na raiz do projeto e preencha com suas chaves (consulte a documentação de cada serviço para obtê-las):
NEXT_PUBLIC_SUPABASE_URL=[https://seu-projeto.supabase.co](https://seu-projeto.supabase.co)
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_publica
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_secreta

STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

RESEND_API_KEY=re_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000

Rodar o Servidor:
npm run dev
Acesse http://localhost:3000 no seu navegador. Para testar o ambiente administrativo, altere a role do seu usuário no banco de dados para admin.

📄 Licença

Distribuído sob a licença MIT.
***
