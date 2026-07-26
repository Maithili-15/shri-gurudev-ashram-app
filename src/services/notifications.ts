import api from '../api/axiosClient'

export type NotificationItem = {
  id: string
  created_at: string
  is_read: boolean
  message: string
  title: string
  type: string
  metadata?: any
}

export const getNotifications = async (): Promise<NotificationItem[]> => {
  try {
    const { data } = await api.get('/api/notifications')
    return data.notifications ?? []
  } catch {
    return []
  }
}

export const markNotificationAsRead = async (id: string): Promise<void> => {
  try {
    await api.put(`/api/notifications/${id}/read`)
  } catch (e) {
    console.warn('Failed to mark notification as read', e)
  }
}
