import { Record } from '@servicenow/sdk/core'
import { grpDesktopSupport, grpFacilities, grpItServiceDesk, grpLabSupport, grpNetworkWifi } from '../../groups/groups.now'

// IT issue categories & subcategories — CONFIGURATION data (always installed, not demo).
// Drives routing (assignment_group), form rules (requires_*) and portal tiles (DATABASE_SCHEMA.md §4.1).

export const catHardware = Record({
    $id: Now.ID['icat-hardware'],
    table: 'x_774308_campus360_issue_cat',
    data: { code: 'hardware', name: 'Hardware', description: 'Printers, projectors, peripherals and other campus hardware.', assignment_group: grpDesktopSupport, default_impact: 3, default_urgency: 3, requires_asset: false, requires_lab: false, requires_hostel: false, portal_visible: true, icon: 'print', order: 10, active: true },
})

export const catSoftware = Record({
    $id: Now.ID['icat-software'],
    table: 'x_774308_campus360_issue_cat',
    data: { code: 'software', name: 'Software', description: 'Operating systems, licensed software, LMS and email access.', assignment_group: grpItServiceDesk, default_impact: 3, default_urgency: 3, requires_asset: false, requires_lab: false, requires_hostel: false, portal_visible: true, icon: 'window-maximize', order: 20, active: true },
})

export const catNetwork = Record({
    $id: Now.ID['icat-network'],
    table: 'x_774308_campus360_issue_cat',
    data: { code: 'network', name: 'Network (Wired)', description: 'LAN ports, wired connectivity and VPN.', assignment_group: grpNetworkWifi, default_impact: 2, default_urgency: 3, requires_asset: false, requires_lab: false, requires_hostel: false, portal_visible: true, icon: 'sitemap', order: 30, active: true },
})

export const catCampusWifi = Record({
    $id: Now.ID['icat-campus-wifi'],
    table: 'x_774308_campus360_issue_cat',
    data: { code: 'campus_wifi', name: 'Campus Wi-Fi', description: 'Wi-Fi coverage, speed and authentication in academic buildings.', assignment_group: grpNetworkWifi, default_impact: 2, default_urgency: 3, requires_asset: false, requires_lab: false, requires_hostel: false, portal_visible: true, icon: 'wifi', order: 40, active: true },
})

export const catHostelWifi = Record({
    $id: Now.ID['icat-hostel-wifi'],
    table: 'x_774308_campus360_issue_cat',
    data: { code: 'hostel_wifi', name: 'Hostel Wi-Fi', description: 'Wi-Fi problems inside hostels (handled by the network team, not as a hostel complaint).', assignment_group: grpNetworkWifi, default_impact: 3, default_urgency: 2, requires_asset: false, requires_lab: false, requires_hostel: true, portal_visible: true, icon: 'bed', order: 50, active: true },
})

export const catComputerLaptop = Record({
    $id: Now.ID['icat-computer-laptop'],
    table: 'x_774308_campus360_issue_cat',
    data: { code: 'computer_laptop', name: 'Computer & Laptop', description: 'Desktops and laptops issued by the institution.', assignment_group: grpDesktopSupport, default_impact: 3, default_urgency: 3, requires_asset: true, requires_lab: false, requires_hostel: false, portal_visible: true, icon: 'laptop', order: 60, active: true },
})

export const catLabEquipment = Record({
    $id: Now.ID['icat-lab-equipment'],
    table: 'x_774308_campus360_issue_cat',
    data: { code: 'lab_equipment', name: 'Laboratory Equipment', description: 'Equipment and workstations in teaching and research labs.', assignment_group: grpLabSupport, default_impact: 2, default_urgency: 2, requires_asset: false, requires_lab: true, requires_hostel: false, portal_visible: true, icon: 'flask', order: 70, active: true },
})

export const catBuildingElectrical = Record({
    $id: Now.ID['icat-building-electrical'],
    table: 'x_774308_campus360_issue_cat',
    data: { code: 'building_electrical', name: 'Building & Electrical', description: 'Power outages, lighting, sockets, fans and air conditioning.', assignment_group: grpFacilities, default_impact: 2, default_urgency: 2, requires_asset: false, requires_lab: false, requires_hostel: false, portal_visible: true, icon: 'bolt', order: 80, active: true },
})

