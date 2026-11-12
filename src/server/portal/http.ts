import { gs, GlideRecordSecure } from '@servicenow/glide'
import { personasFromRoles, type Persona } from './core.ts'

/** Thin response helpers for the Campus360 portal scripted REST API. */
export function ok(response: any, data: any): void {
    response.setStatus(200)
    response.setBody({ data })
}
export function created(response: any, data: any): void {
    response.setStatus(201)
    response.setBody({ data })
}
export function fail(response: any, status: number, message: string): void {
    response.setStatus(status)
    response.setBody({ error: { message } })
}
export function bodyOf(request: any): any {
    try {
        return request.body ? request.body.data : null
    } catch (e) {
        return null
    }
}

export interface Viewer { userId: string; userName: string; displayName: string; personas: Persona[] }
export function viewer(): Viewer {
    const user = gs.getUser()
    const roles = String(user.getRoles() || '').split(',')
    return { userId: gs.getUserID(), userName: gs.getUserName(), displayName: user.getDisplayName(), personas: personasFromRoles(roles) }
}

/**
 * ACL-enforced record access. GlideRecordSecure applies table, row and field ACLs for the
 * session user. This is the ONLY data-access path used by the portal API (no GlideRecord).
 */
export function secure(table: string): any {
    return new (GlideRecordSecure as any)(table)
}

export function rows(table: string, query: string, fields: string[], limit: number, order?: string): any[] {
    const gr = secure(table)
    gr.addEncodedQuery(query)
    if (order) gr.addEncodedQuery(order)
    gr.setLimit(limit)
    gr.query()
    const out: any[] = []
    while (gr.next()) out.push(pick(gr, fields))
    return out
}

/**
 * rev 3.1 (DEF-2): a GlideElement whose value is EMPTY evaluates falsy on this platform, so `!el`
 * wrongly treated empty fields as missing. Always test element presence with this helper.
 */
export function hasElement(el: any): boolean {
    return el !== null && el !== undefined
}

/** Field values the user may read; unreadable fields are omitted rather than returned empty. */
export function pick(gr: any, fields: string[]): any {
    const o: any = { sys_id: gr.getUniqueValue() }
    for (const f of fields) {
        if (!gr.isValidField(f)) continue
        const el = gr.getElement(f)
        if (!hasElement(el) || (el.canRead && el.canRead() === false)) continue
        o[f] = { value: gr.getValue(f) || '', display: gr.getDisplayValue(f) || '' }
    }
    return o
}

/** ACL-filtered row count (counts rows actually readable; capped for safety). */
export function countReadable(table: string, query: string, cap = 2000): number {
    const gr = secure(table)
    gr.addEncodedQuery(query)
    gr.setLimit(cap)
    gr.query()
    let n = 0
    while (gr.next()) n++
    return n
}
