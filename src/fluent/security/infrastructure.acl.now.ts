import { Acl } from '@servicenow/sdk/core'
import {
    roleAdmin,
    roleFaculty,
    roleHod,
    roleLabAdmin,
    roleLeadership,
    roleMaintenance,
    roleTechnician,
    roleUser,
    roleWarden,
} from '../roles/roles.now'

// ACLs — laboratories & infrastructure (ROLE_PERMISSION_MATRIX.md §3–4, RL-13).

// ---- Laboratory ----
Acl({ $id: Now.ID['acl-laboratory-read'], type: 'record', table: 'x_774308_campus360_laboratory', operation: 'read', roles: [roleUser], adminOverrides: true })
Acl({ $id: Now.ID['acl-laboratory-create'], type: 'record', table: 'x_774308_campus360_laboratory', operation: 'create', roles: [roleLabAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-laboratory-write'], type: 'record', table: 'x_774308_campus360_laboratory', operation: 'write', roles: [roleLabAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-laboratory-write-hod'], type: 'record', table: 'x_774308_campus360_laboratory', operation: 'write', roles: [roleHod], condition: 'department.hod.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true })
Acl({ $id: Now.ID['acl-laboratory-delete'], type: 'record', table: 'x_774308_campus360_laboratory', operation: 'delete', roles: [roleAdmin], adminOverrides: true })

// ---- Maintenance Request ----
Acl({ $id: Now.ID['acl-maint-req-read'], type: 'record', table: 'x_774308_campus360_maint_req', operation: 'read', roles: [roleMaintenance, roleLabAdmin, roleTechnician, roleLeadership], adminOverrides: true })
Acl({ $id: Now.ID['acl-maint-req-read-caller'], type: 'record', table: 'x_774308_campus360_maint_req', operation: 'read', roles: [roleUser], condition: 'callerDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORopened_byDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true })
Acl({ $id: Now.ID['acl-maint-req-read-warden'], type: 'record', table: 'x_774308_campus360_maint_req', operation: 'read', roles: [roleWarden], condition: 'hostel.wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORhostel.assistant_wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true })
Acl({ $id: Now.ID['acl-maint-req-create'], type: 'record', table: 'x_774308_campus360_maint_req', operation: 'create', roles: [roleFaculty, roleTechnician, roleWarden, roleMaintenance, roleLabAdmin], adminOverrides: true, description: 'Staff create work orders; students report via IT issues or hostel complaints.' })
Acl({ $id: Now.ID['acl-maint-req-write'], type: 'record', table: 'x_774308_campus360_maint_req', operation: 'write', roles: [roleLabAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-maint-req-write-group'], type: 'record', table: 'x_774308_campus360_maint_req', operation: 'write', roles: [roleMaintenance], condition: 'assignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744^EQ', adminOverrides: true, description: 'RL-13: maintenance staff update work orders assigned to their groups.' })
Acl({ $id: Now.ID['acl-maint-req-delete'], type: 'record', table: 'x_774308_campus360_maint_req', operation: 'delete', roles: [roleAdmin], adminOverrides: true })
// rev 3.1 (GAP-4): fields a requester legitimately sets when CREATING a work order. Without a field create
// ACL, a field falls back to the record WRITE ACL (lab admin / maintenance group only), so requests raised
// by faculty, technicians and wardens stored only defaults. Same roles as acl-maint-req-create; create only,
// so requesters still cannot edit the work order afterwards (no record write is granted).
const MAINT_REQUESTERS = [roleFaculty, roleTechnician, roleWarden, roleMaintenance, roleLabAdmin]
Acl({ $id: Now.ID['acl-maint-req-caller-create'], type: 'record', table: 'x_774308_campus360_maint_req', field: 'caller', operation: 'create', roles: MAINT_REQUESTERS, adminOverrides: true })
Acl({ $id: Now.ID['acl-maint-req-sd-create'], type: 'record', table: 'x_774308_campus360_maint_req', field: 'short_description', operation: 'create', roles: MAINT_REQUESTERS, adminOverrides: true })
Acl({ $id: Now.ID['acl-maint-req-desc-create'], type: 'record', table: 'x_774308_campus360_maint_req', field: 'description', operation: 'create', roles: MAINT_REQUESTERS, adminOverrides: true })
Acl({ $id: Now.ID['acl-maint-req-type-create'], type: 'record', table: 'x_774308_campus360_maint_req', field: 'maintenance_type', operation: 'create', roles: MAINT_REQUESTERS, adminOverrides: true })
Acl({ $id: Now.ID['acl-maint-req-reqtype-create'], type: 'record', table: 'x_774308_campus360_maint_req', field: 'request_type', operation: 'create', roles: MAINT_REQUESTERS, adminOverrides: true })
Acl({ $id: Now.ID['acl-maint-req-location-create'], type: 'record', table: 'x_774308_campus360_maint_req', field: 'location', operation: 'create', roles: MAINT_REQUESTERS, adminOverrides: true })
Acl({ $id: Now.ID['acl-maint-req-lab-create'], type: 'record', table: 'x_774308_campus360_maint_req', field: 'laboratory', operation: 'create', roles: MAINT_REQUESTERS, adminOverrides: true })
Acl({ $id: Now.ID['acl-maint-req-hostel-create'], type: 'record', table: 'x_774308_campus360_maint_req', field: 'hostel', operation: 'create', roles: MAINT_REQUESTERS, adminOverrides: true })
Acl({ $id: Now.ID['acl-maint-req-room-create'], type: 'record', table: 'x_774308_campus360_maint_req', field: 'hostel_room', operation: 'create', roles: MAINT_REQUESTERS, adminOverrides: true })
Acl({ $id: Now.ID['acl-maint-req-urgency-create'], type: 'record', table: 'x_774308_campus360_maint_req', field: 'urgency', operation: 'create', roles: MAINT_REQUESTERS, adminOverrides: true })

// ---- Preventive Maintenance Plan ----
Acl({ $id: Now.ID['acl-pm-schedule-read'], type: 'record', table: 'x_774308_campus360_pm_schedule', operation: 'read', roles: [roleMaintenance, roleLabAdmin, roleLeadership], adminOverrides: true })
Acl({ $id: Now.ID['acl-pm-schedule-create'], type: 'record', table: 'x_774308_campus360_pm_schedule', operation: 'create', roles: [roleLabAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-pm-schedule-write'], type: 'record', table: 'x_774308_campus360_pm_schedule', operation: 'write', roles: [roleLabAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-pm-schedule-delete'], type: 'record', table: 'x_774308_campus360_pm_schedule', operation: 'delete', roles: [roleAdmin], adminOverrides: true })
