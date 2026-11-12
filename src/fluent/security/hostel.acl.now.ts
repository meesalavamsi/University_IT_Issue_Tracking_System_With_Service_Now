import { Acl } from '@servicenow/sdk/core'
import {
    roleAdmin,
    roleLeadership,
    roleMaintenance,
    roleRegistrar,
    roleStudent,
    roleTechnician,
    roleUser,
    roleWarden,
} from '../roles/roles.now'
import { canStudentReadOwnRoom } from '../../server/security/own-room'

// ACLs — hostel management (ROLE_PERMISSION_MATRIX.md §3–4, RL-11, RL-12).
// Wardens act only on hostels where they are warden or assistant warden.

// ---- Hostel ----
Acl({ $id: Now.ID['acl-hostel-read'], type: 'record', table: 'x_774308_campus360_hostel', operation: 'read', roles: [roleUser], adminOverrides: true })
Acl({ $id: Now.ID['acl-hostel-create'], type: 'record', table: 'x_774308_campus360_hostel', operation: 'create', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-hostel-write'], type: 'record', table: 'x_774308_campus360_hostel', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-hostel-write-warden'], type: 'record', table: 'x_774308_campus360_hostel', operation: 'write', roles: [roleWarden], condition: 'wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORassistant_wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true })
Acl({ $id: Now.ID['acl-hostel-warden-field-write'], type: 'record', table: 'x_774308_campus360_hostel', field: 'warden', operation: 'write', roles: [roleAdmin], adminOverrides: true, description: 'Only administrators can reassign the warden.' })
Acl({ $id: Now.ID['acl-hostel-delete'], type: 'record', table: 'x_774308_campus360_hostel', operation: 'delete', roles: [roleAdmin], adminOverrides: true })

// ---- Hostel Room ----
Acl({ $id: Now.ID['acl-hostel-room-read'], type: 'record', table: 'x_774308_campus360_hostel_room', operation: 'read', roles: [roleTechnician, roleMaintenance, roleRegistrar, roleLeadership], adminOverrides: true })
Acl({ $id: Now.ID['acl-hostel-room-read-warden'], type: 'record', table: 'x_774308_campus360_hostel_room', operation: 'read', roles: [roleWarden], condition: 'hostel.wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORhostel.assistant_wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true })
Acl({ $id: Now.ID['acl-hostel-room-read-student'], type: 'record', table: 'x_774308_campus360_hostel_room', operation: 'read', roles: [roleStudent], condition: 'status=available^EQ', adminOverrides: true, description: 'Students may browse available rooms when requesting an allocation.' })
Acl({ $id: Now.ID['acl-hostel-room-read-own'], type: 'record', table: 'x_774308_campus360_hostel_room', operation: 'read', roles: [roleStudent], script: canStudentReadOwnRoom, adminOverrides: true, description: 'Revision 3: a student always reads the room of their OWN active allocation, even when it is full (no other full rooms).' })
Acl({ $id: Now.ID['acl-hostel-room-create'], type: 'record', table: 'x_774308_campus360_hostel_room', operation: 'create', roles: [roleWarden], condition: 'hostel.wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORhostel.assistant_wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true })
Acl({ $id: Now.ID['acl-hostel-room-create-admin'], type: 'record', table: 'x_774308_campus360_hostel_room', operation: 'create', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-hostel-room-write'], type: 'record', table: 'x_774308_campus360_hostel_room', operation: 'write', roles: [roleWarden], condition: 'hostel.wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORhostel.assistant_wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true })
Acl({ $id: Now.ID['acl-hostel-room-write-admin'], type: 'record', table: 'x_774308_campus360_hostel_room', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-hostel-room-delete'], type: 'record', table: 'x_774308_campus360_hostel_room', operation: 'delete', roles: [roleAdmin], adminOverrides: true })

// ---- Room Allocation ----
Acl({ $id: Now.ID['acl-room-alloc-read'], type: 'record', table: 'x_774308_campus360_room_alloc', operation: 'read', roles: [roleRegistrar, roleLeadership], adminOverrides: true })
Acl({ $id: Now.ID['acl-room-alloc-read-warden'], type: 'record', table: 'x_774308_campus360_room_alloc', operation: 'read', roles: [roleWarden], condition: 'hostel_room.hostel.wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORhostel_room.hostel.assistant_wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true })
Acl({ $id: Now.ID['acl-room-alloc-read-student'], type: 'record', table: 'x_774308_campus360_room_alloc', operation: 'read', roles: [roleStudent], condition: 'student.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true })
Acl({ $id: Now.ID['acl-room-alloc-create-student'], type: 'record', table: 'x_774308_campus360_room_alloc', operation: 'create', roles: [roleStudent], condition: 'student.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^status=requested^EQ', adminOverrides: true, description: 'Students may only REQUEST an allocation for themselves.' })
Acl({ $id: Now.ID['acl-room-alloc-create-warden'], type: 'record', table: 'x_774308_campus360_room_alloc', operation: 'create', roles: [roleWarden], condition: 'hostel_room.hostel.wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORhostel_room.hostel.assistant_wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true })
Acl({ $id: Now.ID['acl-room-alloc-create-admin'], type: 'record', table: 'x_774308_campus360_room_alloc', operation: 'create', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-room-alloc-write-warden'], type: 'record', table: 'x_774308_campus360_room_alloc', operation: 'write', roles: [roleWarden], condition: 'hostel_room.hostel.wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORhostel_room.hostel.assistant_wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true })
Acl({ $id: Now.ID['acl-room-alloc-write-admin'], type: 'record', table: 'x_774308_campus360_room_alloc', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-room-alloc-delete'], type: 'record', table: 'x_774308_campus360_room_alloc', operation: 'delete', roles: [roleAdmin], adminOverrides: true })

// ---- Hostel Complaint ----
// Deny-unless: confidential complaints are visible only to the caller and the hostel's wardens (admin override).
Acl({ $id: Now.ID['acl-hostel-cmpl-read-confidential-deny'], type: 'record', table: 'x_774308_campus360_hostel_cmpl', operation: 'read', decisionType: 'deny', condition: 'is_confidential=false^ORcallerDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORopened_byDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORhostel.wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORhostel.assistant_wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true, description: 'RL-12: confidential complaints are restricted to the caller, the hostel wardens and administrators.' })
Acl({ $id: Now.ID['acl-hostel-cmpl-read-caller'], type: 'record', table: 'x_774308_campus360_hostel_cmpl', operation: 'read', roles: [roleUser], condition: 'callerDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORopened_byDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true })
Acl({ $id: Now.ID['acl-hostel-cmpl-read-warden'], type: 'record', table: 'x_774308_campus360_hostel_cmpl', operation: 'read', roles: [roleWarden], condition: 'hostel.wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORhostel.assistant_wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true })
Acl({ $id: Now.ID['acl-hostel-cmpl-read-leadership'], type: 'record', table: 'x_774308_campus360_hostel_cmpl', operation: 'read', roles: [roleLeadership], adminOverrides: true })
Acl({ $id: Now.ID['acl-hostel-cmpl-create'], type: 'record', table: 'x_774308_campus360_hostel_cmpl', operation: 'create', roles: [roleStudent, roleWarden], adminOverrides: true, description: 'Residency of the caller is validated server-side (Part 8 business rule).' })
Acl({ $id: Now.ID['acl-hostel-cmpl-write-warden'], type: 'record', table: 'x_774308_campus360_hostel_cmpl', operation: 'write', roles: [roleWarden], condition: 'hostel.wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORhostel.assistant_wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true })
Acl({ $id: Now.ID['acl-hostel-cmpl-write-admin'], type: 'record', table: 'x_774308_campus360_hostel_cmpl', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-hostel-cmpl-write-caller'], type: 'record', table: 'x_774308_campus360_hostel_cmpl', operation: 'write', roles: [roleUser], condition: 'callerDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORopened_byDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true, description: 'Callers may add comments; workflow fields are protected below.' })
// Revision 3 (native-form security): wardens change workflow fields ONLY on complaints of hostels where
// they are warden / assistant warden. Without the condition, a warden who RAISED a complaint in another
// hostel passed the caller record ACL + the role-only field ACL and could resolve it. Campus360 admins keep
// unconditional access via the *-admin ACLs. Backed by the before-update guard
// "C360 Hostel Complaint - workflow changes need hostel authority".
Acl({ $id: Now.ID['acl-hostel-cmpl-state-write'], type: 'record', table: 'x_774308_campus360_hostel_cmpl', field: 'state', operation: 'write', roles: [roleWarden], condition: 'hostel.wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORhostel.assistant_wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true, description: 'Wardens of the complaint\'s hostel only.' })
Acl({ $id: Now.ID['acl-hostel-cmpl-group-write'], type: 'record', table: 'x_774308_campus360_hostel_cmpl', field: 'assignment_group', operation: 'write', roles: [roleWarden], condition: 'hostel.wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORhostel.assistant_wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true, description: 'Wardens of the complaint\'s hostel only.' })
Acl({ $id: Now.ID['acl-hostel-cmpl-assignee-write'], type: 'record', table: 'x_774308_campus360_hostel_cmpl', field: 'assigned_to', operation: 'write', roles: [roleWarden], condition: 'hostel.wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORhostel.assistant_wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true, description: 'Wardens of the complaint\'s hostel only.' })
Acl({ $id: Now.ID['acl-hostel-cmpl-priority-write'], type: 'record', table: 'x_774308_campus360_hostel_cmpl', field: 'priority', operation: 'write', roles: [roleWarden], condition: 'hostel.wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORhostel.assistant_wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true, description: 'Wardens of the complaint\'s hostel only.' })
Acl({ $id: Now.ID['acl-hostel-cmpl-closenotes-write'], type: 'record', table: 'x_774308_campus360_hostel_cmpl', field: 'close_notes', operation: 'write', roles: [roleWarden], condition: 'hostel.wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORhostel.assistant_wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true, description: 'Wardens of the complaint\'s hostel only.' })
Acl({ $id: Now.ID['acl-hostel-cmpl-worknotes-write'], type: 'record', table: 'x_774308_campus360_hostel_cmpl', field: 'work_notes', operation: 'write', roles: [roleWarden], condition: 'hostel.wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORhostel.assistant_wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true, description: 'Wardens of the complaint\'s hostel only.' })
Acl({ $id: Now.ID['acl-hostel-cmpl-worknotes-read'], type: 'record', table: 'x_774308_campus360_hostel_cmpl', field: 'work_notes', operation: 'read', roles: [roleWarden], condition: 'hostel.wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORhostel.assistant_wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true, description: 'Internal notes: wardens of the complaint\'s hostel only (not a warden who merely raised it).' })
Acl({ $id: Now.ID['acl-hostel-cmpl-state-write-admin'], type: 'record', table: 'x_774308_campus360_hostel_cmpl', field: 'state', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-hostel-cmpl-group-write-admin'], type: 'record', table: 'x_774308_campus360_hostel_cmpl', field: 'assignment_group', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-hostel-cmpl-assignee-write-admin'], type: 'record', table: 'x_774308_campus360_hostel_cmpl', field: 'assigned_to', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-hostel-cmpl-priority-write-admin'], type: 'record', table: 'x_774308_campus360_hostel_cmpl', field: 'priority', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-hostel-cmpl-closenotes-write-admin'], type: 'record', table: 'x_774308_campus360_hostel_cmpl', field: 'close_notes', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-hostel-cmpl-worknotes-write-admin'], type: 'record', table: 'x_774308_campus360_hostel_cmpl', field: 'work_notes', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-hostel-cmpl-worknotes-read-admin'], type: 'record', table: 'x_774308_campus360_hostel_cmpl', field: 'work_notes', operation: 'read', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-hostel-cmpl-delete'], type: 'record', table: 'x_774308_campus360_hostel_cmpl', operation: 'delete', roles: [roleAdmin], adminOverrides: true })
