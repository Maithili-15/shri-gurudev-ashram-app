import { supabaseAdmin } from './supabaseAdmin'
import { logInfo, logError } from '../utils/logger'

export async function createNotification(userId: string, title: string, message: string) {
  try {
    const { error } = await supabaseAdmin.from('notifications').insert({
      user_id: userId,
      title,
      message,
      is_read: false,
    })

    if (error) {
      logError('ERROR', `Failed to create notification for user ${userId}`, error)
    } else {
      logInfo('Auth', `Notification created for user ${userId}: ${title}`)
    }
  } catch (err) {
    logError('ERROR', `Error creating notification for user ${userId}`, err)
  }
}
