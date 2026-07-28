import { Router } from 'express'
import { HttpError } from '../errors'
import { supabaseAdmin } from '../services/supabaseAdmin'

export const sevaPackagesPublicRouter = Router()

sevaPackagesPublicRouter.get('/', async (_request, response, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('seva_packages')
      .select('*')
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching public seva packages:', error)
      throw new HttpError(500, 'Failed to fetch seva packages')
    }

    const formattedData = (data || []).map(p => ({
      id: p.id,
      sevaType: p.seva_type,
      title: p.title,
      description: p.description,
      price: p.price,
      imageUrl: p.image_url,
      bookingEnabled: p.booking_enabled,
      allowDateSelection: p.allow_date_selection,
      displayOrder: p.display_order,
      color: p.color,
      icon: p.icon,
      category: p.category,
      availableFrom: p.available_from,
      availableUntil: p.available_until,
    }))

    response.json(formattedData)
  } catch (error) {
    next(error)
  }
})
