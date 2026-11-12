import { fail, hasElement, ok, rows, secure, viewer } from './http.ts'
import { findModule, isVisibleTo, publicModule, visibleModules } from './module-catalog.ts'

/**
 * Campus records (the portal mirror of the native Campus360 navigator). READ-ONLY.
 * - Module visibility mirrors the navigator's role lists (convenience; not the security boundary).
 * - Filters come only from the server-side catalog; the client sends a module key, never a query.
 * - Rows and fields are read through GlideRecordSecure as the user, so table/row/field ACLs and the
 *   W-3 query rules decide what is returned (unreadable fields are omitted by pick()).
 */
export function getBrowseCatalog(request: any, response: any): void {
    ok(response, visibleModules(viewer().personas).map(publicModule))
}

export function getBrowseModule(request: any, response: any): void {
    const m = findModule(String(request.pathParams.module || ''))
    if (!m) return fail(response, 404, 'Unknown list.')
    if (!isVisibleTo(m, viewer().personas)) return fail(response, 403, 'This list is not available for your role.')
    if (m.kind !== 'list' || !m.columns) return fail(response, 400, 'This entry is not a list.')
    const probe = secure(m.table)
    if (!probe.canRead()) return fail(response, 403, 'You cannot read this table.')
    const columns = m.columns
        .filter((f) => probe.isValidField(f))
        .map((f) => {
            const el = probe.getElement(f)
            return { name: f, label: hasElement(el) ? String(el.getLabel()) : f }
        })
    const items = rows(m.table, m.query || 'sys_idISNOTEMPTY', m.columns, 200, m.order || 'ORDERBYDESCsys_updated_on')
    ok(response, { module: publicModule(m), columns, items, limit: 200, canCreate: probe.canCreate() === true })
}
