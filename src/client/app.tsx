import React from 'react'
import { Button } from '@servicenow/react-components/Button'
import { useSession, type BrowseModuleInfo } from './context/session'
import { useRouter } from './context/router'
import { Shell, visibleNav } from './components/shell'
import { Empty, ErrorState, Panel } from './components/ui'
import { TYPE_LABELS } from './utils/lifecycle'
import Browse from './views/Browse'
import RecordView from './views/RecordView'
import Dashboard from './views/Dashboard'
import RaiseRequest from './views/RaiseRequest'
import MyRequests from './views/MyRequests'
import RequestDetail from './views/RequestDetail'
import Queue from './views/Queue'
import Hostel from './views/Hostel'
import Maintenance from './views/Maintenance'
import Classes from './views/Classes'
import Attendance from './views/Attendance'
import Registrations from './views/Registrations'
import Insights from './views/Insights'
import Admin from './views/Admin'

export default function App() {
    const { loading, error, me, is, reload } = useSession()
    const { route, navigate } = useRouter()
    const open = (table: string, id: string) => navigate('record', { table, id, title: 'Request' })
    const go = (view: string, opts?: { id?: string; table?: string }) => navigate(view, opts || {})

    if (loading) return (
        <div className="c360-splash" role="status" aria-live="polite">
            <div className="c360-splash__mark" aria-hidden="true">C<sup>360</sup></div>
            <div className="c360-splash__name">Campus360</div>
            <div className="c360-splash__bar" aria-hidden="true"><span /></div>
            <span className="c360-sr-only">Opening Campus360…</span>
        </div>
    )
    if (error) return <div className="c360-content"><ErrorState message={error} onRetry={reload} /></div>
    if (me && me.personas.length === 0) {
        return <div className="c360-content"><Panel><Empty title="Campus360 access not set up" text="Your account has no Campus360 role yet. Please contact the Campus360 administrator." /></Panel></div>
    }

    // 'browse' lists are authorised server-side per module (and by ACLs); unknown keys return 403/404.
    const allowed = visibleNav(is).some((g) => g.items.some((i) => i.view === route.view)) || ['record', 'attendance', 'new-record', 'browse'].indexOf(route.view) > -1
    const onModule = (m: BrowseModuleInfo) => {
        if (m.kind === 'native') { window.open(m.href, '_blank', 'noopener'); return }
        if (m.kind === 'new') { navigate('record', { table: m.table, id: '-1', title: m.title }); return }
        navigate('browse', { id: m.key, title: m.title })
    }
    let body: React.ReactNode
    if (!allowed) body = <Panel><Empty title="Not available for your role" action={<Button label="Go to dashboard" variant="secondary" onClicked={() => go('dashboard')} />} /></Panel>
    else switch (route.view) {
        case 'raise': body = <RaiseRequest onOpen={open} />; break
        case 'my-requests': body = <MyRequests onOpen={open} onRaise={() => go('raise')} />; break
        case 'browse':
            body = route.id ? <Browse moduleKey={route.id} onOpen={open} onNew={(table) => navigate('record', { table, id: '-1', title: 'New record' })} /> : <Empty title="List not specified" />
            break
        case 'record':
            body = !route.table || !route.id ? <Empty title="Record not specified" />
                : route.id !== '-1' && TYPE_LABELS[route.table] ? <RequestDetail table={route.table} id={route.id} onBack={() => window.history.back()} />
                    : <RecordView table={route.table} id={route.id} onBack={() => window.history.back()} />
            break
        case 'queue': body = <Queue onOpen={open} />; break
        case 'hostel': body = <Hostel onOpen={open} />; break
        case 'maintenance': body = <Maintenance onOpen={open} onRaise={() => go('raise')} />; break
        case 'classes': body = <Classes onTakeAttendance={(id) => navigate('attendance', { id, title: 'Attendance' })} />; break
        case 'attendance': body = route.id ? <Attendance sessionId={route.id} onBack={() => go('classes')} /> : <Empty title="Session not specified" />; break
        case 'registrations': body = <Registrations onOpen={open} />; break
        case 'insights': body = <Insights />; break
        case 'admin': body = <Admin onOpen={open} />; break
        default: body = <Dashboard go={go} />
    }
    return <Shell current={route.view} currentId={route.id} onNavigate={(v) => go(v)} onModule={onModule}>{body}</Shell>
}
