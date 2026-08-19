-- ==============================================================================
-- SCHEMA COMPLETO E ATUALIZADO - E-COMMERCE FULL STACK (SUPABASE / POSTGRESQL)
-- Execute este script no SQL Editor do Supabase (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. EXTENSÕES
create extension if not exists "pgcrypto";

-- 2. REINICIAR TABELAS (SE VOCÊ JÁ TINHA CRIADO ANTES COM O SCHEMA ANTIGO)
-- Descomente as linhas abaixo se quiser recriar tudo do zero:
-- drop table if exists public.reviews, public.orders, public.products, public.coupons cascade;

-- 3. CRIAR OU ATUALIZAR TABELA DE PRODUTOS
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2),
  images text[] not null default '{}',
  category text not null,
  tags text[] default '{}',
  stock integer not null default 0 check (stock >= 0),
  variations jsonb default '{"sizes": [], "colors": []}'::jsonb,
  rating numeric(2,1) default 5.0,
  review_count integer default 0,
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Garantir que todas as colunas existem mesmo se a tabela já existia antes
alter table public.products add column if not exists featured boolean default false;
alter table public.products add column if not exists compare_at_price numeric(10,2);
alter table public.products add column if not exists tags text[] default '{}';
alter table public.products add column if not exists variations jsonb default '{"sizes": [], "colors": []}'::jsonb;
alter table public.products add column if not exists rating numeric(2,1) default 5.0;
alter table public.products add column if not exists review_count integer default 0;
alter table public.products add column if not exists updated_at timestamptz default now();

-- 4. CRIAR OU ATUALIZAR TABELA DE CUPONS
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_percent integer check (discount_percent > 0 and discount_percent <= 100),
  discount_amount numeric(10,2) check (discount_amount > 0),
  valid_until timestamptz,
  max_uses integer,
  used_count integer default 0,
  active boolean default true,
  created_at timestamptz default now()
);

-- 5. CRIAR OU ATUALIZAR TABELA DE PEDIDOS
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  customer_email text not null,
  customer_name text,
  status text not null default 'pending',
  subtotal numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  shipping numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  items jsonb not null default '[]'::jsonb,
  shipping_address jsonb,
  stripe_session_id text unique,
  coupon_code text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.orders add column if not exists customer_name text;
alter table public.orders add column if not exists subtotal numeric(10,2) not null default 0;
alter table public.orders add column if not exists discount numeric(10,2) not null default 0;
alter table public.orders add column if not exists shipping numeric(10,2) not null default 0;
alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists updated_at timestamptz default now();

-- 6. CRIAR OU ATUALIZAR TABELA DE AVALIAÇÕES (REVIEWS)
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references auth.users on delete set null,
  user_name text not null default 'Cliente',
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null,
  created_at timestamptz default now()
);

alter table public.reviews add column if not exists user_name text not null default 'Cliente';

-- 7. ÍNDICES DE PERFORMANCE E BUSCA
create index if not exists idx_products_category on public.products (category);
create index if not exists idx_products_created_at on public.products (created_at desc);
create index if not exists idx_products_featured on public.products (featured);
create index if not exists idx_orders_user_id on public.orders (user_id);
create index if not exists idx_orders_stripe_session on public.orders (stripe_session_id);
create index if not exists idx_reviews_product_id on public.reviews (product_id);

-- 8. FUNÇÃO E TRIGGER: RECALCULAR AVALIAÇÕES AUTOMATICAMENTE
create or replace function public.update_product_rating()
returns trigger as $$
begin
  update public.products
  set 
    rating = coalesce((select round(avg(rating)::numeric, 1) from public.reviews where product_id = coalesce(new.product_id, old.product_id)), 5.0),
    review_count = (select count(*) from public.reviews where product_id = coalesce(new.product_id, old.product_id))
  where id = coalesce(new.product_id, old.product_id);
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_update_product_rating on public.reviews;
create trigger trigger_update_product_rating
after insert or update or delete on public.reviews
for each row execute function public.update_product_rating();

-- 9. RPC: DECREMENTAR ESTOQUE APÓS PAGAMENTO
create or replace function public.decrement_stock(p_product_id uuid, p_quantity integer)
returns void as $$
begin
  update public.products
  set stock = greatest(0, stock - p_quantity)
  where id = p_product_id;
end;
$$ language plpgsql security definer;

-- 10. RPC: INCREMENTAR USO DE CUPOM
create or replace function public.increment_coupon_use(p_coupon_code text)
returns void as $$
begin
  update public.coupons
  set used_count = used_count + 1
  where code = upper(p_coupon_code);
end;
$$ language plpgsql security definer;

-- 11. ROW LEVEL SECURITY (RLS)
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.reviews enable row level security;
alter table public.coupons enable row level security;

-- Políticas de Produtos
drop policy if exists "Produtos públicos para leitura" on public.products;
create policy "Produtos públicos para leitura" on public.products
  for select using (true);

drop policy if exists "Public products read" on public.products;
drop policy if exists "Admin products write" on public.products;
drop policy if exists "Admin gerencia produtos" on public.products;
create policy "Admin gerencia produtos" on public.products
  for all using (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' or
    auth.jwt() ->> 'role' = 'admin'
  );

-- Políticas de Pedidos
drop policy if exists "Usuário vê próprios pedidos ou Admin vê todos" on public.orders;
drop policy if exists "User own orders" on public.orders;
create policy "Usuário vê próprios pedidos ou Admin vê todos" on public.orders
  for select using (
    auth.uid() = user_id or
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  );

drop policy if exists "Criar pedido autenticado ou anônimo via checkout" on public.orders;
drop policy if exists "User insert order" on public.orders;
create policy "Criar pedido autenticado ou anônimo via checkout" on public.orders
  for insert with check (true);

drop policy if exists "Admin edita pedidos" on public.orders;
create policy "Admin edita pedidos" on public.orders
  for update using (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  );

-- Políticas de Avaliações
drop policy if exists "Avaliações públicas para leitura" on public.reviews;
drop policy if exists "Public reviews read" on public.reviews;
create policy "Avaliações públicas para leitura" on public.reviews
  for select using (true);

drop policy if exists "Qualquer usuário pode postar avaliação" on public.reviews;
drop policy if exists "Authenticated create review" on public.reviews;
create policy "Qualquer usuário pode postar avaliação" on public.reviews
  for insert with check (true);

-- Políticas de Cupons
drop policy if exists "Leitura de cupons ativos" on public.coupons;
create policy "Leitura de cupons ativos" on public.coupons
  for select using (active = true);

drop policy if exists "Admin gerencia cupons" on public.coupons;
create policy "Admin gerencia cupons" on public.coupons
  for all using (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  );

-- 12. STORAGE BUCKET PARA PRODUTOS
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

drop policy if exists "Imagens de produtos são públicas" on storage.objects;
create policy "Imagens de produtos são públicas" on storage.objects
  for select using (bucket_id = 'products');

drop policy if exists "Upload de imagens por admin" on storage.objects;
create policy "Upload de imagens por admin" on storage.objects
  for insert with check (bucket_id = 'products');
