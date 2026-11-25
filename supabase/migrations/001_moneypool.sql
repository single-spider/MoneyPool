begin;
create table public.mp_profiles (
 id uuid primary key references auth.users(id) on delete restrict,
 name text not null check(char_length(name) between 1 and 80),
 upi text check(upi is null or upi ~ '^[a-zA-Z0-9._+-]{2,100}@[a-zA-Z0-9.-]{2,64}$')
);
create table public.mp_groups (
 id uuid primary key default gen_random_uuid(), name text not null check(char_length(name) between 1 and 80),
 owner_id uuid not null references public.mp_profiles(id),
 invite_code uuid not null unique default gen_random_uuid(), created_at timestamptz not null default now()
);
create table public.mp_members (
 group_id uuid references public.mp_groups(id), user_id uuid references public.mp_profiles(id),
 primary key(group_id,user_id)
);
create table public.mp_expenses (
 id uuid primary key, group_id uuid not null references public.mp_groups(id),
 payer_id uuid not null, title text not null check(char_length(title) between 1 and 120),
 amount bigint not null check(amount between 1 and 999999999),
 created_at timestamptz not null default now(),
 foreign key(group_id,payer_id) references public.mp_members(group_id,user_id)
);
create table public.mp_splits (
 expense_id uuid references public.mp_expenses(id), user_id uuid references public.mp_profiles(id),
 amount bigint not null check(amount between 0 and 999999999), primary key(expense_id,user_id)
);
create table public.mp_payments (
 id uuid primary key, group_id uuid not null references public.mp_groups(id),
 payer_id uuid not null, recipient_id uuid not null, amount bigint not null check(amount between 1 and 999999999),
 upi text not null, recipient_name text not null, status text not null default 'created'
 check(status in ('created','reported','confirmed','rejected','cancelled')),
 reference text, created_at timestamptz not null default now(), reported_at timestamptz, decided_at timestamptz,
 check(payer_id<>recipient_id),
 foreign key(group_id,payer_id) references public.mp_members(group_id,user_id),
 foreign key(group_id,recipient_id) references public.mp_members(group_id,user_id)
);
create unique index mp_unique_reference on public.mp_payments(lower(reference)) where status in ('reported','confirmed');
create index mp_members_user on public.mp_members(user_id);
create index mp_expenses_group on public.mp_expenses(group_id);
create index mp_payments_group on public.mp_payments(group_id);
alter table public.mp_profiles enable row level security;
alter table public.mp_groups enable row level security;
alter table public.mp_members enable row level security;
alter table public.mp_expenses enable row level security;
alter table public.mp_splits enable row level security;
alter table public.mp_payments enable row level security;
revoke all on public.mp_profiles,public.mp_groups,public.mp_members,public.mp_expenses,public.mp_splits,public.mp_payments from anon,authenticated;
-- All application operations pass through explicitly granted authenticated RPCs.
create function public.mp_save_profile(p_name text,p_upi text) returns void language plpgsql security definer set search_path = '' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 insert into public.mp_profiles(id,name,upi) values(auth.uid(),trim(p_name),nullif(trim(p_upi),''))
 on conflict(id) do update set name=excluded.name,upi=excluded.upi;
end $$;
create function public.mp_create_group(p_name text) returns uuid language plpgsql security definer set search_path = '' as $$
declare gid uuid;
begin
 insert into public.mp_groups(name,owner_id) values(trim(p_name),auth.uid()) returning id into gid;
 insert into public.mp_members values(gid,auth.uid());
 return gid;
end $$;
create function public.mp_join_group(p_code uuid) returns uuid language plpgsql security definer set search_path = '' as $$
declare gid uuid;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 select id into gid from public.mp_groups where invite_code=p_code;
 if gid is null then raise exception 'Invalid invitation'; end if;
 insert into public.mp_members values(gid,auth.uid()) on conflict do nothing;
 return gid;
end $$;
create function public.mp_snapshot() returns jsonb language sql stable security definer set search_path = '' as $$
 select jsonb_build_object('profile',(select to_jsonb(p) from public.mp_profiles p where p.id=auth.uid()),
 'groups',coalesce((select jsonb_agg(jsonb_build_object('id',g.id,'name',g.name,'invite_code',g.invite_code,
 'members',(select jsonb_agg(to_jsonb(p) order by p.name) from public.mp_members m join public.mp_profiles p on p.id=m.user_id where m.group_id=g.id),
 'expenses',coalesce((select jsonb_agg(to_jsonb(e)||jsonb_build_object('splits',(select jsonb_agg(to_jsonb(s)) from public.mp_splits s where s.expense_id=e.id)) order by e.created_at desc) from public.mp_expenses e where e.group_id=g.id),'[]'::jsonb),
 'payments',coalesce((select jsonb_agg(to_jsonb(p) order by p.created_at desc) from public.mp_payments p where p.group_id=g.id),'[]'::jsonb)) order by g.created_at desc)
 from public.mp_groups g join public.mp_members m on m.group_id=g.id where m.user_id=auth.uid()),'[]'::jsonb))
