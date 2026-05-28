import { getSupabaseClient } from '../lib/supabase'
import { TravelPackage } from '../types/travel'

type PackageRow = {
  id: string | number
  title?: string | null
  name?: string | null
  description?: string | null
  duration?: string | null
  duration_label?: string | null
  price?: string | number | null
}

function parsePriceAmount(price: string | number | null | undefined) {
  if (typeof price === 'number') {
    return price
  }

  if (typeof price === 'string') {
    const parsed = Number(price.replace(/[^\d.]/g, ''))
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

function formatPrice(price: string | number | null | undefined) {
  if (typeof price === 'number') {
    return `INR ${price.toLocaleString('en-IN')}`
  }
  if (typeof price === 'string' && price.trim().length > 0) {
    return price
  }
  return 'INR 0'
}

function mapPackageRow(row: PackageRow): TravelPackage {
  return {
    id: String(row.id),
    title: row.title ?? row.name ?? 'Untitled Yatra',
    description: row.description ?? '',
    duration: row.duration ?? row.duration_label ?? 'Duration TBA',
    price: formatPrice(row.price),
    priceAmount: parsePriceAmount(row.price),
  }
}

export async function fetchPackages(): Promise<TravelPackage[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('travel_packages')
    .select('*')
    .eq('is_active', true)

  if (error) {
    throw error
  }

  return ((data ?? []) as PackageRow[]).map(mapPackageRow)
}
