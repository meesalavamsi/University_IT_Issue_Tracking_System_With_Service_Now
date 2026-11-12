// Campus records catalog (src/server/portal/module-catalog.ts) must mirror the native navigator exactly.
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { MODULES, visibleModules, findModule, publicModule } from '../../src/server/portal/module-catalog.ts'

const ROOT = new URL('../../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const menu = readFileSync(ROOT + 'src/fluent/menu/campus360.menu.now.ts', 'utf8')
const P = 'x_774308_campus360_'

// Parse the native navigator modules (non-separator) from the Fluent menu definition.
const native = [...menu.matchAll(/data: \{ title: (['"])(.*?)\1, application: campus360Menu, link_type: '(\w+)'(?:, name: '([\w]+)')?(?:, filter: '([^']*)')?.*?roles: \[([^\]]*)\]/g)]
    .filter((m) => m[3] !== 'SEPARATOR')
    .map((m) => ({ title: m[2], type: m[3], table: m[4], filter: (m[5] || '').replace(/\^EQ$/, ''), personas: m[6].match(/campus360\.(\w+)/g).map((r) => r.split('.')[1]).sort() }))

describe('catalog mirrors the native Campus360 navigator', () => {
    test('same number of entries (40)', () => { assert.equal(native.length, 40); assert.equal(MODULES.length, 40) })
    test('same titles, tables, filters and roles, in the same order', () => {
        native.forEach((n, i) => {
            const m = MODULES[i]
            assert.equal(m.title, n.title, `entry ${i}`)
            assert.equal(m.table, n.table, `${n.title} table`)
            assert.deepEqual([...m.personas].sort(), n.personas, `${n.title} roles`)
            if (n.type === 'FILTER' && n.table.indexOf(P) === 0) assert.equal(m.query, n.filter, `${n.title} filter`)
            if (n.type === 'NEW') assert.equal(m.kind, 'new')
        })
    })
    test('keys are unique', () => assert.equal(new Set(MODULES.map((m) => m.key)).size, MODULES.length))
    test('lists only target Campus360 tables and always have columns', () => {
        for (const m of MODULES.filter((x) => x.kind === 'list')) {
            assert.ok(m.table.indexOf(P) === 0, m.key)
            assert.ok(m.columns && m.columns.length >= 4, m.key)
        }
    })
    test('platform tables open the native interface (never queried by the portal)', () => {
        for (const m of MODULES.filter((x) => x.table.indexOf(P) !== 0)) assert.equal(m.kind, 'native', m.key)
    })
})

describe('visibility and exposure', () => {
    test('students and faculty see no records entries (same as the navigator)', () => {
        assert.deepEqual(visibleModules(['student']), [])
        assert.deepEqual(visibleModules(['faculty']), [])
    })
    test('a warden sees exactly the Hostel section', () => assert.deepEqual([...new Set(visibleModules(['warden']).map((m) => m.group))], ['Hostel']))
    test('Campus360 admin sees all 40', () => assert.equal(visibleModules(['admin']).length, 40))
    test('unknown keys are not found', () => assert.equal(findModule('sys_user'), undefined))
    test('the browser never receives a query or column list', () => {
        for (const m of MODULES) {
            const pub = publicModule(m)
            assert.equal(pub.query, undefined)
            assert.equal(pub.columns, undefined)
        }
    })
})

describe('browse handlers', () => {
    const src = readFileSync(ROOT + 'src/server/portal/browse.ts', 'utf8')
    test('read-only and ACL-enforced (GlideRecordSecure via secure()/rows())', () => {
        assert.doesNotMatch(src, /\.(insert|update|deleteRecord|deleteMultiple|setValue)\(/)
        assert.doesNotMatch(src, /new\s+GlideRecord\b/)
        assert.match(src, /isVisibleTo\(m, viewer\(\)\.personas\)/)
    })
    test('never takes a query from the request', () => {
        assert.doesNotMatch(src, /queryParams|sysparm_query|request\.body/)
    })
    test('both routes are behind the portal API ACL', () => {
        const api = readFileSync(ROOT + 'src/fluent/portal/portal-api.now.ts', 'utf8')
        for (const p of ["path: '/browse'", "path: '/browse/{module}'"]) {
            const line = api.split('\n').find((l) => l.includes(p))
            assert.ok(line && line.includes('enforceAcl: [portalApiAcl]') && line.includes('authentication: true') && line.includes("method: 'GET'"), p)
        }
    })
})
