# W-3: Statistics Fix (authorisation before aggregation)

> **Status:** implemented and validated locally for **all six REST-enabled tables with row-conditional read ACLs**: `it_issue`, `hostel_cmpl`, `maint_req` (rev. 2) and `hostel_room`, `class_sess`, `onboard_tsk` (rev. 3, approved) · **not yet deployed** · 2026-11-11

## 1. Problem (verified 2026-11-11, W-2 test #6e)
`GET /api/now/stats/x_774308_campus360_it_issue?sysparm_count=true` as student B returned **count = 1**, even though B could read **0** IT issues. Row ACLs filter *rows*, but aggregate queries (Stats API, `GlideAggregate`, report group counts) count rows **before** row ACLs are applied. No content leaked; the existence and number of other users' records did. The same mechanism applies to every REST-enabled table whose read ACLs are row-conditional.

## 2. Fix: before-query business rules mirroring the read ACLs
Each rule appends an encoded query to **every** query on its table (lists, reports, Table API, Stats API, `GlideAggregate`, exports, reference lookups, portal), so counts are computed only over rows the read ACLs would allow. ACLs stay in place and remain authoritative; the rules only **narrow**.

| Business rule | Table | Handler → pure policy |
|---|---|---|
| C360 IT Issue - restrict queries to visible rows | `x_774308_campus360_it_issue` | `restrictIssueQuery` → `issueVisibilityQuery` |
| C360 Hostel Complaint - restrict queries to visible rows | `x_774308_campus360_hostel_cmpl` | `restrictComplaintQuery` → `complaintVisibilityQuery` |
| C360 Maintenance Request - restrict queries to visible rows | `x_774308_campus360_maint_req` | `restrictMaintenanceQuery` → `maintenanceVisibilityQuery` |

Source: `src/fluent/logic/it-issue-query.now.ts`, `src/server/issue/issue-query-rule.ts`, `src/server/issue/issue-visibility.ts`. All three run before, on query only, order 100. User `system` (scheduled jobs) is not restricted. An unidentifiable user gets `sys_idISEMPTY` (no rows; fails closed).

### 2.1 IT issues (mirrors `it-issue.acl.now.ts`)
| Persona | Added condition |
|---|---|
| technician, it_manager, Campus360 admin, leadership (and platform admin) | none |
| anyone else | `caller = me OR opened_by = me` |
| + warden | `OR hostel.warden = me OR hostel.assistant_warden = me` |
| + lab_admin | `OR laboratory is not empty` |
| + hod | `OR department.hod.user = me` |

### 2.2 Hostel complaints (mirrors `hostel.acl.now.ts`, including the confidential deny-unless rule RL-12)
| Persona | Added condition |
|---|---|
| platform admin (`adminOverrides=true` on these ACLs) | none |
| leadership (and Campus360 admin, which contains leadership) | `is_confidential = false OR caller/opened_by = me OR hostel.warden/assistant_warden = me` |
| warden | `caller/opened_by = me OR hostel.warden/assistant_warden = me` |
| anyone else (student, faculty, technician, …) | `caller = me OR opened_by = me` |

### 2.3 Maintenance requests (mirrors `infrastructure.acl.now.ts`)
| Persona | Added condition |
|---|---|
| maintenance, lab_admin, technician (so it_manager), leadership, Campus360 admin, platform admin | none |
| anyone else | `caller = me OR opened_by = me` |
| + warden | `OR hostel.warden = me OR hostel.assistant_warden = me` |

> Role checks in these rules use `gs.hasRole()` **on purpose**: they reproduce the ACL engine's role semantics (where platform admin satisfies a role), so the rule never hides a row the ACL would show. This is different from D-2, which deliberately requires *explicit* membership for personal data.

## 3. Every statistics path, and how it's protected
| Path | Protection | Evidence |
|---|---|---|
| Portal `GET /stats` | Iterates `GlideRecordSecure` rows; never `GlideAggregate` | Build test: no `GlideAggregate` in `src/server/portal`; ATF |
| Portal `GET /admin/overview` | Campus360 admin only; iterates `GlideRecordSecure` | Build test; ATF (26 tables) |
| Portal dashboard counters | Computed client-side from API rows that are already ACL-filtered | Code review |
| Platform Stats API, `GlideAggregate`, reports on `it_issue`, `hostel_cmpl`, `maint_req` | Before-query rules (§2) | Unit tests; ATF `GlideAggregate` checks per persona |
| Tables with `ws_access=false` (`student`, `faculty`, `student_reg`, `fac_onboard`, `room_alloc`, `enrollment`, `stu_attend`, `fac_attend`) | Stats/Table API blocked for all users (403 verified on `student` in W-2) | Dictionary + W-2 |
| REST-enabled tables with **unconditional** role-based read (department, program, course, course_sec, acad_term, issue_cat, issue_sub, laboratory, pm_schedule, technician, hostel, onb_tmpl) | Count = rows the role can read; no row hiding to bypass | ACL audit |
| `hostel_room`, `class_sess`, `onboard_tsk` (row-conditional read, REST-enabled) | **Revision 3:** before-query rules (§6) | Unit tests; build test that fails if **any** REST-enabled table with a row-conditional read ACL lacks a query rule; ATF rev 3 |

