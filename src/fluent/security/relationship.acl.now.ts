import { Acl } from '@servicenow/sdk/core'
import { canFacultyReadStudent, canWardenReadGuardian, canWardenReadStudent } from '../../server/security/c360-security'
import { roleFaculty, roleWarden } from '../roles/roles.now'

// Part 3 — relationship-based (scripted) ACLs on student profiles.
// Logic lives in src/server/security/*.ts; the SDK generates the require() bridge for each script.
// These ACLs only ADD narrowly scoped allow paths; no existing ACL is changed or weakened.
// Sensitive fields other than guardian_name / guardian_phone remain registrar/self/app-admin only.

// RL-02: faculty read students ENROLLED in a planned/active section they teach or co-teach.
Acl({
    $id: Now.ID['acl-student-read-instructor'],
    type: 'record',
    table: 'x_774308_campus360_student',
    operation: 'read',
    roles: [roleFaculty],
    script: canFacultyReadStudent,
    adminOverrides: true,
    description: 'RL-02: instructors (primary or co-instructor) read students enrolled in their planned/active sections. Logic: C360Security / c360-security.ts.',
})

// RL-04: wardens read students holding an active/requested allocation in a hostel they warden.
Acl({
    $id: Now.ID['acl-student-read-warden'],
    type: 'record',
    table: 'x_774308_campus360_student',
    operation: 'read',
    roles: [roleWarden],
    script: canWardenReadStudent,
    adminOverrides: true,
    description: 'RL-04: wardens/assistant wardens read students with an active or requested allocation in their hostels.',
})

// RL-04g: wardens read guardian contact ONLY for active residents of their hostels (approved restricted-field rule).
// adminOverrides: false — consistent with all other sensitive-field ACLs (security audit F1).
Acl({
    $id: Now.ID['acl-student-gname-read-warden'],
    type: 'record',
    table: 'x_774308_campus360_student',
    field: 'guardian_name',
    operation: 'read',
    roles: [roleWarden],
    script: canWardenReadGuardian,
    adminOverrides: false,
    description: 'RL-04g: guardian name visible to the warden of the student\'s ACTIVE hostel allocation (emergency contact).',
})
Acl({
    $id: Now.ID['acl-student-gphone-read-warden'],
    type: 'record',
    table: 'x_774308_campus360_student',
    field: 'guardian_phone',
    operation: 'read',
    roles: [roleWarden],
    script: canWardenReadGuardian,
    adminOverrides: false,
    description: 'RL-04g: guardian phone visible to the warden of the student\'s ACTIVE hostel allocation (emergency contact).',
})
