import React from 'react'
import { RecordProvider } from '@servicenow/react-components/RecordContext'
import { FormActionBar } from '@servicenow/react-components/FormActionBar'
import { FormColumnLayout } from '@servicenow/react-components/FormColumnLayout'
import { Panel } from '../components/ui'
import { Icon } from '../components/icons'

const label = (table: string) => table.replace('x_774308_campus360_', '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

/**
 * Any Campus360 record (students, hostels, courses…) in the platform form, inside the portal.
 * RecordProvider applies the record's ACLs, UI policies, business rules and related lists natively.
 */
export default function RecordView({ table, id, onBack }: { table: string; id: string; onBack: () => void }) {
    const isNew = id === '-1'
    return (
        <div className="c360-stack">
            <header className="c360-browse-head">
                <div className="c360-browse-head__icon"><Icon name={isNew ? 'plus' : 'list'} size={24} /></div>
                <div className="c360-browse-head__titles">
                    <span className="c360-browse-head__group">{label(table)}</span>
                    <h1>{isNew ? `New ${label(table).toLowerCase()}` : 'Record details'}</h1>
                </div>
                <div className="c360-browse-head__actions">
                    <button type="button" className="c360-btn c360-btn--soft" onClick={onBack}><Icon name="arrow" size={16} className="c360-icon--flip" /> Back</button>
                    {!isNew && <a className="c360-btn c360-btn--soft" href={`/${table}.do?sys_id=${id}`} target="_blank" rel="noopener"><Icon name="external" size={16} /> Open classic form</a>}
                </div>
            </header>
            <Panel>
                <RecordProvider table={table} sysId={id} isReadOnly={false}>
                    <FormActionBar />
                    <FormColumnLayout />
                </RecordProvider>
            </Panel>
        </div>
    )
}