// ---- Subcategories ----
Record({ $id: Now.ID['isub-hardware-printer'], table: 'x_774308_campus360_issue_sub', data: { category: catHardware, code: 'printer', name: 'Printer / Scanner', active: true } })
Record({ $id: Now.ID['isub-hardware-projector'], table: 'x_774308_campus360_issue_sub', data: { category: catHardware, code: 'projector', name: 'Projector / AV', active: true } })
Record({ $id: Now.ID['isub-hardware-peripheral'], table: 'x_774308_campus360_issue_sub', data: { category: catHardware, code: 'peripheral', name: 'Keyboard / Mouse / Monitor', active: true } })
Record({ $id: Now.ID['isub-software-os'], table: 'x_774308_campus360_issue_sub', data: { category: catSoftware, code: 'os', name: 'Operating System', active: true } })
Record({ $id: Now.ID['isub-software-licensed'], table: 'x_774308_campus360_issue_sub', data: { category: catSoftware, code: 'licensed_software', name: 'Licensed Software', active: true } })
Record({ $id: Now.ID['isub-software-lms'], table: 'x_774308_campus360_issue_sub', data: { category: catSoftware, code: 'lms_access', name: 'LMS / Portal Access', active: true } })
Record({ $id: Now.ID['isub-software-email'], table: 'x_774308_campus360_issue_sub', data: { category: catSoftware, code: 'email', name: 'Email', active: true } })
Record({ $id: Now.ID['isub-network-lan'], table: 'x_774308_campus360_issue_sub', data: { category: catNetwork, code: 'lan_port', name: 'LAN Port / Cable', active: true } })
Record({ $id: Now.ID['isub-network-vpn'], table: 'x_774308_campus360_issue_sub', data: { category: catNetwork, code: 'vpn', name: 'VPN', active: true } })
Record({ $id: Now.ID['isub-cwifi-nosignal'], table: 'x_774308_campus360_issue_sub', data: { category: catCampusWifi, code: 'no_signal', name: 'No Signal', active: true } })
Record({ $id: Now.ID['isub-cwifi-slow'], table: 'x_774308_campus360_issue_sub', data: { category: catCampusWifi, code: 'slow', name: 'Slow Connection', active: true } })
Record({ $id: Now.ID['isub-cwifi-auth'], table: 'x_774308_campus360_issue_sub', data: { category: catCampusWifi, code: 'auth_failure', name: 'Login / Authentication Failure', active: true } })
Record({ $id: Now.ID['isub-hwifi-nosignal'], table: 'x_774308_campus360_issue_sub', data: { category: catHostelWifi, code: 'no_signal', name: 'No Signal in Room', active: true } })
Record({ $id: Now.ID['isub-hwifi-slow'], table: 'x_774308_campus360_issue_sub', data: { category: catHostelWifi, code: 'slow', name: 'Slow Connection', active: true } })
Record({ $id: Now.ID['isub-hwifi-auth'], table: 'x_774308_campus360_issue_sub', data: { category: catHostelWifi, code: 'auth_failure', name: 'Login / Authentication Failure', active: true } })
Record({ $id: Now.ID['isub-laptop-boot'], table: 'x_774308_campus360_issue_sub', data: { category: catComputerLaptop, code: 'boot_failure', name: 'Does Not Boot', active: true } })
Record({ $id: Now.ID['isub-laptop-performance'], table: 'x_774308_campus360_issue_sub', data: { category: catComputerLaptop, code: 'performance', name: 'Slow / Freezing', active: true } })
Record({ $id: Now.ID['isub-laptop-damage'], table: 'x_774308_campus360_issue_sub', data: { category: catComputerLaptop, code: 'physical_damage', name: 'Physical Damage', active: true } })
Record({ $id: Now.ID['isub-lab-workstation'], table: 'x_774308_campus360_issue_sub', data: { category: catLabEquipment, code: 'workstation', name: 'Lab Workstation', active: true } })
Record({ $id: Now.ID['isub-lab-instrument'], table: 'x_774308_campus360_issue_sub', data: { category: catLabEquipment, code: 'instrument', name: 'Instrument / Apparatus', active: true } })
Record({ $id: Now.ID['isub-bldg-power'], table: 'x_774308_campus360_issue_sub', data: { category: catBuildingElectrical, code: 'power_outage', name: 'Power Outage', active: true } })
Record({ $id: Now.ID['isub-bldg-lighting'], table: 'x_774308_campus360_issue_sub', data: { category: catBuildingElectrical, code: 'lighting', name: 'Lighting', active: true } })
Record({ $id: Now.ID['isub-bldg-socket'], table: 'x_774308_campus360_issue_sub', data: { category: catBuildingElectrical, code: 'socket', name: 'Power Socket', active: true } })
Record({ $id: Now.ID['isub-bldg-acfan'], table: 'x_774308_campus360_issue_sub', data: { category: catBuildingElectrical, code: 'ac_fan', name: 'AC / Fan', active: true } })
