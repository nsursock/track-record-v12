create sequence "public"."browser_info_id_seq";

create sequence "public"."device_info_id_seq";

create sequence "public"."events_id_seq";

create sequence "public"."location_info_id_seq";

create sequence "public"."os_info_id_seq";

create sequence "public"."pageviews_id_seq";

create table "public"."browser_info" (
    "id" bigint not null default nextval('browser_info_id_seq'::regclass),
    "session_id" text,
    "browser_name" text not null,
    "browser_version" text,
    "engine_name" text,
    "engine_version" text,
    "is_mobile" boolean default false,
    "is_tablet" boolean default false,
    "is_desktop" boolean default true,
    "created_at" timestamp with time zone not null default now()
);


create table "public"."device_info" (
    "id" bigint not null default nextval('device_info_id_seq'::regclass),
    "session_id" text,
    "device_type" text not null,
    "device_vendor" text,
    "device_model" text,
    "screen_width" integer,
    "screen_height" integer,
    "viewport_width" integer,
    "viewport_height" integer,
    "pixel_ratio" numeric(3,2),
    "created_at" timestamp with time zone not null default now()
);


create table "public"."events" (
    "id" bigint not null default nextval('events_id_seq'::regclass),
    "session_id" text,
    "visitor_id" text,
    "event_name" text not null,
    "event_category" text,
    "event_action" text,
    "event_label" text,
    "event_value" integer,
    "custom_properties" jsonb,
    "occurred_at" timestamp with time zone not null
);


create table "public"."location_info" (
    "id" bigint not null default nextval('location_info_id_seq'::regclass),
    "session_id" text,
    "ip_address" inet,
    "country_code" text,
    "country_name" text,
    "region_code" text,
    "region_name" text,
    "city" text,
    "timezone" text,
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    "created_at" timestamp with time zone not null default now()
);


create table "public"."os_info" (
    "id" bigint not null default nextval('os_info_id_seq'::regclass),
    "session_id" text,
    "os_name" text not null,
    "os_version" text,
    "architecture" text,
    "created_at" timestamp with time zone not null default now()
);


create table "public"."pageviews" (
    "id" bigint not null default nextval('pageviews_id_seq'::regclass),
    "session_id" text,
    "visitor_id" text,
    "page_path" text not null,
    "referrer" text,
    "duration" integer,
    "viewed_at" timestamp with time zone not null
);


create table "public"."sessions" (
    "id" text not null,
    "visitor_id" text,
    "entry_page" text not null,
    "referrer_source" text,
    "referrer_medium" text,
    "utm_source" text,
    "utm_medium" text,
    "utm_campaign" text,
    "utm_term" text,
    "utm_content" text,
    "started_at" timestamp with time zone not null,
    "last_seen_at" timestamp with time zone not null
);


create table "public"."visitors" (
    "visitor_id" text not null,
    "first_seen_at" timestamp with time zone not null,
    "last_seen_at" timestamp with time zone not null
);


alter sequence "public"."browser_info_id_seq" owned by "public"."browser_info"."id";

alter sequence "public"."device_info_id_seq" owned by "public"."device_info"."id";

alter sequence "public"."events_id_seq" owned by "public"."events"."id";

alter sequence "public"."location_info_id_seq" owned by "public"."location_info"."id";

alter sequence "public"."os_info_id_seq" owned by "public"."os_info"."id";

alter sequence "public"."pageviews_id_seq" owned by "public"."pageviews"."id";

CREATE UNIQUE INDEX browser_info_pkey ON public.browser_info USING btree (id);

CREATE UNIQUE INDEX device_info_pkey ON public.device_info USING btree (id);

CREATE UNIQUE INDEX events_pkey ON public.events USING btree (id);

CREATE UNIQUE INDEX location_info_pkey ON public.location_info USING btree (id);

CREATE UNIQUE INDEX os_info_pkey ON public.os_info USING btree (id);

CREATE UNIQUE INDEX pageviews_pkey ON public.pageviews USING btree (id);

