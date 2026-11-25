begin;
alter table public.mp_expenses add column category text not null default 'Other' check(category in ('Food','Travel','Housing','Shopping','Entertainment','Utilities','Other')),
add column voided_at timestamptz, add column replaced_by uuid references public.mp_expenses(id);
create or replace function public.mp_pair_debt(g uuid,a uuid,b uuid) returns bigint language sql stable security definer set search_path = '' as $$
 select coalesce((select sum(case when e.payer_id=b then s.amount else -s.amount end) from public.mp_expenses e join public.mp_splits s on s.expense_id=e.id where e.group_id=g and e.voided_at is null and ((e.payer_id=b and s.user_id=a) or (e.payer_id=a and s.user_id=b))),0)::bigint -
 coalesce((select sum(case when payer_id=a then amount else -amount end) from public.mp_payments where group_id=g and status='confirmed' and ((payer_id=a and recipient_id=b) or (payer_id=b and recipient_id=a))),0)::bigint
$$;

create function public.mp_void_expense(p_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare gid uuid;
begin
 select group_id into gid from public.mp_expenses where id=p_id and payer_id=auth.uid();
 if gid is null then raise exception 'Only the payer can reverse this expense'; end if;
 perform 1 from public.mp_groups where id=gid for update;
 update public.mp_expenses set voided_at=now() where id=p_id and voided_at is null;
 if not found then raise exception 'Expense already reversed'; end if;
end $$;
create function public.mp_write_expense(p_id uuid,p_group uuid,p_title text,p_amount bigint,p_splits jsonb,p_category text,p_replace uuid default null) returns void language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.mp_members where group_id=p_group and user_id=auth.uid()) then raise exception 'Not a member'; end if;
 perform 1 from public.mp_groups where id=p_group for update;
 if p_replace is not null then
  if not exists(select 1 from public.mp_expenses where id=p_replace and group_id=p_group and payer_id=auth.uid() and voided_at is null) then raise exception 'Expense cannot be revised'; end if;
  perform public.mp_void_expense(p_replace);
 end if;
 perform public.mp_add_expense(p_id,p_group,p_title,p_amount,p_splits);
 update public.mp_expenses set category=p_category where id=p_id;
 if p_replace is not null then update public.mp_expenses set replaced_by=p_id where id=p_replace; end if;
end $$;
revoke execute on function public.mp_void_expense(uuid),public.mp_write_expense(uuid,uuid,text,bigint,jsonb,text,uuid) from public,anon,authenticated;
grant execute on function public.mp_void_expense(uuid),public.mp_write_expense(uuid,uuid,text,bigint,jsonb,text,uuid) to authenticated;
revoke execute on function public.mp_add_expense(uuid,uuid,text,bigint,jsonb) from authenticated;
commit;
