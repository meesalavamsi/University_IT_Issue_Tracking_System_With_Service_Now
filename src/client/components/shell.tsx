import React, { useEffect, useState } from 'react'
import { Avatar } from '@servicenow/react-components/Avatar'
import { useSession, type Persona } from '../context/session'
import { Icon } from './icons'

export interface NavItem { view: string; label: string; icon: string; personas: Persona[] | 'all' }

/** Role-based navigation. Visibility here is convenience only: every view's data is server-authorised. */
export const NAV: { group: string; items: NavItem[] }[] = [
    { group: 'Home', items: [{ view: 'dashboard', label: 'Dashboard', icon: 'home', personas: 'all' }] },
    { group: 'Requests', items: [
        { view: 'raise', label: 'Raise a request', icon: 'plus', personas: 'all' },
        { view: 'my-requests', label: 'My requests', icon: 'inbox', personas: 'all' },
    ] },
    { group: 'Work', items: [
        { view: 'queue', label: 'IT work queue', icon: 'wrench', personas: ['technician', 'it_manager', 'admin'] },
        { view: 'hostel', label: 'My hostel', icon: 'building', personas: ['warden'] },
        { view: 'maintenance', label: 'Maintenance', icon: 'tools', personas: ['maintenance', 'lab_admin', 'warden', 'technician', 'admin'] },
        { view: 'classes', label: 'Classes & attendance', icon: 'book', personas: ['faculty', 'hod'] },
        { view: 'registrations', label: 'Registrations', icon: 'clipboard', personas: ['registrar', 'hod', 'admin'] },
    ] },
    { group: 'Insight', items: [
        { view: 'insights', label: 'Campus insights', icon: 'chart', personas: ['leadership', 'admin', 'it_manager', 'hod', 'registrar', 'warden', 'technician', 'lab_admin', 'maintenance'] },
        { view: 'admin', label: 'Administration', icon: 'shield', personas: ['admin'] },
    ] },
]

export function visibleNav(is: (...p: Persona[]) => boolean) {
    return NAV.map((g) => ({ group: g.group, items: g.items.filter((i) => i.personas === 'all' || is(...i.personas)) })).filter((g) => g.items.length)
}

const PERSONA_LABEL: { [p: string]: string } = {
    student: 'Student', faculty: 'Faculty', hod: 'Head of Department', warden: 'Warden', technician: 'IT Support', it_manager: 'IT Manager',
    maintenance: 'Facilities', lab_admin: 'Lab Admin', registrar: 'Registrar', faculty_admin: 'Faculty Admin', leadership: 'Leadership', admin: 'Campus360 Admin',
}
export const personaLabel = (p: string) => PERSONA_LABEL[p] || p

const TITLES: { [view: string]: string } = {}
NAV.forEach((g) => g.items.forEach((i) => { TITLES[i.view] = i.label }))
TITLES.record = 'Request details'
TITLES.attendance = 'Attendance'

export interface BrowseModule { key: string; group: string; title: string; kind: 'list' | 'new' | 'native'; table: string; href: string }

export const GROUP_ICON: { [group: string]: string } = {
    'IT Issues': 'wifi', Students: 'grad', Faculty: 'users', Academics: 'book', Attendance: 'calendar',
    Hostel: 'building', 'Labs & Infrastructure': 'tools', Administration: 'shield',
}

