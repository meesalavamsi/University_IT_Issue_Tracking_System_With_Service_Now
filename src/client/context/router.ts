import { useCallback, useEffect, useState } from 'react'

// URLSearchParams routing (SDK guidance): every view has its own URL; Polaris iframe aware.
export interface Route { view: string; id: string | null; table: string | null }

export function readRoute(): Route {
    const p = new URLSearchParams(window.location.search)
    return { view: p.get('view') || 'dashboard', id: p.get('id'), table: p.get('table') }
}

export function useRouter() {
    const [route, setRoute] = useState<Route>(readRoute)
    useEffect(() => {
        const onPop = () => setRoute(readRoute())
        window.addEventListener('popstate', onPop)
        return () => window.removeEventListener('popstate', onPop)
    }, [])

    const navigate = useCallback((view: string, opts: { id?: string; table?: string; title?: string } = {}) => {
        const params = new URLSearchParams({ view })
        if (opts.id) params.set('id', opts.id)
        if (opts.table) params.set('table', opts.table)
        const relativePath = `${window.location.pathname}?${params}`
        const title = `Campus360 · ${opts.title || view.charAt(0).toUpperCase() + view.slice(1).replace(/-/g, ' ')}`
        if (window.self !== window.top && (window as any).CustomEvent && (window as any).CustomEvent.fireTop) {
            ;(window as any).CustomEvent.fireTop('magellanNavigator.permalink.set', { relativePath, title })
        }
        window.history.pushState({ view }, '', relativePath)
        document.title = title
        setRoute({ view, id: opts.id || null, table: opts.table || null })
        window.scrollTo(0, 0)
    }, [])

    return { route, navigate }
}
