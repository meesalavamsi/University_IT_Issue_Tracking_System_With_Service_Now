# D-2: Personal Data Access Fix (explicit Campus360 role membership)

> **Status:** implemented and validated locally · **not yet deployed** (needs deployment approval) · 2026-11-11
> **Decision:** Option A (approved)

## 1. Problem
On dev382380, the ATF security suite (run 3, step 35) showed that a **platform `admin` user with no Campus360 role could read student date of birth**. Personal-field ACLs were role-based (for example `roles: [registrar]`), and ServiceNow treats the `admin` role as satisfying **every** role check. Turning off admin override (security audit F1) didn't change this, because admin override only governs scripts and conditions, not the role check itself.

## 2. Which role API is actually "exact"? (verified on the instance, read-only)
Test user: your `admin`, who holds the Campus360 admin role (so **inherits** registrar) but **not** the student role.

| API | `…registrar` (inherited) | `…student` (not held) | Exact? |
|---|---|---|---|
| `gs.hasRole()` | true | **true** | ❌ admin passes every role |
| `gs.getUser().getRoles()` contains | true | false | ✅ |
| `gs.getUser().hasAssignedRole()` | true | false | ✅ |
| `sys_user_has_role` rows | 1 | 0 | ✅ (data source) |

Implementation uses `hasAssignedRole()` **or** membership in `getRoles()`. Both proved exact, and both count roles held directly, through a group, or through role inheritance (for example Campus360 admin includes registrar), so approved inheritance is preserved.

## 3. Implementation
| Item | Change |
|---|---|
| `src/server/security/explicit-roles.ts` | New: `hasExplicitRole(names)`, `hasExplicitRegistrarRole(current)`, `hasExplicitFacultyAdminRole(current)` (role names are validated against `^x_774308_campus360\.[a-z_]+$`) |
| `src/fluent/security/people.acl.now.ts` | **60** role-based student and faculty personal-field ACLs (read, write, query_range deny, query_match deny) now also have `script: hasExplicit…Role` |
| `src/fluent/security/registration-onboarding.acl.now.ts` | **13** role-based registration and onboarding personal-field ACLs: same change |
| `src/server/security/c360-security.ts` | Part 3 instructor and warden scripts now also require explicit `faculty` / `warden` membership, so a platform admin recorded as a hostel's warden isn't implicitly a warden |
| Unchanged | The **20** self-access ACLs (record-owner condition `user = me` / `opened_by = me`): the condition already excludes non-owners. Admin override stays **off** on all 93 personal-field ACLs. Auditing unchanged. |

ACL semantics: role check **AND** script must pass (allow ACLs), or the deny-unless ACL denies unless both pass. The script never grants access on its own.

### Personal-field ACL inventory (93 + 2)
| Group | Count | Protection |
|---|---|---|
| Student fields (9) × read / write / query_range / query_match, registrar | 36 | role + explicit-registrar script |
| Faculty fields (6) × 4, faculty_admin | 24 | role + explicit-faculty-admin script |
| Registration personal fields (registrar) | 9 | role + explicit-registrar script |
| Onboarding personal fields (faculty_admin) | 4 | role + explicit-faculty-admin script |
| Self-access (student, faculty, applicant) | 20 | role + owner condition (unchanged) |
| Warden guardian contact (RL-04g) | 2 | role + relationship script (now also explicit warden) |

## 4. Before / after
| Persona | Student DOB / phone / address (before) | After |
|---|---|---|
| Platform admin, **no** Campus360 role | **Readable** (D-2) | **Denied** |
| Platform admin **with** Campus360 admin (your `admin`) | Readable | Readable (approved: Campus360 admin includes registrar) |
| Registrar / faculty_admin | Readable | Readable |
| Student (own record) / faculty (own record) | Own only | Own only |
| Warden | Guardian name/phone of active residents | Same; also requires explicit warden role |
| HOD, leadership, instructor, advisor, technician | Denied | Denied |

Reference lookups, list views, reports, exports, the Table API and the new portal API all go through the **same** field ACLs, so the fix applies to all of them. The portal API uses `GlideRecordSecure` exclusively, and a build test enforces this.

## 5. Test evidence
| Test | Result |
|---|---|
| Build-output test: 73 role-based personal ACLs all carry the explicit-role script | ✅ 73/73 |
| Build-output test: 20 self-access ACLs keep their owner condition; no personal ACL has admin override | ✅ |
| Access simulation (`acl_audit.ps1`) | ✅ 0 violations; platform-admin column now "–" for every personal field; registrar and app admin show "C" (script-checked) |
| Full local suite | ✅ 241/241 (2026-11-11, revision 3; personal-data tests unchanged and passing) |
| **On-instance proof** | ⏳ After deployment: ATF "C360 Security – Student profile access regression", step 35 (`c360.test.platadmin`), already expects DOB = **false**; it failed before the fix. Also persona checks via impersonation for lists, lookups and exports. |

## 6. Important limitation: ordinary access vs privileged platform control
This fix stops a platform administrator from **routinely reading** personal fields through forms, lists, reports, exports, APIs and the portal. It is **not** protection against a *malicious* platform administrator. A platform admin can still:
- grant themselves `x_774308_campus360.registrar` or Campus360 admin;
- elevate to `security_admin` and edit or deactivate these ACLs;
- run background scripts with plain `GlideRecord`, which ignores ACLs;
- read raw audit tables or export the database.

These actions leave audit trails (role-grant records, ACL update records, Script Execution History). Mitigations are organisational: limit who holds `admin` / `security_admin`, review role grants on Campus360 roles, and monitor ACL changes. The platform's Separation of Duties and Data Privacy features are options for production.
