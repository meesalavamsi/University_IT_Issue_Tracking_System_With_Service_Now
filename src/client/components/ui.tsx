import React, { useCallback, useEffect, useState } from 'react'
import { Loader } from '@servicenow/react-components/Loader'
import { Alert } from '@servicenow/react-components/Alert'
import { Button } from '@servicenow/react-components/Button'
import { HighlightedValue } from '@servicenow/react-components/HighlightedValue'
import { Icon } from './icons'

/** Loads async data with loading / error / reload handling. */
export function useAsync<T>(load: () => Promise<T>, deps: any[] = []) {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const reload = useCallback(() => {
        setLoading(true)
        setError('')
        load().then(setData).catch((e) => setError(e.message || 'Something went wrong.')).finally(() => setLoading(false))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)
    useEffect(reload, [reload])
    return { data, loading, error, reload }
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
    return (
        <header className="c360-page-header">
            <div className="c360-page-header__titles">
                <h1>{title}</h1>
                {subtitle && <p className="c360-muted">{subtitle}</p>}
            </div>
            {actions && <div className="c360-row">{actions}</div>}
        </header>
    )
}

export function Panel({ title, actions, children, flush }: { title?: string; actions?: React.ReactNode; children: React.ReactNode; flush?: boolean }) {
    return (
        <section className="c360-panel">
            {title && (
                <div className="c360-panel__head">
                    <h2>{title}</h2>
                    {actions}
                </div>
            )}
            <div className={flush ? 'c360-panel__body c360-panel__body--flush' : 'c360-panel__body'}>{children}</div>
        </section>
    )
}

const reducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Counts up to a number once (skipped for non-numbers and when the user prefers reduced motion). */
export function CountUp({ value }: { value: React.ReactNode }) {
    const target = typeof value === 'number' ? value : null
    const [shown, setShown] = useState<number>(target !== null && !reducedMotion() ? 0 : target || 0)
    useEffect(() => {
        if (target === null || reducedMotion()) { setShown(target || 0); return }
        let frame = 0
        const start = performance.now()
        const tick = (t: number) => {
            const p = Math.min((t - start) / 700, 1)
            setShown(Math.round(target * (1 - Math.pow(1 - p, 3))))
            if (p < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(frame)
    }, [target])
    return <>{target === null ? value : shown}</>
}

const TONE_ICON: { [tone: string]: string } = { accent: 'sparkle', warning: 'clock', critical: 'bolt', positive: 'check' }

export function Stat({ label, value, hint, tone, icon }: { label: string; value: React.ReactNode; hint?: string; tone?: 'accent' | 'warning' | 'critical' | 'positive'; icon?: string }) {
    return (
        <div className={'c360-stat c360-stat--' + (tone || 'neutral')}>
            <div className="c360-stat__top">
                <span className="c360-stat__label">{label}</span>
                <span className="c360-stat__icon"><Icon name={icon || TONE_ICON[tone || ''] || 'chart'} size={18} /></span>
            </div>
            <span className="c360-stat__value"><CountUp value={value} /></span>
            {hint && <span className="c360-stat__hint">{hint}</span>}
        </div>
    )
}

const STATE_COLORS: { [label: string]: 'info' | 'warning' | 'positive' | 'critical' | 'low' | 'moderate' } = {
    New: 'info', Submitted: 'info', Open: 'info', Scheduled: 'info', Draft: 'low',
    'In Progress': 'moderate', 'Work in Progress': 'moderate', 'Registrar Review': 'moderate', 'Awaiting Approval': 'warning', 'Pending HOD Approval': 'warning',
    'On Hold': 'warning', Pending: 'warning', Resolved: 'positive', Closed: 'low', Completed: 'positive', Approved: 'positive', Enrolled: 'positive',
    'Closed Complete': 'positive', Cancelled: 'low', Rejected: 'critical', 'Closed Incomplete': 'critical',
}

export function StatusBadge({ label }: { label: string }) {
    if (!label) return null
    return <HighlightedValue label={label} color={STATE_COLORS[label] || 'low'} variant="secondary" showIcon />
}

export function PriorityBadge({ label }: { label: string }) {
    if (!label) return null
    const color = label.indexOf('1') === 0 ? 'critical' : label.indexOf('2') === 0 ? 'high' : label.indexOf('3') === 0 ? 'moderate' : 'low'
    return <HighlightedValue label={label} color={color as any} variant="tertiary" />
}

export function Loading({ label = 'Loading…' }: { label?: string }) {
    return <div className="c360-state"><Loader label={label} size="md" /></div>
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
    return (
        <div className="c360-stack">
            <Alert status="critical" header="Could not load this view" content={message} />
            {onRetry && <div><Button label="Try again" variant="secondary" onClicked={onRetry} /></div>}
        </div>
    )
}

export function Empty({ title, text, action, icon }: { title: string; text?: string; action?: React.ReactNode; icon?: string }) {
    return (
        <div className="c360-state">
            <div className="c360-state__icon" aria-hidden="true"><Icon name={icon || 'sparkle'} size={26} /></div>
            <h3>{title}</h3>
            {text && <p className="c360-muted">{text}</p>}
            {action}
        </div>
    )
}

export interface Column<T> { key: string; label: string; render: (row: T) => React.ReactNode; className?: string }

/** Presentational table for curated API results (raw table browsing uses NowRecordListConnected). */
export function DataTable<T>({ columns, rows, onRowClick, rowKey }: { columns: Column<T>[]; rows: T[]; onRowClick?: (row: T) => void; rowKey: (row: T) => string }) {
    return (
        <div className="c360-table-wrap">
            <table className="c360-table">
                <thead>
                    <tr>{columns.map((c) => <th key={c.key} scope="col">{c.label}</th>)}</tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr key={rowKey(r)} className={onRowClick ? 'c360-table__row--click' : ''} onClick={onRowClick ? () => onRowClick(r) : undefined} tabIndex={onRowClick ? 0 : undefined}
                            onKeyDown={onRowClick ? (e) => { if (e.key === 'Enter') onRowClick(r) } : undefined}>
                            {columns.map((c) => <td key={c.key} className={c.className}>{c.render(r)}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
