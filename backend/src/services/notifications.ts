import { supabaseAdmin } from './supabaseAdmin'
import { logInfo, logError } from '../utils/logger'
import { NotificationType } from '../constants/notifications'

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType | string = NotificationType.SYSTEM,
  metadata: Record<string, any> = {}
) {
  try {
    const { error } = await supabaseAdmin.from('notifications').insert({
      user_id: userId,
      type: type || NotificationType.SYSTEM,
      title,
      message,
      metadata,
      is_read: false,
    })

    if (error) {
      logError('ERROR', `Failed to create notification for user ${userId}`, error)
    } else {
      logInfo('Auth', `Notification created for user ${userId}: [${type}] ${title}`)
    }
  } catch (err) {
    logError('ERROR', `Error creating notification for user ${userId}`, err)
  }
}
