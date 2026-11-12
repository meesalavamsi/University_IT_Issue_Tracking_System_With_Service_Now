# Campus360: Part 3 Implementation Report (security script include)

> **Date:** 2026-11-11 · **Scope:** `x_774308_campus360` · **SDK:** 4.14.0 · **Status: built and validated, NOT deployed**

> **Post-deployment update (2026-11-11):** deployed. Defect **D-1** (relative imports without `.ts` → `ModuleResolutionException` on the instance, failing closed) was fixed in `c360-security.ts` and `glide-access-data.ts`, and a module-resolution regression test was added (93 local tests). On the instance, RL-02, RL-04 and RL-04g are **verified by ATF** for instructor, other faculty, advisor, HOD and wardens A/B. A separate finding, **D-2** (platform admins pass role-only ACLs), affects Part 2's sensitive-field ACLs, not the Part 3 scripts. See DEPLOYMENT_EXECUTION_REPORT.md Part B.

## 1. Summary

Part 3 adds the two relationship-based access rules that Part 2 deliberately left closed:

| Rule | Who | Can read | Based on |
|---|---|---|---|
| **RL-02** | Faculty (incl. HOD as faculty) | Student profiles of students **enrolled** (`status=enrolled`) in a **planned or active** course section where they are the **instructor or co-instructor** | `enrollment` → `course_sec.faculty` / `co_instructors`; faculty profile must be **active** |
| **RL-04** | Wardens and assistant wardens | Student profiles of students with an **active or requested** room allocation in a hostel they warden (hostel must be active) | `room_alloc` → `hostel_room.hostel.warden` / `assistant_warden` |
| **RL-04g** | Wardens and assistant wardens | **Only** `guardian_name` and `guardian_phone`, and only for **active** residents | Same as RL-04, with status `active` only |

Unchanged: advisor access (declarative ACL), HOD department access (declarative ACL), student self access, registrar, app admin and leadership. **No existing ACL was changed or weakened.** Part 3 only adds 4 narrowly scoped allow rules.

## 2. Artifacts

| File | Type | Purpose |
|---|---|---|
| `src/server/security/access-rules.ts` | TS module (no platform imports) | Pure decision logic for RL-02, RL-04, RL-04g. Validates input and fails closed. Unit-tested locally. |
| `src/server/security/glide-access-data.ts` | TS module | Production data source: 3 indexed `GlideRecord` lookups (`setLimit(1)`) |
| `src/server/security/c360-security.ts` | TS module | Facade used by ACLs: `canFacultyReadStudent`, `canWardenReadStudent`, `canWardenReadGuardian`; optional debug logging |
| `src/scripts/script-includes/C360Security.js` + `src/fluent/script-includes/c360-security.now.ts` | Script include **C360Security** | Reusable server API for non-module callers (BRs, flows, ATF, background scripts). `package_private`, not client-callable, not sandbox-callable. Thin `require()` bridge to the module. |
| `src/fluent/security/relationship.acl.now.ts` | 4 ACLs | RL-02 / RL-04 table read on `student`, RL-04g field read on `guardian_name` and `guardian_phone` |
| `src/fluent/properties/properties.now.ts` | Property | `x_774308_campus360.security.debug` (false): logs rule, user, student, result and reason, never field values |
| `src/fluent/tests/security.test.now.ts` + `src/scripts/atf/*.js` | ATF test (36 steps) | On-instance regression suite (§5.3) |
| `test/security/*.mjs` | Node tests (`npm test`) | Local unit and build-configuration tests (§5.1–5.2) |

### Dependency chain
```
ACL x_774308_campus360_student (read, faculty)      ─┐   SDK-generated bridge:
ACL x_774308_campus360_student (read, warden)        ├─► require('x_774308_campus360/campus360/2.0.0/
ACL ..._student.guardian_name / guardian_phone (warden)┘           src/server/security/c360-security.ts')
                                                         │
Script include C360Security (non-module callers) ────────┘   (same require path; a test catches version drift)
        c360-security.ts ──► access-rules.ts (pure decisions, input validation)
                         └─► glide-access-data.ts ──► GlideRecord: faculty, enrollment (+course_sec), room_alloc (+hostel_room, hostel)
```

## 3. Security design decisions

