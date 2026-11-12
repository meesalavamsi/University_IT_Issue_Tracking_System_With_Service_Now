import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../services/api'

export type Persona = 'student' | 'faculty' | 'hod' | 'warden' | 'technician' | 'it_manager' | 'maintenance' | 'lab_admin' | 'registrar' | 'faculty_admin' | 'leadership' | 'admin'

export interface BrowseModuleInfo { key: string; group: string; title: string; kind: 'list' | 'new' | 'native'; table: string; href: string }

interface SessionState {
    loading: boolean
    error: string
    me: any
    personas: Persona[]
    modules: BrowseModuleInfo[]
    is: (...p: Persona[]) => boolean
    reload: () => void
}

const SessionContext = createContext<SessionState>({ loading: true, error: '', me: null, personas: [], modules: [], is: () => false, reload: () => undefined })

/** Loads the signed-in user's profile, Campus360 personas (derived server-side) and the records catalog for their roles. */
export function SessionProvider({ children }: { children: React.ReactNode }) {
    const [me, setMe] = useState<any>(null)
    const [modules, setModules] = useState<BrowseModuleInfo[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const reload = useCallback(() => {
        setLoading(true)
        api.me()
            .then((m) => { setMe(m); setError('') })
            .catch((e) => setError(e.message || 'Could not load your Campus360 profile.'))
            .finally(() => setLoading(false))
        // The records menu is optional: if it fails, the rest of the portal still works.
        api.browseCatalog().then((list) => setModules(list || [])).catch(() => setModules([]))
    }, [])

    useEffect(reload, [reload])

    const personas: Persona[] = (me && me.personas) || []
    const is = (...p: Persona[]) => p.some((x) => personas.indexOf(x) > -1)
    return <SessionContext.Provider value={{ loading, error, me, personas, modules, is, reload }}>{children}</SessionContext.Provider>
}

export const useSession = () => useContext(SessionContext)