/** "Campus records": the same sections and entries as the native Campus360 navigator, for this user's roles. */
function RecordsNav({ modules, currentKey, onModule }: { modules: BrowseModule[]; currentKey: string; onModule: (m: BrowseModule) => void }) {
    const groups: { name: string; items: BrowseModule[] }[] = []
    modules.forEach((m) => {
        let g = groups.filter((x) => x.name === m.group)[0]
        if (!g) { g = { name: m.group, items: [] }; groups.push(g) }
        g.items.push(m)
    })
    const activeGroup = (modules.filter((m) => m.key === currentKey)[0] || { group: '' }).group
    const [expanded, setExpanded] = useState<{ [g: string]: boolean }>({})
    useEffect(() => { if (activeGroup) setExpanded((e) => ({ ...e, [activeGroup]: true })) }, [activeGroup])
    if (!groups.length) return null
    return (
        <>
            <div className="c360-nav__group">Campus records <span className="c360-nav__count">{modules.length}</span></div>
            {groups.map((g) => {
                const isOpen = !!expanded[g.name]
                return (
                    <div key={g.name} className={'c360-navgroup' + (isOpen ? ' c360-navgroup--open' : '') + (g.name === activeGroup ? ' c360-navgroup--active' : '')}>
                        <button type="button" className="c360-nav__item c360-navgroup__head" aria-expanded={isOpen} onClick={() => setExpanded({ ...expanded, [g.name]: !isOpen })}>
                            <Icon name={GROUP_ICON[g.name] || 'list'} size={18} />
                            <span>{g.name}</span>
                            <span className="c360-navgroup__badge">{g.items.length}</span>
                            <Icon name="chevron" size={14} className="c360-navgroup__chev" />
                        </button>
                        {isOpen && (
                            <div className="c360-navgroup__items">
                                {g.items.map((m) => (
                                    <a key={m.key} href={m.kind === 'native' ? m.href : `?view=browse&id=${m.key}`} target={m.kind === 'native' ? '_blank' : undefined} rel={m.kind === 'native' ? 'noopener' : undefined}
                                        className={'c360-navsub' + (currentKey === m.key ? ' c360-navsub--active' : '')} aria-current={currentKey === m.key ? 'page' : undefined}
                                        onClick={(e) => { if (m.kind !== 'native') { e.preventDefault(); onModule(m) } }}>
                                        <span>{m.title}</span>
                                        {m.kind === 'native' && <Icon name="external" size={12} />}
                                        {m.kind === 'new' && <Icon name="plus" size={12} />}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                )
            })}
        </>
    )
}

export function Shell({ current, currentId, onNavigate, onModule, children }: { current: string; currentId?: string | null; onNavigate: (v: string) => void; onModule: (m: BrowseModule) => void; children: React.ReactNode }) {
    const { me, personas, is, modules } = useSession()
    const [open, setOpen] = useState(false)
    const go = (v: string) => { setOpen(false); onNavigate(v) }
    const pickModule = (m: BrowseModule) => { setOpen(false); onModule(m) }
    const currentModule = current === 'browse' ? modules.filter((m) => m.key === currentId)[0] : undefined
    const name = (me && me.user && me.user.name) || ''
    const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })
    return (
        <div className={'c360-shell' + (open ? ' c360-shell--nav-open' : '')}>
            <aside className="c360-sidebar" aria-label="Campus360 navigation">
                <div className="c360-sidebar__glow" aria-hidden="true" />
                <div className="c360-brand">
                    <div className="c360-brand__mark" aria-hidden="true"><span>C</span><sup>360</sup></div>
                    <div><div className="c360-brand__name">Campus360</div><div className="c360-brand__tag">One campus · every service</div></div>
                </div>
                <nav className="c360-nav">
                    {visibleNav(is).map((g) => (
                        <React.Fragment key={g.group}>
                            <div className="c360-nav__group">{g.group}</div>
                            {g.items.map((i) => (
                                <a key={i.view} href={`?view=${i.view}`} className={'c360-nav__item' + (current === i.view ? ' c360-nav__item--active' : '')}
                                    aria-current={current === i.view ? 'page' : undefined} onClick={(e) => { e.preventDefault(); go(i.view) }}>
                                    <Icon name={i.icon} size={18} />
                                    <span>{i.label}</span>
                                </a>
                            ))}
                        </React.Fragment>
                    ))}
                    <RecordsNav modules={modules} currentKey={current === 'browse' ? currentId || '' : ''} onModule={pickModule} />
                </nav>
                <div className="c360-nav__footer">
                    <div className="c360-nav__footer-title">Your access</div>
                    <div className="c360-chips c360-chips--dark">
                        {personas.length ? personas.map((p) => <span key={p} className="c360-chip">{personaLabel(p)}</span>) : <span className="c360-chip">None</span>}
                    </div>
                    <div className="c360-nav__secure"><Icon name="shield" size={14} /> Signed in securely through ServiceNow</div>
                </div>
            </aside>
            <div className="c360-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />
            <div className="c360-main">
                <header className="c360-topbar">
                    <button type="button" className="c360-topbar__menu" aria-label="Open navigation" onClick={() => setOpen(!open)}><Icon name="menu" /></button>
                    <div className="c360-topbar__title">
                        <span className="c360-topbar__crumb">Campus360</span>
                        <span className="c360-topbar__sep">/</span>
                        {currentModule && <><span className="c360-topbar__crumb">{currentModule.group}</span><span className="c360-topbar__sep">/</span></>}
                        <span className="c360-topbar__page">{currentModule ? currentModule.title : TITLES[current] || 'Dashboard'}</span>
                    </div>
                    <div className="c360-topbar__spacer" />
                    <div className="c360-topbar__date"><Icon name="calendar" size={16} />{today}</div>
                    <div className="c360-user">
                        <div className="c360-user__text">
                            <span className="c360-user__name">{name}</span>
                            <span className="c360-user__role">{personas.length ? personaLabel(personas[personas.length - 1]) : ''}</span>
                        </div>
                        <Avatar userName={name} size="sm" />
                    </div>
                </header>
                <main className="c360-content" id="c360-main" key={current + (currentId || '')}>{children}</main>
            </div>
        </div>
    )
}