CREATE UNIQUE INDEX sessions_pkey ON public.sessions USING btree (id);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX visitors_pkey ON public.visitors USING btree (visitor_id);

alter table "public"."browser_info" add constraint "browser_info_pkey" PRIMARY KEY using index "browser_info_pkey";

alter table "public"."device_info" add constraint "device_info_pkey" PRIMARY KEY using index "device_info_pkey";

alter table "public"."events" add constraint "events_pkey" PRIMARY KEY using index "events_pkey";

alter table "public"."location_info" add constraint "location_info_pkey" PRIMARY KEY using index "location_info_pkey";

alter table "public"."os_info" add constraint "os_info_pkey" PRIMARY KEY using index "os_info_pkey";

alter table "public"."pageviews" add constraint "pageviews_pkey" PRIMARY KEY using index "pageviews_pkey";

alter table "public"."sessions" add constraint "sessions_pkey" PRIMARY KEY using index "sessions_pkey";

alter table "public"."visitors" add constraint "visitors_pkey" PRIMARY KEY using index "visitors_pkey";

alter table "public"."browser_info" add constraint "browser_info_session_id_fkey" FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE not valid;

alter table "public"."browser_info" validate constraint "browser_info_session_id_fkey";

alter table "public"."device_info" add constraint "device_info_session_id_fkey" FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE not valid;

alter table "public"."device_info" validate constraint "device_info_session_id_fkey";

alter table "public"."events" add constraint "events_session_id_fkey" FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE not valid;

alter table "public"."events" validate constraint "events_session_id_fkey";

alter table "public"."events" add constraint "events_visitor_id_fkey" FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id) ON DELETE CASCADE not valid;

alter table "public"."events" validate constraint "events_visitor_id_fkey";

alter table "public"."location_info" add constraint "location_info_session_id_fkey" FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE not valid;

alter table "public"."location_info" validate constraint "location_info_session_id_fkey";

alter table "public"."os_info" add constraint "os_info_session_id_fkey" FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE not valid;

alter table "public"."os_info" validate constraint "os_info_session_id_fkey";

alter table "public"."pageviews" add constraint "pageviews_session_id_fkey" FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE not valid;

alter table "public"."pageviews" validate constraint "pageviews_session_id_fkey";

alter table "public"."pageviews" add constraint "pageviews_visitor_id_fkey" FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id) ON DELETE CASCADE not valid;

alter table "public"."pageviews" validate constraint "pageviews_visitor_id_fkey";

alter table "public"."sessions" add constraint "sessions_visitor_id_fkey" FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id) ON DELETE CASCADE not valid;

