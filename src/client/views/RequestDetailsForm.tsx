import React, { useState } from 'react'
import { Button } from '@servicenow/react-components/Button'
import { Input } from '@servicenow/react-components/Input'
import { Textarea } from '@servicenow/react-components/Textarea'
import { Select } from '@servicenow/react-components/Select'
import { Panel } from '../components/ui'
import { display, value } from '../utils/fields'
import type { Choice } from './RaiseRequest'

export interface Draft { [k: string]: any; short_description: string; description: string; urgency: string }

const HOSTEL_TYPES = [
    { id: 'water_supply', label: 'Water / hot water' }, { id: 'electrical', label: 'Electricity' }, { id: 'plumbing', label: 'Plumbing' },
    { id: 'furniture', label: 'Furniture' }, { id: 'cleanliness', label: 'Cleanliness' }, { id: 'pest_control', label: 'Pest control' },
    { id: 'mess_food', label: 'Mess / food' }, { id: 'security', label: 'Security' }, { id: 'roommate', label: 'Roommate' }, { id: 'noise', label: 'Noise' }, { id: 'other', label: 'Other' },
]
const MAINT_TYPES = [
    { id: 'electrical', label: 'Electrical' }, { id: 'plumbing', label: 'Plumbing' }, { id: 'hvac', label: 'HVAC / AC' }, { id: 'carpentry', label: 'Carpentry' },
    { id: 'civil', label: 'Civil' }, { id: 'cleaning', label: 'Cleaning' }, { id: 'it_infra', label: 'IT infrastructure' }, { id: 'equipment_service', label: 'Equipment service' }, { id: 'other', label: 'Other' },
]
const URGENCY = [{ id: '1', label: 'High – work is blocked' }, { id: '2', label: 'Medium – degraded' }, { id: '3', label: 'Low – minor' }]

/** Step 2 of the wizard. Client checks are for convenience; the server re-validates everything. */
export function RequestDetailsForm({ choice, catalog, draft, onChange, onBack, onNext }: { choice: Choice; catalog: any; me: any; draft: Draft; onChange: (d: Draft) => void; onBack: () => void; onNext: () => void }) {
    const [touched, setTouched] = useState(false)
    const set = (k: string, v: any) => onChange({ ...draft, [k]: v })
    const cat = choice.category
    const needsLab = !!cat && ['1', 'true'].indexOf(value(cat.requires_lab)) > -1
    const subs = cat ? (catalog.subcategories || []).filter((s: any) => value(s.category) === choice.id).map((s: any) => ({ id: s.sys_id, label: display(s.name) })) : []
    const labs = (catalog.laboratories || []).map((l: any) => ({ id: l.sys_id, label: display(l.name) }))
    const hostels = (catalog.hostels || []).map((h: any) => ({ id: h.sys_id, label: display(h.name) }))

    const titleOk = draft.short_description.trim().length >= 5
    const typeOk = choice.kind !== 'hostel' || !!draft.complaint_type
    const maintOk = choice.kind !== 'maintenance' || (!!draft.maintenance_type && (!!draft.laboratory || !!draft.hostel))
    const labOk = !needsLab || !!draft.laboratory
    const valid = titleOk && typeOk && maintOk && labOk

    return (
        <Panel title={choice.kind === 'it' ? `Describe the ${choice.title.toLowerCase()} issue` : `Describe the ${choice.title.toLowerCase()}`}>
            <div className="c360-form">
                {choice.kind === 'hostel' && (
                    <Select label="Problem type" required items={HOSTEL_TYPES} selectedItem={draft.complaint_type || ''} onSelectedItemSet={(e: any) => set('complaint_type', e.detail.payload.value)} />
                )}
                {choice.kind === 'maintenance' && (
                    <>
                        <Select label="Maintenance type" required items={MAINT_TYPES} selectedItem={draft.maintenance_type || ''} onSelectedItemSet={(e: any) => set('maintenance_type', e.detail.payload.value)} />
                        <Select label="Laboratory" optional search="contains" items={labs} selectedItem={draft.laboratory || ''} onSelectedItemSet={(e: any) => set('laboratory', e.detail.payload.value)} />
                        <Select label="or Hostel" optional items={hostels} selectedItem={draft.hostel || ''} onSelectedItemSet={(e: any) => set('hostel', e.detail.payload.value)} />
                    </>
                )}
                {choice.kind === 'it' && subs.length > 0 && (
                    <Select label="What exactly?" optional items={subs} selectedItem={draft.subcategory || ''} onSelectedItemSet={(e: any) => set('subcategory', e.detail.payload.value)} />
                )}
                {choice.kind === 'it' && (needsLab || labs.length > 0) && (
                    <Select label="Laboratory" required={needsLab} optional={!needsLab} search="contains" items={labs} selectedItem={draft.laboratory || ''}
                        onSelectedItemSet={(e: any) => set('laboratory', e.detail.payload.value)} />
                )}
                <Input label="Title" required placeholder="e.g. No Wi-Fi in Block B, room 214" value={draft.short_description} maxlength={160}
                    invalid={touched && !titleOk} messages={touched && !titleOk ? [{ status: 'critical', content: 'At least 5 characters', icon: 'circle-exclamation-outline' }] : []}
                    onInput={(e: any) => set('short_description', e.detail.payload.fieldValue)} />
                <Textarea label="Details" optional placeholder="What happened, since when, and anything you already tried." rows={5} value={draft.description}
                    onInput={(e: any) => set('description', e.detail.payload.fieldValue)} />
                {choice.kind === 'it' && (
                    <>
                        <Input label="Room / spot" optional placeholder="e.g. Library 2nd floor, desk 14" value={draft.room_detail || ''} onInput={(e: any) => set('room_detail', e.detail.payload.fieldValue)} />
                        <Select label="How urgent is it?" items={URGENCY} selectedItem={draft.urgency} onSelectedItemSet={(e: any) => set('urgency', e.detail.payload.value)} />
                    </>
                )}
                <div className="c360-form__actions">
                    <Button label="Back" variant="secondary" onClicked={onBack} />
                    <Button label="Review" variant="primary" onClicked={() => { setTouched(true); if (valid) onNext() }} />
                </div>
            </div>
        </Panel>
    )
}
