import { Record } from '@servicenow/sdk/core'
import {
    roleFacultyAdmin,
    roleItManager,
    roleMaintenance,
    roleRegistrar,
    roleTechnician,
    roleWarden,
} from '../roles/roles.now'

// Campus360 assignment groups (ROLE_PERMISSION_MATRIX.md Â§2). Configuration data, installed always.
// Roles are granted through group membership (sys_group_has_role), never directly to users.

export const grpItServiceDesk = Record({
    $id: Now.ID['grp-it-service-desk'],
    table: 'sys_user_group',
    data: {
        name: 'C360 IT Service Desk',
        description: 'Campus360 default IT queue; software issues.',
        active: true,
    },
})

export const grpDesktopSupport = Record({
    $id: Now.ID['grp-desktop-hardware-support'],
    table: 'sys_user_group',
    data: {
        name: 'C360 Desktop & Hardware Support',
        description: 'Campus360 hardware, computer and laptop issues.',
        active: true,
    },
})

export const grpNetworkWifi = Record({
    $id: Now.ID['grp-network-wifi'],
    table: 'sys_user_group',
    data: {
        name: 'C360 Network & Wi-Fi Team',
        description: 'Campus360 wired network, campus Wi-Fi and hostel Wi-Fi issues.',
        active: true,
    },
})

export const grpLabSupport = Record({
    $id: Now.ID['grp-lab-support'],
    table: 'sys_user_group',
    data: {
        name: 'C360 Lab Support',
        description: 'Campus360 laboratory equipment issues.',
        active: true,
    },
})

export const grpFacilities = Record({
    $id: Now.ID['grp-facilities-electrical'],
    table: 'sys_user_group',
    data: {
        name: 'C360 Facilities & Electrical',
        description: 'Campus360 building/electrical issues and maintenance requests.',
        active: true,
    },
})

export const grpHostelAdmin = Record({
    $id: Now.ID['grp-hostel-administration'],
    table: 'sys_user_group',
    data: {
        name: 'C360 Hostel Administration',
        description: 'Campus360 hostel wardens; hostel complaints and room allocations.',
        active: true,
    },
})

export const grpRegistrar = Record({
    $id: Now.ID['grp-registrar-office'],
    table: 'sys_user_group',
    data: {
        name: 'C360 Registrar Office',
        description: 'Campus360 student registrations and academic records.',
        active: true,
    },
})

export const grpOnboarding = Record({
    $id: Now.ID['grp-faculty-onboarding'],
    table: 'sys_user_group',
    data: {
        name: 'C360 Faculty Onboarding Team',
        description: 'Campus360 faculty onboarding cases and checklist tasks.',
        active: true,
    },
})

export const grpItManagement = Record({
    $id: Now.ID['grp-it-management'],
    table: 'sys_user_group',
    data: {
        name: 'C360 IT Management',
        description: 'Campus360 IT approvals and escalations.',
        active: true,
    },
})

// ---- Group role grants (sys_group_has_role) ----

Record({
    $id: Now.ID['grp-role-it-service-desk-technician'],
    table: 'sys_group_has_role',
    data: { group: grpItServiceDesk, role: roleTechnician, inherits: true },
})

Record({
    $id: Now.ID['grp-role-desktop-technician'],
    table: 'sys_group_has_role',
    data: { group: grpDesktopSupport, role: roleTechnician, inherits: true },
})

Record({
    $id: Now.ID['grp-role-desktop-asset'],
    table: 'sys_group_has_role',
    data: { group: grpDesktopSupport, role: Now.ref('sys_user_role', 'bf7dfe64c0a80169002ee4e83aa20d57', { name: 'asset' }), inherits: true },
})

Record({
    $id: Now.ID['grp-role-network-technician'],
    table: 'sys_group_has_role',
    data: { group: grpNetworkWifi, role: roleTechnician, inherits: true },
})

Record({
    $id: Now.ID['grp-role-lab-support-technician'],
    table: 'sys_group_has_role',
    data: { group: grpLabSupport, role: roleTechnician, inherits: true },
})

Record({
    $id: Now.ID['grp-role-lab-support-asset'],
    table: 'sys_group_has_role',
    data: { group: grpLabSupport, role: Now.ref('sys_user_role', 'bf7dfe64c0a80169002ee4e83aa20d57', { name: 'asset' }), inherits: true },
})

Record({
    $id: Now.ID['grp-role-facilities-maintenance'],
    table: 'sys_group_has_role',
    data: { group: grpFacilities, role: roleMaintenance, inherits: true },
})

Record({
    $id: Now.ID['grp-role-hostel-warden'],
    table: 'sys_group_has_role',
    data: { group: grpHostelAdmin, role: roleWarden, inherits: true },
})

Record({
    $id: Now.ID['grp-role-registrar'],
    table: 'sys_group_has_role',
    data: { group: grpRegistrar, role: roleRegistrar, inherits: true },
})

Record({
    $id: Now.ID['grp-role-onboarding-faculty-admin'],
    table: 'sys_group_has_role',
    data: { group: grpOnboarding, role: roleFacultyAdmin, inherits: true },
})

Record({
    $id: Now.ID['grp-role-it-management'],
    table: 'sys_group_has_role',
    data: { group: grpItManagement, role: roleItManager, inherits: true },
})