| Requirement | How it is met |
|---|---|
| Reusable server-side logic | One module (`c360-security.ts`) used by the ACLs (through SDK bridges) and by the `C360Security` script include. No duplicated logic. |
| No client-side hiding or filtering | Enforcement is entirely in server ACLs. Forms, lists, reports, exports, reference pickers and REST all go through the same ACL engine. |
| Uses actual relationships | Live queries on `enrollment` / `course_sec` (instructor or co-instructor, enrollment and section status) and `room_alloc` / `hostel` (warden or assistant, allocation status, hostel active). No cached flags or copied data. |
| Empty, missing or invalid references | `isValidSysId` (exactly 32 lowercase hex characters) is checked on the user, student and faculty IDs before any query. Anything else is **denied** without querying. 55 rejected-input tests cover this. |
| Query-injection safety | Encoded queries are built only from validated sys_ids and constant status values (which are also checked against `^[a-z_]+$`). A test proves invalid input never reaches the data source. |
| **No circular ACL dependencies** | The lookups use server-side `GlideRecord`, **not** `GlideRecordSecure`, so evaluating the student ACL never triggers ACL evaluation on enrollment, faculty or room_alloc. Those tables' ACLs never call back into these scripts. The lookups return only a boolean or an internal ID to the ACL; no record data reaches the caller. |
| Safe "direct record access" | No record data is exposed by the helper. The script include isn't callable from the browser (`client_callable=false`), from sandbox expressions, or from other scopes (`package_private`). |
| Table-level probe | When the platform evaluates a read ACL with no specific row (deciding whether a list or module is reachable), the row ACLs return true because there's no data to expose; every actual row is then evaluated individually. **Field** ACLs (guardian contact) always fail closed. |
| Restricted-field rules preserved | Instructors get **no** sensitive-field access. Wardens get guardian name and phone only (approved), active residents only, with **admin override off**. All other sensitive-field ACLs are unchanged (admin override off). |
| Attendance immutability | Unchanged; asserted by tests |
| Performance | Each scripted row check runs at most 2 indexed single-row queries (`setLimit(1)`) on `faculty(user)`, `enrollment(student, course_section)` and `room_alloc(student, status)`. A list page of N students costs at most 2N small queries for faculty and wardens. If this becomes significant, a before-query business rule can pre-filter lists (planned as optional in Part 14). |

## 4. Build and validation results (actual)

| Check | Result |
|---|---|
| `npm run build` | ✅ Build completed successfully |
| `now-sdk build --frozenKeys` | ✅ Build completed successfully |
| `npm test` (Node test runner) | ✅ **92 / 92 passed**, 0 failed (7 suites) |
| Scope and integrity validation (`validate_build.ps1`) | ✅ 1,910 XML files, **0 issues**; 390 ACLs; 0 demo files |
| Access simulation (`acl_audit.ps1`) | ✅ **0** sensitive-field violations, **0** open ACLs, **0** duplicates |
| Generated ACL scripts | ✅ SDK-generated `require('x_774308_campus360/campus360/2.0.0/src/server/security/c360-security.ts')` |
| ATF role references | ✅ Resolved to role sys_ids (e.g. faculty `b6168c33…`, platform admin `2831a114…`) |

## 5. Regression testing

### 5.1 Unit tests on the real decision module (`test/security/access-rules.test.mjs`)

These run against the actual `access-rules.ts` with an in-memory model of enrollments, sections and allocations.

| Scenario | Expected | Result |
|---|---|---|
| Instructor → student enrolled in their active section | allow | ✅ pass |
| Co-instructor → same student | allow | ✅ pass |
| Unrelated faculty → that student | deny | ✅ pass |
| Instructor → student in another faculty member's section | deny | ✅ pass |
| Instructor → **dropped** enrollment | deny | ✅ pass |
| Instructor → enrollment only in a **completed** section | deny | ✅ pass |
| **Resigned** faculty → their section's students | deny | ✅ pass |
| User without a faculty profile | deny | ✅ pass |
| Advisor relationship via RL-02 (handled by its own ACL) | deny via RL-02 | ✅ pass |
| Warden → **active** resident | allow | ✅ pass |
| Warden → **requested** allocation | allow | ✅ pass |
| Assistant warden → active resident | allow | ✅ pass |
| Warden → **vacated** resident | deny | ✅ pass |
| Warden A → hostel B resident / warden B → hostel A resident | deny | ✅ pass |
| Warden of an **inactive** hostel | deny | ✅ pass |
| Faculty → RL-04 | deny | ✅ pass |
| Warden → guardian contact, active resident | allow | ✅ pass |
| Warden → guardian contact, requested / vacated / other hostel | deny | ✅ pass |
| 11 invalid values (undefined, null, '', ' ', 'abc', 123, {}, uppercase, injection `…^ORactive=true`, 31 and 33 characters) × 5 functions | deny | ✅ 55 pass |
| sys_id validator and "invalid input never queried" | – | ✅ pass |

