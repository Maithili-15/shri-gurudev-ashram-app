-- Migration: Dynamic Seva Packages
-- Purpose: Move hardcoded seva packages and prices into the database, allowing dynamic admin control.

-- 1. Create the seva_packages table
CREATE TABLE IF NOT EXISTS public.seva_packages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,

    seva_type text NOT NULL UNIQUE CHECK (
        seva_type = ANY (
            ARRAY[
                'guruji_aarti',
                'yajman',
                'gau_seva',
                'temple_seva',
                'event'
            ]
        )
    ),

    title text NOT NULL,
    description text,
    image_url text,
    price numeric NOT NULL CHECK (price >= 0),
    is_active boolean NOT NULL DEFAULT true,
    booking_enabled boolean NOT NULL DEFAULT true,
    allow_date_selection boolean NOT NULL DEFAULT true,
    max_bookings_per_day integer,
    display_order integer DEFAULT 0,
    
    color text,
    icon text,
    category text,
    available_from date,
    available_until date
);

-- 2. Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION public.handle_seva_packages_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_seva_package_updated ON public.seva_packages;
CREATE TRIGGER on_seva_package_updated
  BEFORE UPDATE ON public.seva_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_seva_packages_updated_at();

-- 3. Row Level Security
ALTER TABLE public.seva_packages ENABLE ROW LEVEL SECURITY;

-- Public can read active packages
DROP POLICY IF EXISTS "seva_packages_select_public" ON public.seva_packages;
CREATE POLICY "seva_packages_select_public"
  ON public.seva_packages
  FOR SELECT
  USING (deleted_at IS NULL);

-- Admin (and backend service role) can do everything
-- Note: backend usually bypasses RLS using service_role key.

-- 4. Alter existing tables to reference the new table
ALTER TABLE public.seva_bookings
ADD COLUMN IF NOT EXISTS seva_package_id uuid REFERENCES public.seva_packages(id);

ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS additional_seva_package_id uuid REFERENCES public.seva_packages(id);

-- Note: old columns (additional_seva_type, additional_seva_amount) in bookings are intentionally retained for backward compatibility with older clients.
