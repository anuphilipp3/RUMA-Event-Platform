-- fix_14_blood_group.sql
-- Adds an optional blood group to each family member (for community donor lookup).
-- Safe to run more than once.

alter table public.members
  add column if not exists blood_group text;

-- Optional: constrain to known values (NULL allowed = "not known").
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'members_blood_group_check'
  ) then
    alter table public.members
      add constraint members_blood_group_check
      check (blood_group is null or blood_group in
        ('A+','A-','B+','B-','O+','O-','AB+','AB-'));
  end if;
end $$;