### 5.2 Build-configuration regression (`test/security/build-config.test.mjs`)

| Assertion | Result |
|---|---|
| RL-02 ACL: faculty role only, script calls the module, no condition | ✅ |
| RL-04 ACL: warden role only | ✅ |
| RL-04g guardian_name and guardian_phone: warden only, admin override **off** | ✅ |
| Wardens have no read path to DOB, gender, blood group, personal phone/email, address or guardian relation | ✅ |
| Instructors have no field-level read on any sensitive student field | ✅ |
| **All** student and faculty sensitive-field ACLs still have admin override off (≥ 77) | ✅ |
| stu_attend and fac_attend delete = deny-all, no admin override | ✅ |
| No open allow ACL anywhere | ✅ |
| REST Table API disabled (`ws_access=false`) on the 8 personal-data tables | ✅ |
| Every ACL targets a Campus360 object (no global changes) | ✅ |
| Script include require path = package version = SDK bridge path | ✅ |
| Script include is `package_private`, not client- or sandbox-callable | ✅ |

### 5.3 On-instance ATF suite: *"C360 Security – Student profile access regression (Part 3)"* (built; runs after deployment)

It creates 13 fictional users (`c360.test.*@example.edu`), builds the fixture **as the Campus360 app admin through `GlideRecordSecure`** (no ACL bypass), then impersonates each persona and asserts access **only through `GlideRecordSecure`**. ATF rolls back all users and data afterwards.

| Requested regression case | Persona | Assertions |
|---|---|---|
| Student → own profile | studenta | own row ✓, own DOB ✓, own guardian phone ✓ |
| Student → another student | studenta | rows B, C ✗ |
| Faculty → enrolled student | facteach | A ✓ |
| Faculty → unrelated student | facteach / facother | B, C, D (dropped) ✗ / A ✗ (C ✓, own section) |
| Advisor → assigned students | facadvisor | B ✓, A ✗ |
| HOD → authorised department students | hod | A, D ✓ (own dept), C ✗ (other dept) |
| Warden → assigned hostel residents | wardena / wardenb | A ✓ + guardian name and phone ✓ / C ✓ + guardian phone ✓ |
| Warden → other hostel's residents | wardena / wardenb | C ✗ / A ✗ |
| Admin access | c360.test.admin (app admin) | A–D ✓, DOB ✓ |
| Restricted fields | facteach, facother, facadvisor, hod, wardena, wardenb, leadership, platadmin | DOB, personal phone, address, guardian relation ✗ as applicable |
| Platform admin without a Campus360 role | platadmin | row ✓, DOB ✗, guardian phone ✗, address ✗ |
| REST restrictions | (server script) | `ws_access=false` on 8 personal-data tables |

**Requirement to run it:** ATF execution is currently **disabled** on dev382380 (`sn_atf.runner.enabled = false`, verified). Turning it on is part of the deployment plan and needs your approval.

## 6. Known limitations (documented, not hidden)

1. **Substitute teachers:** a faculty member who only *took* a session (`class_sess.faculty`) but isn't the section's instructor or co-instructor gets **no** student profile access. Intentional, per "assigned classes". Attendance rows are still visible to them through the existing session ACL.
2. **Requested allocations:** wardens can see the *profile* (not guardian contact) of students who **requested** a room in their hostel, so they can review the request. Remove `requested` from `ALLOCATION_STATUSES_FOR_PROFILE` if you'd rather not allow this.
3. **List performance:** see §3, Performance.
4. **Audit-history residual risk** from the security audit (RT-6) is unchanged and still needs the runtime test.