alter table "public"."sessions" validate constraint "sessions_visitor_id_fkey";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.calculate_bounce_rate(start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, end_date timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    total_sessions INTEGER;
    bounce_sessions INTEGER;
    bounce_rate DECIMAL(5,2);
BEGIN
    -- Set default dates if not provided
    IF start_date IS NULL THEN
        start_date := CURRENT_DATE - INTERVAL '30 days';
    END IF;
    
    IF end_date IS NULL THEN
        end_date := CURRENT_DATE + INTERVAL '1 day';
    END IF;
    
    -- Count total sessions in the date range
    SELECT COUNT(*) INTO total_sessions
    FROM public.sessions
    WHERE started_at >= start_date AND started_at < end_date;
    
    -- Count bounce sessions (sessions with only 1 pageview)
    SELECT COUNT(*) INTO bounce_sessions
    FROM public.sessions
    WHERE started_at >= start_date 
      AND started_at < end_date 
      AND is_bounce = true;
    
    -- Calculate bounce rate
    IF total_sessions > 0 THEN
        bounce_rate := (bounce_sessions::DECIMAL / total_sessions::DECIMAL) * 100;
    ELSE
        bounce_rate := 0;
    END IF;
    
    RETURN ROUND(bounce_rate, 2);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_analytics_summary(start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, end_date timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS TABLE(total_pageviews bigint, unique_visitors bigint, total_sessions bigint, bounce_rate numeric, avg_session_duration numeric, avg_page_duration numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Set default dates if not provided (last 30 days)
    IF start_date IS NULL THEN
        start_date := CURRENT_DATE - INTERVAL '30 days';
    END IF;
    
    IF end_date IS NULL THEN
        end_date := CURRENT_DATE + INTERVAL '1 day';
    END IF;
    
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_pageviews,
        COUNT(DISTINCT ao.visitor_id)::BIGINT as unique_visitors,
        COUNT(DISTINCT ao.session_id)::BIGINT as total_sessions,
        ROUND(
            (COUNT(CASE WHEN ao.session_is_bounce = true THEN 1 END)::DECIMAL / 
             COUNT(DISTINCT ao.session_id)::DECIMAL) * 100, 
            2
        ) as bounce_rate,
        ROUND(AVG(ao.session_duration), 2) as avg_session_duration,
        ROUND(AVG(ao.duration_seconds), 2) as avg_page_duration
    FROM public.analytics_overview ao
    WHERE ao.visited_at >= start_date AND ao.visited_at < end_date;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_browser_stats(start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, end_date timestamp with time zone DEFAULT NULL::timestamp with time zone, limit_count integer DEFAULT 10)
 RETURNS TABLE(browser_name text, sessions_count bigint, percentage numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    total_sessions BIGINT;
BEGIN
    -- Set default dates if not provided
    IF start_date IS NULL THEN
        start_date := CURRENT_DATE - INTERVAL '30 days';
    END IF;
    
    IF end_date IS NULL THEN
        end_date := CURRENT_DATE + INTERVAL '1 day';
    END IF;
    
    -- Get total sessions for percentage calculation
    SELECT COUNT(DISTINCT ao.session_id) INTO total_sessions
    FROM public.analytics_overview ao
    WHERE ao.visited_at >= start_date AND ao.visited_at < end_date;
    
    RETURN QUERY
    SELECT 
        COALESCE(ao.browser_name, 'Unknown') as browser_name,
        COUNT(DISTINCT ao.session_id)::BIGINT as sessions_count,
        ROUND(
            (COUNT(DISTINCT ao.session_id)::DECIMAL / total_sessions::DECIMAL) * 100, 
            2
        ) as percentage
    FROM public.analytics_overview ao
    WHERE ao.visited_at >= start_date AND ao.visited_at < end_date
    GROUP BY ao.browser_name
    ORDER BY sessions_count DESC
    LIMIT limit_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_country_stats(start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, end_date timestamp with time zone DEFAULT NULL::timestamp with time zone, limit_count integer DEFAULT 10)
 RETURNS TABLE(country_name text, country_code text, sessions_count bigint, percentage numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    total_sessions BIGINT;
BEGIN
    -- Set default dates if not provided
    IF start_date IS NULL THEN
        start_date := CURRENT_DATE - INTERVAL '30 days';
    END IF;
    
    IF end_date IS NULL THEN
        end_date := CURRENT_DATE + INTERVAL '1 day';
    END IF;
    
    -- Get total sessions for percentage calculation
    SELECT COUNT(DISTINCT ao.session_id) INTO total_sessions
    FROM public.analytics_overview ao
    WHERE ao.visited_at >= start_date AND ao.visited_at < end_date;
    
    RETURN QUERY
    SELECT 
        COALESCE(ao.country_name, 'Unknown') as country_name,
        COALESCE(ao.country_code, 'XX') as country_code,
        COUNT(DISTINCT ao.session_id)::BIGINT as sessions_count,
        ROUND(
            (COUNT(DISTINCT ao.session_id)::DECIMAL / total_sessions::DECIMAL) * 100, 
            2
        ) as percentage
    FROM public.analytics_overview ao
    WHERE ao.visited_at >= start_date AND ao.visited_at < end_date
    GROUP BY ao.country_name, ao.country_code
    ORDER BY sessions_count DESC
    LIMIT limit_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_device_stats(start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, end_date timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS TABLE(device_type text, sessions_count bigint, percentage numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    total_sessions BIGINT;
BEGIN
    -- Set default dates if not provided
    IF start_date IS NULL THEN
        start_date := CURRENT_DATE - INTERVAL '30 days';
    END IF;
    
    IF end_date IS NULL THEN
        end_date := CURRENT_DATE + INTERVAL '1 day';
    END IF;
    
    -- Get total sessions for percentage calculation
    SELECT COUNT(DISTINCT ao.session_id) INTO total_sessions
    FROM public.analytics_overview ao
    WHERE ao.visited_at >= start_date AND ao.visited_at < end_date;
    
    RETURN QUERY
    SELECT 
        COALESCE(ao.device_type, 'Unknown') as device_type,
        COUNT(DISTINCT ao.session_id)::BIGINT as sessions_count,
        ROUND(
            (COUNT(DISTINCT ao.session_id)::DECIMAL / total_sessions::DECIMAL) * 100, 
            2
        ) as percentage
    FROM public.analytics_overview ao
    WHERE ao.visited_at >= start_date AND ao.visited_at < end_date
    GROUP BY ao.device_type
    ORDER BY sessions_count DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_os_stats(start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, end_date timestamp with time zone DEFAULT NULL::timestamp with time zone, limit_count integer DEFAULT 10)
 RETURNS TABLE(os_name text, sessions_count bigint, percentage numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    total_sessions BIGINT;
BEGIN
    -- Set default dates if not provided
    IF start_date IS NULL THEN
        start_date := CURRENT_DATE - INTERVAL '30 days';
    END IF;
    
    IF end_date IS NULL THEN
        end_date := CURRENT_DATE + INTERVAL '1 day';
    END IF;
    
    -- Get total sessions for percentage calculation
    SELECT COUNT(DISTINCT ao.session_id) INTO total_sessions
    FROM public.analytics_overview ao
    WHERE ao.visited_at >= start_date AND ao.visited_at < end_date;
    
    RETURN QUERY
    SELECT 
        COALESCE(ao.os_name, 'Unknown') as os_name,
        COUNT(DISTINCT ao.session_id)::BIGINT as sessions_count,
        ROUND(
            (COUNT(DISTINCT ao.session_id)::DECIMAL / total_sessions::DECIMAL) * 100, 
            2
        ) as percentage
    FROM public.analytics_overview ao
    WHERE ao.visited_at >= start_date AND ao.visited_at < end_date
    GROUP BY ao.os_name
    ORDER BY sessions_count DESC
    LIMIT limit_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_period_comparison(current_start timestamp with time zone, current_end timestamp with time zone, previous_start timestamp with time zone, previous_end timestamp with time zone)
 RETURNS TABLE(current_pageviews bigint, current_visitors bigint, current_sessions bigint, current_bounce_rate numeric, previous_pageviews bigint, previous_visitors bigint, previous_sessions bigint, previous_bounce_rate numeric, pageviews_change numeric, visitors_change numeric, sessions_change numeric, bounce_rate_change numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    curr_stats RECORD;
    prev_stats RECORD;
BEGIN
    -- Get current period stats
    SELECT * INTO curr_stats FROM public.get_analytics_summary(current_start, current_end);
    
    -- Get previous period stats
    SELECT * INTO prev_stats FROM public.get_analytics_summary(previous_start, previous_end);
    
    RETURN QUERY
    SELECT 
        curr_stats.total_pageviews as current_pageviews,
        curr_stats.unique_visitors as current_visitors,
        curr_stats.total_sessions as current_sessions,
        curr_stats.bounce_rate as current_bounce_rate,
        prev_stats.total_pageviews as previous_pageviews,
        prev_stats.unique_visitors as previous_visitors,
        prev_stats.total_sessions as previous_sessions,
        prev_stats.bounce_rate as previous_bounce_rate,
        CASE 
            WHEN prev_stats.total_pageviews > 0 THEN
                ROUND(((curr_stats.total_pageviews - prev_stats.total_pageviews)::DECIMAL / prev_stats.total_pageviews::DECIMAL) * 100, 2)
            ELSE 0
        END as pageviews_change,
        CASE 
            WHEN prev_stats.unique_visitors > 0 THEN
                ROUND(((curr_stats.unique_visitors - prev_stats.unique_visitors)::DECIMAL / prev_stats.unique_visitors::DECIMAL) * 100, 2)
            ELSE 0
        END as visitors_change,
        CASE 
            WHEN prev_stats.total_sessions > 0 THEN
                ROUND(((curr_stats.total_sessions - prev_stats.total_sessions)::DECIMAL / prev_stats.total_sessions::DECIMAL) * 100, 2)
            ELSE 0
        END as sessions_change,
        ROUND(curr_stats.bounce_rate - prev_stats.bounce_rate, 2) as bounce_rate_change;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_realtime_analytics()
 RETURNS TABLE(active_visitors bigint, pageviews_last_30min bigint, top_pages jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    thirty_minutes_ago TIMESTAMP WITH TIME ZONE;
    top_pages_json JSONB;
BEGIN
    thirty_minutes_ago := NOW() - INTERVAL '30 minutes';
    
    -- Get top pages in the last 30 minutes as JSON
    SELECT jsonb_agg(
        jsonb_build_object(
            'page_path', page_path,
            'pageviews', pageviews_count
        )
    ) INTO top_pages_json
    FROM (
        SELECT 
            page_path,
            COUNT(*) as pageviews_count
        FROM public.pageviews
        WHERE visited_at >= thirty_minutes_ago
        GROUP BY page_path
        ORDER BY pageviews_count DESC
        LIMIT 5
    ) top_pages_subquery;
    
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT visitor_id)::BIGINT as active_visitors,
        COUNT(*)::BIGINT as pageviews_last_30min,
        COALESCE(top_pages_json, '[]'::jsonb) as top_pages
    FROM public.pageviews
    WHERE visited_at >= thirty_minutes_ago;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_time_series_data(start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, end_date timestamp with time zone DEFAULT NULL::timestamp with time zone, granularity text DEFAULT 'hour'::text)
 RETURNS TABLE(time_period timestamp with time zone, pageviews bigint, unique_visitors bigint, sessions bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    trunc_format TEXT;
BEGIN
    -- Set default dates if not provided
    IF start_date IS NULL THEN
        start_date := CURRENT_DATE - INTERVAL '7 days';
    END IF;
    
    IF end_date IS NULL THEN
        end_date := CURRENT_DATE + INTERVAL '1 day';
    END IF;
    
    -- Set truncation format based on granularity
    CASE granularity
        WHEN 'hour' THEN trunc_format := 'hour';
        WHEN 'day' THEN trunc_format := 'day';
        WHEN 'week' THEN trunc_format := 'week';
        WHEN 'month' THEN trunc_format := 'month';
        ELSE trunc_format := 'hour';
    END CASE;
    
    RETURN QUERY
    EXECUTE format('
        SELECT 
            DATE_TRUNC(%L, ao.visited_at) as time_period,
            COUNT(*)::BIGINT as pageviews,
            COUNT(DISTINCT ao.visitor_id)::BIGINT as unique_visitors,
            COUNT(DISTINCT ao.session_id)::BIGINT as sessions
        FROM public.analytics_overview ao
        WHERE ao.visited_at >= %L AND ao.visited_at < %L
        GROUP BY DATE_TRUNC(%L, ao.visited_at)
        ORDER BY time_period ASC
    ', trunc_format, start_date, end_date, trunc_format);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_top_pages(start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, end_date timestamp with time zone DEFAULT NULL::timestamp with time zone, limit_count integer DEFAULT 10)
 RETURNS TABLE(page_path text, pageviews_count bigint, unique_visitors bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Set default dates if not provided
    IF start_date IS NULL THEN
        start_date := CURRENT_DATE - INTERVAL '30 days';
    END IF;
    
    IF end_date IS NULL THEN
        end_date := CURRENT_DATE + INTERVAL '1 day';
    END IF;
    
    RETURN QUERY
    SELECT 
        p.page_path,
        COUNT(*) as pageviews_count,
        COUNT(DISTINCT p.visitor_id) as unique_visitors
    FROM public.pageviews p
    WHERE p.visited_at >= start_date AND p.visited_at < end_date
    GROUP BY p.page_path
    ORDER BY pageviews_count DESC
    LIMIT limit_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_top_referrers(start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, end_date timestamp with time zone DEFAULT NULL::timestamp with time zone, limit_count integer DEFAULT 10)
 RETURNS TABLE(referrer_source text, sessions_count bigint, unique_visitors bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Set default dates if not provided
    IF start_date IS NULL THEN
        start_date := CURRENT_DATE - INTERVAL '30 days';
    END IF;
    
    IF end_date IS NULL THEN
        end_date := CURRENT_DATE + INTERVAL '1 day';
    END IF;
    
    RETURN QUERY
    SELECT 
        COALESCE(s.referrer_source, 'Direct') as referrer_source,
        COUNT(*) as sessions_count,
        COUNT(DISTINCT s.visitor_id) as unique_visitors
    FROM public.sessions s
    WHERE s.started_at >= start_date AND s.started_at < end_date
    GROUP BY s.referrer_source
    ORDER BY sessions_count DESC
    LIMIT limit_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_bounce_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Check if this is the second pageview for the session
    IF (SELECT pageviews_count FROM public.sessions WHERE id = NEW.session_id) > 1 THEN
        -- Mark session as not a bounce
        UPDATE public.sessions 
        SET is_bounce = false
        WHERE id = NEW.session_id;
        
        -- Mark all pageviews in this session as not bounce
        UPDATE public.pageviews 
        SET is_bounce = false
        WHERE session_id = NEW.session_id;
    END IF;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_session_end()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Update the session's ended_at and duration when a new pageview is added
    UPDATE public.sessions 
    SET 
        ended_at = NEW.visited_at,
        duration_seconds = EXTRACT(EPOCH FROM (NEW.visited_at - started_at))::INTEGER,
        pageviews_count = pageviews_count + 1,
        exit_page = NEW.page_path,
        updated_at = TIMEZONE('utc'::text, NOW())
    WHERE id = NEW.session_id;
    
    -- Update visitor's last_seen_at and total_pageviews
    UPDATE public.visitors 
    SET 
        last_seen_at = NEW.visited_at,
        total_pageviews = total_pageviews + 1,
        updated_at = TIMEZONE('utc'::text, NOW())
    WHERE id = NEW.visitor_id;
    
    RETURN NEW;
END;
$function$
;

grant delete on table "public"."browser_info" to "anon";

grant insert on table "public"."browser_info" to "anon";

grant references on table "public"."browser_info" to "anon";

grant select on table "public"."browser_info" to "anon";

grant trigger on table "public"."browser_info" to "anon";

grant truncate on table "public"."browser_info" to "anon";

grant update on table "public"."browser_info" to "anon";

grant delete on table "public"."browser_info" to "authenticated";

grant insert on table "public"."browser_info" to "authenticated";

grant references on table "public"."browser_info" to "authenticated";

grant select on table "public"."browser_info" to "authenticated";

grant trigger on table "public"."browser_info" to "authenticated";

grant truncate on table "public"."browser_info" to "authenticated";

grant update on table "public"."browser_info" to "authenticated";

grant delete on table "public"."browser_info" to "service_role";

grant insert on table "public"."browser_info" to "service_role";

grant references on table "public"."browser_info" to "service_role";

grant select on table "public"."browser_info" to "service_role";

grant trigger on table "public"."browser_info" to "service_role";

grant truncate on table "public"."browser_info" to "service_role";

grant update on table "public"."browser_info" to "service_role";

grant delete on table "public"."device_info" to "anon";

grant insert on table "public"."device_info" to "anon";

grant references on table "public"."device_info" to "anon";

grant select on table "public"."device_info" to "anon";

grant trigger on table "public"."device_info" to "anon";

grant truncate on table "public"."device_info" to "anon";

grant update on table "public"."device_info" to "anon";

grant delete on table "public"."device_info" to "authenticated";

grant insert on table "public"."device_info" to "authenticated";

grant references on table "public"."device_info" to "authenticated";

grant select on table "public"."device_info" to "authenticated";

grant trigger on table "public"."device_info" to "authenticated";

grant truncate on table "public"."device_info" to "authenticated";

grant update on table "public"."device_info" to "authenticated";

grant delete on table "public"."device_info" to "service_role";

grant insert on table "public"."device_info" to "service_role";

grant references on table "public"."device_info" to "service_role";

grant select on table "public"."device_info" to "service_role";

grant trigger on table "public"."device_info" to "service_role";

grant truncate on table "public"."device_info" to "service_role";

grant update on table "public"."device_info" to "service_role";

grant delete on table "public"."events" to "anon";

grant insert on table "public"."events" to "anon";

grant references on table "public"."events" to "anon";

grant select on table "public"."events" to "anon";

grant trigger on table "public"."events" to "anon";

grant truncate on table "public"."events" to "anon";

grant update on table "public"."events" to "anon";

grant delete on table "public"."events" to "authenticated";

grant insert on table "public"."events" to "authenticated";

grant references on table "public"."events" to "authenticated";

grant select on table "public"."events" to "authenticated";

grant trigger on table "public"."events" to "authenticated";

grant truncate on table "public"."events" to "authenticated";

grant update on table "public"."events" to "authenticated";

grant delete on table "public"."events" to "service_role";

grant insert on table "public"."events" to "service_role";

grant references on table "public"."events" to "service_role";

grant select on table "public"."events" to "service_role";

grant trigger on table "public"."events" to "service_role";

grant truncate on table "public"."events" to "service_role";

grant update on table "public"."events" to "service_role";

grant delete on table "public"."location_info" to "anon";

grant insert on table "public"."location_info" to "anon";

grant references on table "public"."location_info" to "anon";

grant select on table "public"."location_info" to "anon";

grant trigger on table "public"."location_info" to "anon";

grant truncate on table "public"."location_info" to "anon";

grant update on table "public"."location_info" to "anon";

grant delete on table "public"."location_info" to "authenticated";

grant insert on table "public"."location_info" to "authenticated";

grant references on table "public"."location_info" to "authenticated";

grant select on table "public"."location_info" to "authenticated";

grant trigger on table "public"."location_info" to "authenticated";

grant truncate on table "public"."location_info" to "authenticated";

grant update on table "public"."location_info" to "authenticated";

grant delete on table "public"."location_info" to "service_role";

grant insert on table "public"."location_info" to "service_role";

grant references on table "public"."location_info" to "service_role";

grant select on table "public"."location_info" to "service_role";

grant trigger on table "public"."location_info" to "service_role";

grant truncate on table "public"."location_info" to "service_role";

grant update on table "public"."location_info" to "service_role";

grant delete on table "public"."os_info" to "anon";

grant insert on table "public"."os_info" to "anon";

grant references on table "public"."os_info" to "anon";

grant select on table "public"."os_info" to "anon";

grant trigger on table "public"."os_info" to "anon";

grant truncate on table "public"."os_info" to "anon";

grant update on table "public"."os_info" to "anon";

grant delete on table "public"."os_info" to "authenticated";

grant insert on table "public"."os_info" to "authenticated";

grant references on table "public"."os_info" to "authenticated";

grant select on table "public"."os_info" to "authenticated";

grant trigger on table "public"."os_info" to "authenticated";

grant truncate on table "public"."os_info" to "authenticated";

grant update on table "public"."os_info" to "authenticated";

grant delete on table "public"."os_info" to "service_role";

grant insert on table "public"."os_info" to "service_role";

grant references on table "public"."os_info" to "service_role";

grant select on table "public"."os_info" to "service_role";

grant trigger on table "public"."os_info" to "service_role";

grant truncate on table "public"."os_info" to "service_role";

grant update on table "public"."os_info" to "service_role";

grant delete on table "public"."pageviews" to "anon";

grant insert on table "public"."pageviews" to "anon";

grant references on table "public"."pageviews" to "anon";

grant select on table "public"."pageviews" to "anon";

grant trigger on table "public"."pageviews" to "anon";

grant truncate on table "public"."pageviews" to "anon";

grant update on table "public"."pageviews" to "anon";

grant delete on table "public"."pageviews" to "authenticated";

grant insert on table "public"."pageviews" to "authenticated";

grant references on table "public"."pageviews" to "authenticated";

grant select on table "public"."pageviews" to "authenticated";

grant trigger on table "public"."pageviews" to "authenticated";

grant truncate on table "public"."pageviews" to "authenticated";

grant update on table "public"."pageviews" to "authenticated";

grant delete on table "public"."pageviews" to "service_role";

grant insert on table "public"."pageviews" to "service_role";

grant references on table "public"."pageviews" to "service_role";

grant select on table "public"."pageviews" to "service_role";

grant trigger on table "public"."pageviews" to "service_role";

grant truncate on table "public"."pageviews" to "service_role";

grant update on table "public"."pageviews" to "service_role";

grant delete on table "public"."sessions" to "anon";

grant insert on table "public"."sessions" to "anon";

grant references on table "public"."sessions" to "anon";

grant select on table "public"."sessions" to "anon";

grant trigger on table "public"."sessions" to "anon";

grant truncate on table "public"."sessions" to "anon";

grant update on table "public"."sessions" to "anon";

grant delete on table "public"."sessions" to "authenticated";

grant insert on table "public"."sessions" to "authenticated";

grant references on table "public"."sessions" to "authenticated";

grant select on table "public"."sessions" to "authenticated";

grant trigger on table "public"."sessions" to "authenticated";

grant truncate on table "public"."sessions" to "authenticated";

grant update on table "public"."sessions" to "authenticated";

grant delete on table "public"."sessions" to "service_role";

grant insert on table "public"."sessions" to "service_role";

grant references on table "public"."sessions" to "service_role";

grant select on table "public"."sessions" to "service_role";

grant trigger on table "public"."sessions" to "service_role";

grant truncate on table "public"."sessions" to "service_role";

grant update on table "public"."sessions" to "service_role";

grant delete on table "public"."visitors" to "anon";

grant insert on table "public"."visitors" to "anon";

grant references on table "public"."visitors" to "anon";

grant select on table "public"."visitors" to "anon";

grant trigger on table "public"."visitors" to "anon";

grant truncate on table "public"."visitors" to "anon";

grant update on table "public"."visitors" to "anon";

grant delete on table "public"."visitors" to "authenticated";

grant insert on table "public"."visitors" to "authenticated";

grant references on table "public"."visitors" to "authenticated";

grant select on table "public"."visitors" to "authenticated";

grant trigger on table "public"."visitors" to "authenticated";

grant truncate on table "public"."visitors" to "authenticated";

grant update on table "public"."visitors" to "authenticated";

grant delete on table "public"."visitors" to "service_role";

grant insert on table "public"."visitors" to "service_role";

grant references on table "public"."visitors" to "service_role";

grant select on table "public"."visitors" to "service_role";

grant trigger on table "public"."visitors" to "service_role";

grant truncate on table "public"."visitors" to "service_role";

grant update on table "public"."visitors" to "service_role";

create policy "Users can update own profile"
on "public"."users"
as permissive
for update
to public
using ((auth.uid() = id));


create policy "Users can view own profile"
on "public"."users"
as permissive
for select
to public
using ((auth.uid() = id));



