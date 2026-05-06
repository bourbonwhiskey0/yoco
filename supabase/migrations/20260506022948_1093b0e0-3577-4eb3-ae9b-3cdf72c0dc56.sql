
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  fn text := new.raw_user_meta_data->>'first_name';
  ln text := new.raw_user_meta_data->>'last_name';
  dn text := coalesce(
    new.raw_user_meta_data->>'display_name',
    nullif(trim(coalesce(fn,'') || ' ' || coalesce(ln,'')), ''),
    new.raw_user_meta_data->>'full_name',
    split_part(new.email, '@', 1)
  );
begin
  insert into public.profiles (id, display_name, avatar_url, first_name, last_name)
  values (
    new.id,
    dn,
    new.raw_user_meta_data->>'avatar_url',
    fn,
    ln
  );
  return new;
end;
$function$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
