-- =============================================
-- POPULATE SHOES TABLE
-- This script populates the public.shoes table with the same data as the frontend mockShoes.
-- We use specific UUIDs to ensure consistency between frontend and backend.
-- =============================================

-- Clear existing data (optional, but good for clean slate)
TRUNCATE TABLE public.shoes CASCADE;

-- Insert Shoes with specific UUIDs
INSERT INTO public.shoes (id, name, brand, price, image_url, sizes, status, created_at)
VALUES 
  (
    'd290f1ee-6c54-4b01-90e6-d701748f0851',
    'Air Jordan 1 Retro High',
    'Nike',
    18500,
    'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=600&fit=crop',
    ARRAY[40, 41, 42, 43, 44, 45],
    'in_stock',
    NOW() - INTERVAL '2 days'
  ),
  (
    '8f773410-941f-4f7f-8c39-2b8108160862',
    'Yeezy Boost 350 V2',
    'Adidas',
    22000,
    'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600&h=600&fit=crop',
    ARRAY[40, 41, 42, 43],
    'in_stock',
    NOW() - INTERVAL '1 day'
  ),
  (
    'a3b6814c-8822-4a0b-9366-061708840873',
    'RS-X Reinvention',
    'Puma',
    12500,
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop',
    ARRAY[39, 40, 41, 42, 43, 44],
    'in_stock',
    NOW() - INTERVAL '30 days'
  ),
  (
    'c4d9247e-7c33-4e4d-9866-1c8808920884',
    'Classic Leather',
    'Reebok',
    8500,
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop',
    ARRAY[41, 42, 43, 44, 45],
    'in_stock',
    NOW() - INTERVAL '20 days'
  ),
  (
    'e5f15930-6d44-4f5e-9977-2e1909010895',
    'Air Force 1 Low',
    'Nike',
    11000,
    'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&h=600&fit=crop',
    ARRAY[40, 41, 42, 43, 44],
    'sold_out',
    NOW() - INTERVAL '15 days'
  ),
  (
    'f602738b-5e55-5f6f-aa88-3f2009230906',
    'Old Skool',
    'Vans',
    6500,
    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&h=600&fit=crop',
    ARRAY[38, 39, 40, 41, 42, 43, 44, 45],
    'in_stock',
    NOW() - INTERVAL '3 days'
  ),
  (
    '1723849c-4f66-6f7a-bb99-4a3109340917',
    'Chuck Taylor All Star',
    'Converse',
    5500,
    'https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=600&h=600&fit=crop',
    ARRAY[37, 38, 39, 40, 41, 42, 43],
    'in_stock',
    NOW() - INTERVAL '45 days'
  ),
  (
    '284595ad-3a77-7b8c-cc00-5b4209450928',
    'Ultraboost 22',
    'Adidas',
    19000,
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop',
    ARRAY[41, 42, 43, 44, 45, 46],
    'in_stock',
    NOW() - INTERVAL '5 days'
  );

-- Verify insertion
SELECT id, name, price FROM public.shoes;
