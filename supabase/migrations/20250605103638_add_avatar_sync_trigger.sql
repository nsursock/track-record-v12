-- Create trigger to sync avatar_url from auth.users to public.users
CREATE OR REPLACE FUNCTION sync_avatar_url_from_auth()
RETURNS TRIGGER AS $$
BEGIN
    -- Extract avatar_url from raw_user_meta_data
    UPDATE public.users
    SET profile_picture_url = NEW.raw_user_meta_data->>'avatar_url'
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER sync_avatar_url_from_auth_trigger
    AFTER UPDATE OF raw_user_meta_data ON auth.users
    FOR EACH ROW
    WHEN (OLD.raw_user_meta_data->>'avatar_url' IS DISTINCT FROM NEW.raw_user_meta_data->>'avatar_url')
    EXECUTE FUNCTION sync_avatar_url_from_auth(); 