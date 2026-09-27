import { http } from '@/core/api/http'
import type { Day, TimetableSlot } from '@/core/api/types'

export const timetableApi = {
  list: (query: { course?: string; year?: number | ''; teacher?: string }) => http.get<{ today: Day; slots: TimetableSlot[] }>('/timetable', { query }),
  me: () => http.get<{ course: string; year: number; today: Day; slots: TimetableSlot[] }>('/timetable/me'),
  create: (payload: Record<string, unknown>) => http.post<TimetableSlot>('/timetable', payload),
  update: (id: string, payload: Record<string, unknown>) => http.patch<TimetableSlot>(`/timetable/${id}`, payload),
  remove: (id: string) => http.delete<null>(`/timetable/${id}`),
}
