-- Supabase SQL Editor에 그대로 붙여넣고 실행하세요.
-- 쿠폰 사용 기록을 담는 테이블 하나가 전부입니다.

create table if not exists public.coupon_usages (
  id         text primary key,          -- '<book_id>:<coupon_id>' — 쿠폰당 한 행
  book_id    text not null default 'default',
  coupon_id  text not null,
  used_at    timestamptz not null default now(),
  used_by    text,
  created_at timestamptz not null default now()
);

create index if not exists coupon_usages_book_idx
  on public.coupon_usages (book_id);

-- 실시간 구독(다른 폰에서 쓰면 즉시 반영)을 위해 publication에 추가
alter publication supabase_realtime add table public.coupon_usages;

-- RLS: 이 쿠폰북은 우리 둘만 쓰는 비공개 링크라서 anon에게 전부 허용한다.
-- delete는 관리자 모드의 '되돌리기'에서 쓴다.
alter table public.coupon_usages enable row level security;

drop policy if exists "anon can read"   on public.coupon_usages;
drop policy if exists "anon can insert" on public.coupon_usages;
drop policy if exists "anon can update" on public.coupon_usages;
drop policy if exists "anon can delete" on public.coupon_usages;

create policy "anon can read"   on public.coupon_usages for select using (true);
create policy "anon can insert" on public.coupon_usages for insert with check (true);
create policy "anon can update" on public.coupon_usages for update using (true) with check (true);
create policy "anon can delete" on public.coupon_usages for delete using (true);
