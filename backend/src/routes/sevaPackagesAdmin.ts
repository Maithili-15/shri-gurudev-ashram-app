import { Router } from 'express'
import { HttpError } from '../errors'
import { supabaseAdmin } from '../services/supabaseAdmin'

export const sevaPackagesAdminRouter = Router()

sevaPackagesAdminRouter.get('/', async (_request, response, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('seva_packages')
      .select('*')
      .is('deleted_at', null)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching admin seva packages:', error)
      throw new HttpError(500, 'Failed to fetch seva packages')
    }
    
    // Send as snake_case for admin dashboard or camelCase? 
    // Usually admin dashboards prefer snake_case from direct supabase query, but let's camelCase it to be consistent with public API.
    const formattedData = (data || []).map(p => ({
      id: p.id,
      sevaType: p.seva_type,
      title: p.title,
      description: p.description,
      price: p.price,
      imageUrl: p.image_url,
      isActive: p.is_active,
      bookingEnabled: p.booking_enabled,
      allowDateSelection: p.allow_date_selection,
      maxBookingsPerDay: p.max_bookings_per_day,
      displayOrder: p.display_order,
      color: p.color,
      icon: p.icon,
      category: p.category,
      availableFrom: p.available_from,
      availableUntil: p.available_until,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }))

    response.json(formattedData)
  } catch (error) {
    next(error)
  }
})

sevaPackagesAdminRouter.post('/', async (request, response, next) => {
  try {
    const {
      sevaType, title, description, price, imageUrl, isActive, bookingEnabled, 
      allowDateSelection, maxBookingsPerDay, displayOrder, color, icon, category,
      availableFrom, availableUntil
    } = request.body

    const { data, error } = await supabaseAdmin
      .from('seva_packages')
      .insert({
        seva_type: sevaType,
        title,
        description,
        price,
        image_url: imageUrl,
        is_active: isActive ?? true,
        booking_enabled: bookingEnabled ?? true,
        allow_date_selection: allowDateSelection ?? true,
        max_bookings_per_day: maxBookingsPerDay,
        display_order: displayOrder ?? 0,
        color,
        icon,
        category,
        available_from: availableFrom,
        available_until: availableUntil
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating seva package:', error)
      throw new HttpError(500, 'Failed to create seva package')
    }

    response.status(201).json({ success: true, data })
  } catch (error) {
    next(error)
  }
})

sevaPackagesAdminRouter.put('/:id', async (request, response, next) => {
  try {
    const { id } = request.params
    const {
      title, description, price, imageUrl, isActive, bookingEnabled, 
      allowDateSelection, maxBookingsPerDay, displayOrder, color, icon, category,
      availableFrom, availableUntil
    } = request.body

    const { data, error } = await supabaseAdmin
      .from('seva_packages')
      .update({
        title,
        description,
        price,
        image_url: imageUrl,
        is_active: isActive,
        booking_enabled: bookingEnabled,
        allow_date_selection: allowDateSelection,
        max_bookings_per_day: maxBookingsPerDay,
        display_order: displayOrder,
        color,
        icon,
        category,
        available_from: availableFrom,
        available_until: availableUntil
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating seva package:', error)
      throw new HttpError(500, 'Failed to update seva package')
    }

    response.json({ success: true, data })
  } catch (error) {
    next(error)
  }
})

sevaPackagesAdminRouter.put('/:id/status', async (request, response, next) => {
  try {
    const { id } = request.params
    const { isActive, bookingEnabled } = request.body

    const updateData: any = {}
    if (isActive !== undefined) updateData.is_active = isActive
    if (bookingEnabled !== undefined) updateData.booking_enabled = bookingEnabled

    const { data, error } = await supabaseAdmin
      .from('seva_packages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating status:', error)
      throw new HttpError(500, 'Failed to update status')
    }

    response.json({ success: true, data })
  } catch (error) {
    next(error)
  }
})

sevaPackagesAdminRouter.delete('/:id', async (request, response, next) => {
  try {
    const { id } = request.params

    const { data, error } = await supabaseAdmin
      .from('seva_packages')
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error deleting seva package:', error)
      throw new HttpError(500, 'Failed to delete seva package')
    }

    response.json({ success: true, data })
  } catch (error) {
    next(error)
  }
})
