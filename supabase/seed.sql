-- ==============================================================================
-- DADOS INICIAIS (SEED) - E-COMMERCE FULL STACK
-- Execute no SQL Editor do Supabase para popular o catálogo com dados reais
-- ==============================================================================

-- 1. LIMPAR DADOS EXISTENTES (Opcional)
-- truncate table public.reviews, public.orders, public.products, public.coupons cascade;

-- 2. INSERIR CUPONS DE TESTE
insert into public.coupons (code, discount_percent, discount_amount, valid_until, max_uses, active)
values
  ('PRIMEIRACOMPRA', 15, null, now() + interval '1 year', 500, true),
  ('DESCONTO10', 10, null, now() + interval '1 year', 1000, true),
  ('VIP50', null, 50.00, now() + interval '6 months', 100, true)
on conflict (code) do update
set discount_percent = excluded.discount_percent,
    discount_amount = excluded.discount_amount,
    active = true;

-- 3. INSERIR PRODUTOS REALISTAS
insert into public.products (slug, name, description, price, compare_at_price, category, images, stock, variations, featured, rating, review_count)
values
(
  'tenis-nike-air-max-pulse',
  'Tênis Nike Air Max Pulse Urbano',
  'Combinando visual urbano com o amortecimento icônico Air Max, o Pulse traz conforto extremo e acabamento respirável para o dia a dia. Solado com tração durável e design futurista.',
  699.90,
  899.90,
  'calcados',
  array[
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1000&auto=format&fit=crop'
  ],
  25,
  '{"sizes": ["38", "39", "40", "41", "42", "43"], "colors": ["Vermelho/Preto", "Preto Total", "Branco"]}'::jsonb,
  true,
  4.9,
  8
),
(
  'camiseta-oversized-heavyweight-preta',
  'Camiseta Oversized Heavyweight 100% Algodão',
  'Modelagem streetwear moderna com caimento impecável. Tecido pesado 260g/m² com toque macio e gola canelada de 3cm que não laceia. Perfeita para composições minimalistas.',
  149.90,
  189.90,
  'camisetas',
  array[
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop'
  ],
  60,
  '{"sizes": ["P", "M", "G", "GG"], "colors": ["Preto", "Off-White", "Marrom Terra"]}'::jsonb,
  true,
  4.8,
  12
),
(
  'jaqueta-puffer-termica-waterproof',
  'Jaqueta Puffer Térmica Impermeável',
  'Desenvolvida para proteger contra vento e chuva leve sem abrir mão do estilo. Isolamento térmico de alta densidade, bolsos laterais com zíper selado e capuz removível.',
  459.90,
  599.90,
  'jaquetas',
  array[
    'https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=1000&auto=format&fit=crop'
  ],
  18,
  '{"sizes": ["P", "M", "G", "GG"], "colors": ["Preto Fosco", "Verde Militar", "Azul Marinho"]}'::jsonb,
  true,
  5.0,
  5
),
(
  'fone-bluetooth-noise-cancelling-pro',
  'Headphone Bluetooth Noise Cancelling Studio Pro',
  'Cancelamento ativo de ruído (ANC) híbrido com áudio de alta resolução. Bateria de até 40 horas de reprodução contínua, almofadas em couro sintético e conectividade multiponto.',
  589.00,
  749.00,
  'eletronicos',
  array[
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=1000&auto=format&fit=crop'
  ],
  30,
  '{"sizes": ["Único"], "colors": ["Preto Matte", "Prata Estelar"]}'::jsonb,
  true,
  4.9,
  15
),
(
  'smartwatch-ultra-series-titanium',
  'Smartwatch Ultra Series Caixa de Titânio',
  'Monitoramento cardíaco em tempo real, oxímetro de pulso, GPS integrado e resistência à água até 50 metros. Tela AMOLED de 1.9 polegadas com alta taxa de atualização.',
  799.00,
  999.00,
  'eletronicos',
  array[
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=1000&auto=format&fit=crop'
  ],
  14,
  '{"sizes": ["45mm", "49mm"], "colors": ["Laranja Titanium", "Preto Meia-Noite"]}'::jsonb,
  false,
  4.7,
  9
),
(
  'mochila-urbana-impermeavel-notebook',
  'Mochila Urbana Impermeável para Notebook 15.6"',
  'Design minimalista anti-furto com compartimento acolchoado para notebook, porta USB externa e tecido Oxford impermeável de alta resistência.',
  219.90,
  279.90,
  'acessorios',
  array[
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=1000&auto=format&fit=crop'
  ],
  40,
  '{"sizes": ["25 Litros"], "colors": ["Cinza Chumbo", "Preto"]}'::jsonb,
  false,
  4.8,
  6
),
(
  'oculos-de-sol-retro-polarizado',
  'Óculos de Sol Retrô Acetato Polarizado UV400',
  'Armação premium em acetato italiano com lentes polarizadas que eliminam reflexos incômodos e garantem proteção 100% UVA/UVB.',
  179.90,
  239.90,
  'acessorios',
  array[
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=1000&auto=format&fit=crop'
  ],
  35,
  '{"sizes": ["Único"], "colors": ["Tartaruga Clássico", "Preto Brilho"]}'::jsonb,
  false,
  4.6,
  4
),
(
  'calca-cargo-streetwear-jogger',
  'Calça Cargo Streetwear Jogger com Bolsos Táticos',
  'Confeccionada em sarja com elastano para máximo conforto e mobilidade. Elástico e cordão na cintura, punho ajustável no tornozelo e 6 bolsos funcionais.',
  199.90,
  259.90,
  'calcas',
  array[
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=80&w=1000&auto=format&fit=crop'
  ],
  22,
  '{"sizes": ["38", "40", "42", "44"], "colors": ["Verde Oliva", "Preto", "Bege Areia"]}'::jsonb,
  true,
  4.9,
  11
)
on conflict (slug) do nothing;

-- 4. INSERIR AVALIAÇÕES DE EXEMPLO
insert into public.reviews (product_id, user_name, rating, comment, created_at)
select 
  id as product_id,
  'Matheus Silva' as user_name,
  5 as rating,
  'Excelente qualidade! O tecido é muito resistente e o caimento ficou perfeito.' as comment,
  now() - interval '3 days'
from public.products where slug = 'camiseta-oversized-heavyweight-preta'
on conflict do nothing;

insert into public.reviews (product_id, user_name, rating, comment, created_at)
select 
  id as product_id,
  'Lucas Andrade' as user_name,
  5 as rating,
  'Tênis sensacional, extremamente confortável para caminhada e uso diário.' as comment,
  now() - interval '5 days'
from public.products where slug = 'tenis-nike-air-max-pulse'
on conflict do nothing;
