-- Migration: Add missing increment_seats RPC function for booking cancellations
-- Purpose: Restore travel package seat inventory when a booking is cancelled.

CREATE OR REPLACE FUNCTION public.increment_seats(pid uuid, count integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.travel_packages
  SET remaining_seats = remaining_seats + count
  WHERE id = pid;
END;
$$;
