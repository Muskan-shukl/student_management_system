import { http } from '@/core/api/http'
import type { Announcement } from '@/core/api/types'

export const announcementsApi = {
  list: (page = 1) => http.get<Announcement[]>('/announcements', { query: { page, limit: 10 } }),
  create: (payload: Record<string, unknown>) => http.post<Announcement>('/announcements', payload),
  update: (id: string, payload: Record<string, unknown>) => http.patch<Announcement>(`/announcements/${id}`, payload),
  remove: (id: string) => http.delete<null>(`/announcements/${id}`),
}