## 4. Tests
| Test | Result |
|---|---|
| Unit: IT issue policy (12) + complaint policy (9) + maintenance policy (8), including invalid-user fail-closed cases | ✅ |
| Build output: 3 rules present, active, before, query-only (insert/update/delete off), referencing the right module; ticket tables REST-enabled; portal has no `GlideAggregate` | ✅ |
| Full suite | ✅ **241 / 241** (rev. 3) |
| **On instance (after deploy)** | ⏳ ATF *C360 Portal - API end-to-end regression*: `GlideAggregate` counts per persona. Student A: own issue/complaint = 1, technician's issue = 0 · Student B and faculty: A's issue/complaint = 0, faculty's maintenance = 0 for B · technician: unrestricted = 1 · warden: own-hostel complaint = 1, student's IT issue = 0 · Campus360 admin: non-confidential complaint elsewhere = 1. ATF *C360 Integrity*: the existing IT-issue aggregate steps. Manual M19: Stats API retest of W-2 #6e. |

## 5. Revision 2 residual: resolved in revision 3
Revision 2 left `hostel_room`, `class_sess` and `onboard_tsk` open, because a naive mirror of the room ACL would have hidden a student's own **full** room. The owner approved option (c) with the condition that the student's own room must stay visible. Implemented below.

While designing this, an existing defect was found and fixed. The portal's `activeAllocation()` reads the student's room with `GlideRecordSecure`, but the room ACL allowed students only `status = available`. So a resident of a **full** room got no hostel and was refused a hostel complaint. The new own-room ACL fixes that at the platform layer, and the rev-3 ATF covers it (student in a full single room raises a complaint → 201).

## 6. Revision 3 rules
| Business rule | Table | Policy (mirrors the read ACLs) |
|---|---|---|
| C360 Hostel Room - restrict queries to visible rows | `hostel_room` | technician (so IT manager), maintenance, registrar, leadership, admins → all · warden → rooms of hostels they warden / assist · **student → `status = available` OR the room(s) of their own active allocation** (even when full) · others → none |
| C360 Class Session - restrict queries to visible rows | `class_sess` | registrar, leadership, **students (timetable)**, admins → all · faculty → sessions they take or of sections they teach · HOD → + their department's sessions · others → none |
| C360 Onboarding Task - restrict queries to visible rows | `onboard_tsk` | faculty_admin, leadership, admins → all · everyone else → tasks assigned to one of their groups |

**New ACL:** `acl-hostel-room-read-own` (role student + script `canStudentReadOwnRoom`). The ACL and the query rule share one function (`ownActiveRoomIds()` in `src/server/security/own-room.ts`), so they can't drift apart. This doesn't widen access beyond the requirement: a student gains read access to exactly the room(s) of their own **active** allocation.

**Effect on business functionality:** none intended.
- Timetables remain visible to students.
- Instructors keep their sessions; co-instructors were already limited by the same ACL.
- Wardens keep their rooms.
- Fulfilment groups keep their tasks.

As a consequence of mirroring the ACLs, references to rooms or sessions a user can't read may display empty for that user. They couldn't open those records before either.

**Tests:** 16 unit tests (rooms 8, sessions 5, tasks 3); build tests per rule; ATF rev 3 counts per persona:

| Count | student A (own full room) | student B | warden A | warden B | technician | IT manager | faculty | Campus360 admin |
|---|---|---|---|---|---|---|---|---|
| Rooms | 2 | 1 | 2 | 1 | 3 | 3 | 0 | 3 |
| Sessions | 2 | – | 0 | – | 0 | – | 1 | 2 |
| Onboarding tasks | 0 | – | – | – | 0 | 0 | 0 | 2 |

The in-group technician counts 1 onboarding task.

Portal statistics (`/stats`, `/admin/overview`) iterate `GlideRecordSecure`, which is now additionally narrowed by these rules. `GlideAggregate` is still forbidden in portal code (build test).
