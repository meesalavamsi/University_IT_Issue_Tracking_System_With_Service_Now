import { ScriptInclude } from '@servicenow/sdk/core'

// C360Security — reusable server-side security API (bridge to src/server/security/c360-security.ts).
// package_private: callable only from the Campus360 scope. Not client-callable, not sandbox-callable.
export const C360Security = ScriptInclude({
    $id: Now.ID['si-c360-security'],
    name: 'C360Security',
    script: Now.include('../../scripts/script-includes/C360Security.js'),
    description: 'Campus360 relationship-based access checks (RL-02 instructor→student, RL-04 warden→resident, RL-04g warden→guardian contact). Server-side only.',
    accessibleFrom: 'package_private',
    clientCallable: false,
    sandboxCallable: false,
    active: true,
})
