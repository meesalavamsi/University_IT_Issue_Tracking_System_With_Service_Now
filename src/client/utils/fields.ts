// Field helpers for the portal API shape: { value, display } (and Table-API style objects).
export const display = (field: any): string => {
    if (field === null || field === undefined) return ''
    if (typeof field === 'string' || typeof field === 'number') return String(field)
    return field.display || field.display_value || ''
}

export const value = (field: any): string => {
    if (field === null || field === undefined) return ''
    if (typeof field === 'string' || typeof field === 'number') return String(field)
    return field.value || ''
}

export const has = (field: any): boolean => field !== undefined && field !== null

/** Relative, human-friendly time for ServiceNow "yyyy-MM-dd HH:mm:ss" (UTC) values. */
export function ago(dateTime: string): string {
    if (!dateTime) return ''
    const t = Date.parse(dateTime.replace(' ', 'T') + 'Z')
    if (isNaN(t)) return dateTime
    const mins = Math.round((Date.now() - t) / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins} min ago`
    const hrs = Math.round(mins / 60)
    if (hrs < 24) return `${hrs} h ago`
    const days = Math.round(hrs / 24)
    return days < 30 ? `${days} d ago` : dateTime.slice(0, 10)
}
