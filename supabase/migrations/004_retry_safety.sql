begin;
create or replace function public.mp_write_expense(p_id uuid,p_group uuid,p_title text,p_amount bigint,p_splits jsonb,p_category text,p_replace uuid default null) returns void language plpgsql security definer set search_path='' as $
declare existing public.mp_expenses%rowtype;
begin
 if not exists(select 1 from public.mp_members where group_id=p_group and user_id=auth.uid()) then raise exception 'Not a member'; end if;
 perform 1 from public.mp_groups where id=p_group for update;
 select * into existing from public.mp_expenses where id=p_id;
 if found then
  if existing.group_id=p_group and existing.payer_id=auth.uid() and existing.title=trim(p_title) and existing.amount=p_amount and existing.category=p_category and (select old.id from public.mp_expenses old where old.replaced_by=p_id) is not distinct from p_replace and (select jsonb_agg(jsonb_build_object('user_id',user_id,'amount',amount) order by user_id) from public.mp_splits where expense_id=p_id) = (select jsonb_agg(jsonb_build_object('user_id',s.user_id,'amount',s.amount) order by s.user_id) from jsonb_to_recordset(p_splits) as s(user_id uuid,amount bigint)) then return; end if;
  raise exception 'Expense identifier already used';
 end if;
 if p_replace is not null then
  if not exists(select 1 from public.mp_expenses where id=p_replace and group_id=p_group and payer_id=auth.uid() and voided_at is null) then raise exception 'Expense cannot be revised'; end if;
  perform public.mp_void_expense(p_replace);
 end if;
 perform public.mp_add_expense(p_id,p_group,p_title,p_amount,p_splits);
 update public.mp_expenses set category=p_category where id=p_id;
 if p_replace is not null then update public.mp_expenses set replaced_by=p_id where id=p_replace; end if;
end $$;

create or replace function public.mp_create_payment(p_id uuid,p_group uuid,p_recipient uuid,p_amount bigint) returns void language plpgsql security definer set search_path = '' as $$
declare target public.mp_profiles%rowtype; reserved bigint; existing public.mp_payments%rowtype;
begin
 if auth.uid()=p_recipient or not exists(select 1 from public.mp_members where group_id=p_group and user_id=auth.uid()) or not exists(select 1 from public.mp_members where group_id=p_group and user_id=p_recipient) then raise exception 'Invalid participants'; end if;
 perform 1 from public.mp_groups where id=p_group for update;
 select * into existing from public.mp_payments where id=p_id;
 if found then
  if existing.group_id=p_group and existing.payer_id=auth.uid() and existing.recipient_id=p_recipient and existing.amount=p_amount then return; end if;
  raise exception 'Request identifier already used';
 end if;
 select coalesce(sum(amount),0) into reserved from public.mp_payments where group_id=p_group and payer_id=auth.uid() and recipient_id=p_recipient and status in ('created','reported');
 if p_amount<=0 or p_amount>public.mp_pair_debt(p_group,auth.uid(),p_recipient)-reserved then raise exception 'Amount exceeds unreserved debt; cancel unused requests first'; end if;
 select * into target from public.mp_profiles where id=p_recipient;
 if target.upi is null then raise exception 'Recipient has not set a UPI ID'; end if;
 insert into public.mp_payments(id,group_id,payer_id,recipient_id,amount,upi,recipient_name) values(p_id,p_group,auth.uid(),p_recipient,p_amount,target.upi,target.name);
end $$;

commit;
