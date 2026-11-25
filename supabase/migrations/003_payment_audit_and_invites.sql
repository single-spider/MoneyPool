begin;
-- Preserve payment status transitions and restrict private payment metadata.
create table public.mp_payment_events (
 id bigint generated always as identity primary key,
 payment_id uuid not null references public.mp_payments(id),
 actor_id uuid references public.mp_profiles(id),
 previous_status text, next_status text not null,
 created_at timestamptz not null default clock_timestamp()
);
create index mp_payment_events_payment on public.mp_payment_events(payment_id,id);
alter table public.mp_payment_events enable row level security;
revoke all on public.mp_payment_events from anon,authenticated;
insert into public.mp_payment_events(payment_id,actor_id,previous_status,next_status,created_at)
select id,null,null,status,coalesce(decided_at,reported_at,created_at) from public.mp_payments;
create function public.mp_record_payment_event() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_op='INSERT' then
  insert into public.mp_payment_events(payment_id,actor_id,next_status) values(new.id,auth.uid(),new.status);
 elsif new.status is distinct from old.status then
  insert into public.mp_payment_events(payment_id,actor_id,previous_status,next_status) values(new.id,auth.uid(),old.status,new.status);
 end if;
 return new;
end $$;
revoke execute on function public.mp_record_payment_event() from public,anon,authenticated;
create trigger mp_payment_event_trigger after insert or update of status on public.mp_payments for each row execute function public.mp_record_payment_event();
create or replace function public.mp_snapshot() returns jsonb language sql stable security definer set search_path = '' as $$
 select jsonb_build_object('profile',(select to_jsonb(p) from public.mp_profiles p where p.id=auth.uid()),
 'groups',coalesce((select jsonb_agg(jsonb_build_object('id',g.id,'name',g.name,'invite_code',case when g.owner_id=auth.uid() then g.invite_code else null end,'owner_id',g.owner_id,
 'members',(select jsonb_agg(to_jsonb(p) order by p.name) from public.mp_members m join public.mp_profiles p on p.id=m.user_id where m.group_id=g.id),
 'expenses',coalesce((select jsonb_agg(to_jsonb(e)||jsonb_build_object('splits',(select jsonb_agg(to_jsonb(s)) from public.mp_splits s where s.expense_id=e.id)) order by e.created_at desc) from public.mp_expenses e where e.group_id=g.id),'[]'::jsonb),
 'payments',coalesce((select jsonb_agg(case when auth.uid() in (p.payer_id,p.recipient_id) then to_jsonb(p)||jsonb_build_object('events',coalesce((select jsonb_agg(to_jsonb(ev) order by ev.id) from public.mp_payment_events ev where ev.payment_id=p.id),'[]'::jsonb)) else to_jsonb(p)-'reference'-'upi'-'recipient_name' end order by p.created_at desc) from public.mp_payments p where p.group_id=g.id),'[]'::jsonb)) order by g.created_at desc)
 from public.mp_groups g join public.mp_members m on m.group_id=g.id where m.user_id=auth.uid()),'[]'::jsonb))
$$;

create function public.mp_rotate_invite(p_group uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare code uuid;
begin
 update public.mp_groups set invite_code=gen_random_uuid() where id=p_group and owner_id=auth.uid() returning invite_code into code;
 if code is null then raise exception 'Only the group owner can rotate invitations'; end if;
 return code;
end $$;
revoke execute on function public.mp_rotate_invite(uuid) from public,anon,authenticated;
grant execute on function public.mp_rotate_invite(uuid) to authenticated;
commit;
