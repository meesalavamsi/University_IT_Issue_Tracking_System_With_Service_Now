import { Record, UiPage } from '@servicenow/sdk/core'
import page from '../../client/index.html'
import { campus360Menu } from '../menu/campus360.menu.now'

// Campus360 React portal, served by the instance itself (same session, same ACLs):
//   https://<instance>/x_774308_campus360_portal.do
export const campus360Portal = UiPage({
    $id: Now.ID['ui-page-campus360-portal'],
    endpoint: 'x_774308_campus360_portal.do',
    description: 'Campus360 role-based React portal (students, faculty, wardens, IT, HOD, registrar, leadership, admin).',
    category: 'general',
    html: page,
    direct: true,
})

// Navigator entry so every Campus360 user (base role) can open the portal from All → Campus360.
Record({
    $id: Now.ID['mod-portal'],
    table: 'sys_app_module',
    data: {
        title: 'Campus360 Portal',
        application: campus360Menu,
        link_type: 'DIRECT',
        query: 'x_774308_campus360_portal.do',
        window_name: '_blank',
        hint: 'Open the Campus360 portal',
        order: 50,
        active: true,
        roles: ['x_774308_campus360.user'],
    },
})