$$;
create function public.mp_add_expense(p_id uuid,p_group uuid,p_title text,p_amount bigint,p_splits jsonb) returns void language plpgsql security definer set search_path = '' as $$
declare row_count int; total numeric;
begin
 if not exists(select 1 from public.mp_members where group_id=p_group and user_id=auth.uid()) then raise exception 'Not a member'; end if;
 perform 1 from public.mp_groups where id=p_group for update;
 if jsonb_typeof(p_splits) is distinct from 'array' then raise exception 'Invalid splits'; end if;
 select count(*),sum(s.amount) into row_count,total from jsonb_to_recordset(p_splits) as s(user_id uuid,amount bigint);
 if row_count=0 or total is distinct from p_amount or exists(select 1 from jsonb_to_recordset(p_splits) as s(user_id uuid,amount bigint) where s.amount is null or s.amount<0 or not exists(select 1 from public.mp_members m where m.group_id=p_group and m.user_id=s.user_id)) then raise exception 'Invalid split allocation'; end if;
 insert into public.mp_expenses(id,group_id,payer_id,title,amount) values(p_id,p_group,auth.uid(),trim(p_title),p_amount);
 insert into public.mp_splits select p_id,s.user_id,s.amount from jsonb_to_recordset(p_splits) as s(user_id uuid,amount bigint);
end $$;
create function public.mp_pair_debt(g uuid,a uuid,b uuid) returns bigint language sql stable security definer set search_path = '' as $$
 select coalesce((select sum(case when e.payer_id=b then s.amount else -s.amount end) from public.mp_expenses e join public.mp_splits s on s.expense_id=e.id where e.group_id=g and ((e.payer_id=b and s.user_id=a) or (e.payer_id=a and s.user_id=b))),0)::bigint -
 coalesce((select sum(case when payer_id=a then amount else -amount end) from public.mp_payments where group_id=g and status='confirmed' and ((payer_id=a and recipient_id=b) or (payer_id=b and recipient_id=a))),0)::bigint
$$;
create function public.mp_create_payment(p_id uuid,p_group uuid,p_recipient uuid,p_amount bigint) returns void language plpgsql security definer set search_path = '' as $$
declare target public.mp_profiles%rowtype; reserved bigint;
begin
 if auth.uid()=p_recipient or not exists(select 1 from public.mp_members where group_id=p_group and user_id=auth.uid()) or not exists(select 1 from public.mp_members where group_id=p_group and user_id=p_recipient) then raise exception 'Invalid participants'; end if;
 perform 1 from public.mp_groups where id=p_group for update;
 select coalesce(sum(amount),0) into reserved from public.mp_payments where group_id=p_group and payer_id=auth.uid() and recipient_id=p_recipient and status in ('created','reported');
 if p_amount<=0 or p_amount>public.mp_pair_debt(p_group,auth.uid(),p_recipient)-reserved then raise exception 'Amount exceeds unreserved debt; cancel unused requests first'; end if;
 select * into target from public.mp_profiles where id=p_recipient;
 if target.upi is null then raise exception 'Recipient has not set a UPI ID'; end if;
 insert into public.mp_payments(id,group_id,payer_id,recipient_id,amount,upi,recipient_name) values(p_id,p_group,auth.uid(),p_recipient,p_amount,target.upi,target.name);
end $$;
create function public.mp_payment_action(p_id uuid,p_action text,p_reference text default null) returns void language plpgsql security definer set search_path = '' as $$
declare p public.mp_payments%rowtype; gid uuid;
begin
 select group_id into gid from public.mp_payments where id=p_id and (payer_id=auth.uid() or recipient_id=auth.uid());
 if gid is null then raise exception 'Payment unavailable'; end if;
 perform 1 from public.mp_groups where id=gid for update;
 select * into p from public.mp_payments where id=p_id for update;
 if p_action='report' and p.payer_id=auth.uid() and p.status='created' then
  if p_reference is null or trim(p_reference) !~ '^[A-Za-z0-9-]{6,64}$' then raise exception 'Enter a valid transaction reference'; end if;
  update public.mp_payments set status='reported',reference=trim(p_reference),reported_at=now() where id=p_id;
 elsif p_action='confirm' and p.recipient_id=auth.uid() and p.status='reported' then
  update public.mp_payments set status='confirmed',decided_at=now() where id=p_id;
 elsif p_action='reject' and p.recipient_id=auth.uid() and p.status='reported' then
  update public.mp_payments set status='rejected',decided_at=now() where id=p_id;
 elsif p_action='cancel' and p.payer_id=auth.uid() and p.status='created' then
  update public.mp_payments set status='cancelled',decided_at=now() where id=p_id;
 else raise exception 'Invalid payment transition'; end if;
end $$;
-- No direct client writes, even with a publishable key.
revoke execute on function public.mp_save_profile(text,text),public.mp_create_group(text),public.mp_join_group(uuid),public.mp_snapshot(),public.mp_add_expense(uuid,uuid,text,bigint,jsonb),public.mp_pair_debt(uuid,uuid,uuid),public.mp_create_payment(uuid,uuid,uuid,bigint),public.mp_payment_action(uuid,text,text) from public,anon,authenticated;
grant execute on function public.mp_save_profile(text,text),public.mp_create_group(text),public.mp_join_group(uuid),public.mp_snapshot(),public.mp_add_expense(uuid,uuid,text,bigint,jsonb),public.mp_create_payment(uuid,uuid,uuid,bigint),public.mp_payment_action(uuid,text,text) to authenticated;
commit;
