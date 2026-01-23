-- Seed data for development
-- This file will be executed after migrations when running `supabase db reset`

-- Create test users (using Supabase Auth format)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'steve@example.com', '$2a$10$PznXpYhBP3mB5kYpQKsPEeUB4iJ2f0fM6dM/K0iH0FPD/2V8JXbfS', now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}', 'authenticated', 'authenticated'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'alex@example.com', '$2a$10$PznXpYhBP3mB5kYpQKsPEeUB4iJ2f0fM6dM/K0iH0FPD/2V8JXbfS', now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}', 'authenticated', 'authenticated'),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'notch@example.com', '$2a$10$PznXpYhBP3mB5kYpQKsPEeUB4iJ2f0fM6dM/K0iH0FPD/2V8JXbfS', now(), now(), now(), '{"provider": "email", "providers": ["email"]}', '{}', 'authenticated', 'authenticated');

-- Create identities for test users
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '{"sub": "11111111-1111-1111-1111-111111111111", "email": "steve@example.com"}', 'email', '11111111-1111-1111-1111-111111111111', now(), now()),
  ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '{"sub": "22222222-2222-2222-2222-222222222222", "email": "alex@example.com"}', 'email', '22222222-2222-2222-2222-222222222222', now(), now()),
  ('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '{"sub": "33333333-3333-3333-3333-333333333333", "email": "notch@example.com"}', 'email', '33333333-3333-3333-3333-333333333333', now(), now());

-- Create public user profiles
INSERT INTO public.users (id, user_id, display_name, bio, created_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'steve', 'Steve', 'サバイバルモードが好きです', now()),
  ('22222222-2222-2222-2222-222222222222', 'alex', 'Alex', 'クリエイティブモードで建築するのが楽しい', now()),
  ('33333333-3333-3333-3333-333333333333', 'notch', 'Notch', 'Minecraftを作りました', now());

-- Create test worlds
INSERT INTO public.worlds (id, name, description, owner_id, created_at)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'サバイバルワールド', '過酷なサバイバル生活を送るワールドです', '11111111-1111-1111-1111-111111111111', now()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '建築コンテスト', '素敵な建築を披露するワールド', '22222222-2222-2222-2222-222222222222', now()),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'レッドストーン研究所', 'レッドストーン回路を研究するワールド', '33333333-3333-3333-3333-333333333333', now());

-- Add world members
INSERT INTO public.world_members (world_id, user_id)
VALUES
  -- Steve's world members
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222'),
  -- Alex's world members
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333'),
  -- Notch's world members
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111');

-- Create test posts
INSERT INTO public.posts (id, user_id, world_id, content, visibility, created_at)
VALUES
  -- Public posts
  ('00000001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   '今日はダイヤモンドを10個見つけました！幸先の良いスタートです。', 'public', now() - interval '2 hours'),
  ('00000002-0002-0002-0002-000000000002', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   '新しい城を建築中です。屋根のデザインで悩んでいます...誰かアドバイスください！', 'public', now() - interval '1 hour'),
  ('00000003-0003-0003-0003-000000000003', '33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc',
   '自動仕分け機の新しい設計ができました。チェスト256個に対応しています。', 'public', now() - interval '30 minutes'),
  ('00000004-0004-0004-0004-000000000004', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'エンダードラゴン討伐完了！ついにエンドに到達しました。', 'public', now() - interval '10 minutes'),
  ('00000005-0005-0005-0005-000000000005', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   '城が完成しました！見てください、この美しい塔を。', 'public', now() - interval '5 minutes'),
  -- World-only posts
  ('00000006-0006-0006-0006-000000000006', '33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc',
   '【メンバー限定】次回のレッドストーン勉強会の日程を決めましょう', 'world_only', now() - interval '3 minutes');

-- Add some likes
INSERT INTO public.likes (user_id, post_id, created_at)
VALUES
  ('22222222-2222-2222-2222-222222222222', '00000001-0001-0001-0001-000000000001', now()),
  ('33333333-3333-3333-3333-333333333333', '00000001-0001-0001-0001-000000000001', now()),
  ('11111111-1111-1111-1111-111111111111', '00000002-0002-0002-0002-000000000002', now()),
  ('33333333-3333-3333-3333-333333333333', '00000002-0002-0002-0002-000000000002', now()),
  ('11111111-1111-1111-1111-111111111111', '00000003-0003-0003-0003-000000000003', now()),
  ('22222222-2222-2222-2222-222222222222', '00000005-0005-0005-0005-000000000005', now());

-- Add some comments
INSERT INTO public.comments (user_id, post_id, content, created_at)
VALUES
  ('22222222-2222-2222-2222-222222222222', '00000001-0001-0001-0001-000000000001', 'すごい！どこで見つけたの？', now()),
  ('11111111-1111-1111-1111-111111111111', '00000002-0002-0002-0002-000000000002', '和風の屋根はどうですか？', now()),
  ('33333333-3333-3333-3333-333333333333', '00000004-0004-0004-0004-000000000004', 'おめでとう！エリトラは手に入れた？', now());

-- Add follows
INSERT INTO public.follows (follower_id, following_id, created_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', now()),
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', now()),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', now()),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', now());
