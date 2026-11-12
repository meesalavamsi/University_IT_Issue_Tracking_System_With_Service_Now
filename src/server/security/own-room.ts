import { gs, GlideRecord } from '@servicenow/glide'

/**
 * Rooms of the CURRENT user's active hostel allocation(s). Shared by the hostel_room read ACL
 * (acl-hostel-room-read-own) and the hostel_room before-query rule, so both use the same definition.
 * Reads room_alloc server-side (no query rule exists on room_alloc, so there is no recursion).
 */
export function ownActiveRoomIds(): string[] {
    const userId = gs.getUserID()
    if (!userId) return []
    const a = new GlideRecord('x_774308_campus360_room_alloc')
    a.addQuery('status', 'active')
    a.addQuery('student.user', userId)
    a.setLimit(10)
    a.query()
    const ids: string[] = []
    while (a.next()) {
        const room = String(a.getValue('hostel_room') || '')
        if (room && ids.indexOf(room) < 0) ids.push(room)
    }
    return ids
}

/** ACL script: a student may read the room of their own active allocation (even when the room is full). */
export function canStudentReadOwnRoom(current: any): boolean {
    const id = current && current.getUniqueValue ? String(current.getUniqueValue() || '') : ''
    return id !== '' && ownActiveRoomIds().indexOf(id) > -1
}
