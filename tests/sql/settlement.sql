\set ON_ERROR_STOP on
-- Test only, rolled back at end. Never run against live data.
begin;
set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
select public.mp_save_profile('Alice','alice@example');
select public.mp_create_group('Test group') as gid \gset
select (public.mp_snapshot()->'groups'->0->>'invite_code') as code \gset
select set_config('test.gid', :'gid', true);
select set_config('test.code', :'code', true);
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
select public.mp_save_profile('Bob','bob@example');
select public.mp_join_group(:'code');
do $$ begin
 if public.mp_snapshot()->'groups'->0->>'invite_code' is not null then raise exception 'Non-owner sees invitation code'; end if;
 begin perform public.mp_rotate_invite(current_setting('test.gid')::uuid);raise exception 'Non-owner rotated invitation';exception when others then if sqlerrm<>'Only the group owner can rotate invitations' then raise;end if;end;
end $$;
select public.mp_write_expense('10000000-0000-0000-0000-000000000001',:'gid','Dinner',100000,'[{"user_id":"00000000-0000-0000-0000-000000000001","amount":50000},{"user_id":"00000000-0000-0000-0000-000000000002","amount":50000}]','Food',null);
select public.mp_write_expense('10000000-0000-0000-0000-000000000001',:'gid','Dinner',100000,'[{"user_id":"00000000-0000-0000-0000-000000000001","amount":50000},{"user_id":"00000000-0000-0000-0000-000000000002","amount":50000}]','Food',null);

select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
select public.mp_rotate_invite(:'gid') as newcode \gset
select public.mp_create_payment('20000000-0000-0000-0000-000000000001',:'gid','00000000-0000-0000-0000-000000000002',20000);
select public.mp_create_payment('20000000-0000-0000-0000-000000000001',:'gid','00000000-0000-0000-0000-000000000002',20000);

select public.mp_payment_action('20000000-0000-0000-0000-000000000001','report','TESTREF123');
do $$
begin
 if (public.mp_snapshot()->'groups'->0->'payments'->0->>'status') <> 'reported' then raise exception 'Expected reported'; end if;
 begin
  perform public.mp_payment_action('20000000-0000-0000-0000-000000000001','confirm');
  raise exception 'Self confirmation allowed';
 exception when others then
  if sqlerrm <> 'Invalid payment transition' then raise; end if;
 end;
 begin
  perform public.mp_create_payment('20000000-0000-0000-0000-000000000002',current_setting('test.gid')::uuid,'00000000-0000-0000-0000-000000000002',40000);
  raise exception 'Over-reservation allowed';
 exception when others then
  if sqlerrm not like 'Amount exceeds unreserved debt%' then raise; end if;
 end;
 begin
  perform 1 from public.mp_payments;
  raise exception 'Direct table read allowed';
 exception when insufficient_privilege then null; end;
 begin
  perform public.mp_pair_debt(current_setting('test.gid')::uuid,'00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002');
  raise exception 'Internal function callable';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$ begin
 if public.mp_pair_debt(current_setting('test.gid')::uuid,'00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002')<>50000 then raise exception 'Reported payment changed debt'; end if;
end $$;
set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',true);
select public.mp_save_profile('Mallory',null);
do $$ begin
 begin perform public.mp_join_group(current_setting('test.code')::uuid);raise exception 'Old invitation still works';exception when others then if sqlerrm<>'Invalid invitation' then raise;end if;end;
end $$;
do $$
begin
 if jsonb_array_length(public.mp_snapshot()->'groups')<>0 then raise exception 'Unauthorized group visible'; end if;
 begin
  perform public.mp_payment_action('20000000-0000-0000-0000-000000000001','confirm');
  raise exception 'Outsider confirmation allowed';
 exception when others then
  if sqlerrm <> 'Payment unavailable' then raise; end if;
 end;
 begin
  perform public.mp_void_expense('10000000-0000-0000-0000-000000000001');
  raise exception 'Outsider reversal allowed';
 exception when others then
  if sqlerrm <> 'Only the payer can reverse this expense' then raise; end if;
 end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
select public.mp_payment_action('20000000-0000-0000-0000-000000000001','confirm');
do $$ begin
 begin
  perform public.mp_payment_action('20000000-0000-0000-0000-000000000001','confirm');
  raise exception 'Duplicate confirmation allowed';
 exception when others then
  if sqlerrm <> 'Invalid payment transition' then raise; end if;
 end;
end $$;
reset role;
do $$ begin
 if public.mp_pair_debt(current_setting('test.gid')::uuid,'00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002')<>30000 then raise exception 'Confirmed repayment incorrect'; end if;
 if (select count(*) from public.mp_payment_events where payment_id='20000000-0000-0000-0000-000000000001')<>3 then raise exception 'Missing or duplicated payment audit events'; end if;
end $$;
set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
select public.mp_void_expense('10000000-0000-0000-0000-000000000001');
reset role;
do $$ begin
 if public.mp_pair_debt(current_setting('test.gid')::uuid,'00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002')<>-20000 then raise exception 'Reversal discarded confirmed payment'; end if;
end $$;
set role anon;
do $$ begin
 begin
  perform public.mp_snapshot();
  raise exception 'Anonymous RPC allowed';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
\echo 'Database settlement and authorization checks passed'
