# Campus360: Pre-Deployment Security Audit

> **Date:** 2026-11-11 · **Build:** Part 2 (not deployed) · **Instance inspected (read-only):** dev382380
> **Question asked:** Do the individually written ACLs create conflicting access paths? Do reference lookups, reports, exports and REST respect the same restrictions? Does administrator access expose restricted personal fields beyond the approved roles?

> **⚠️ CORRECTION (2026-11-11, on-instance ATF):** finding F1's claim that turning off admin override stops platform admins from reading personal fields is **incorrect for role-based ACLs**. A platform `admin` passes every role check, so it can still read these fields. See DEPLOYMENT_EXECUTION_REPORT.md Part B, finding **D-2**, for evidence and options. Everything else in F1 (no admin override on sensitive ACLs) is deployed as described.

## 1. Verdict

The audit found **3 real defects and 1 governance gap** in the Part 2 ACL set. All four are **fixed** in the current build (ACLs: 298 → **386**). After the fixes, the simulated access check found:
- **0** sensitive-field exposures outside the approved roles
- **0** open ACLs (no role and no condition)
- **0** duplicate ACLs
- **0** out-of-scope records

Some items can only be proven on a running instance. They're listed in §7 as runtime tests to run immediately after deployment.

## 2. Method

| Step | Evidence |
|---|---|
| Static simulation of every generated ACL (`dist/app`), with role inheritance expanded, for 12 personas | `acl_audit.ps1`; results in §4–§5 |
| Read-only inspection of the **platform** ACLs that Campus360 tables inherit or fall back to | 3 read-only `exec` runs (listed in Script Execution History) |
| Platform security mode | `glide.sm.default_mode = deny` (unmatched access is denied) |
| Scope and integrity re-validation | `validate_build.ps1`: 1,860 files, 0 issues; `build --frozenKeys` passed |

Personas: student, faculty, hod, technician, warden, maintenance, lab_admin, registrar, faculty_admin, leadership, **app admin** (`x_774308_campus360.admin`), **platform admin with no Campus360 role**.

## 3. Findings and fixes

| # | Severity | Finding | Fix (in build) |
|---|---|---|---|
| **F1** | **High (privacy)** | Every sensitive-field ACL had `adminOverrides: true`, so **any platform `admin`** (and any role carrying admin override) could read, write and query student and faculty personal data **without** an approved Campus360 role. That is wider than the approved matrix. | `adminOverrides: false` on all **93** sensitive-field ACLs (student 45, faculty 30, registration and onboarding 18). Access now requires self, `registrar`, `faculty_admin` or `x_774308_campus360.admin`. |
| **F2** | **High (integrity)** | 43 system-maintained fields (e.g. `hostel_room.occupied`, `enrollment.attendance_pct`, `stu_attend.locked`, `it_issue.resolved_by`, `student_reg.hod_approver`/`approval`) were read-only **only in the form**. A user with row write could change them through list edit, browser-side form tampering or REST. Example: a warden resetting `occupied` to bypass room capacity. | A server-enforced field **write** ACL on each of the 43 fields plus `student_reg.approval` (44 ACLs), limited to app admin. Business rules, flows and jobs run server-side and are unaffected. On insert, the platform's `*.*` create rule checks field write (verified on the instance), so these fields can't be set on create either. |
| **F3** | **High (functional / conflict)** | **Inherited platform ACL conflict.** The 6 task-based tables inherit `task.<field>` write ACLs that require `itil`/`task_editor` (verified: short_description, description, comments, state, priority, impact, urgency, assigned_to, work_notes). Campus360 users don't hold those roles, so students couldn't enter a short description, maintenance staff couldn't update work notes, and so on. The build passed but the app would have been broken in use. | **38** Campus360-specific field ACLs on the 6 task tables. They override the inherited rules, and row access stays governed by each table's own ACL (table and field ACLs must both pass). |
| **F4** | Medium (reports) | The platform `task` **report_view** ACL requires `admin`/`itil`, so leadership, registrar and HOD couldn't view reports on task-based Campus360 tables. | `report_view` ACLs on the 6 task tables. Row and field ACLs still filter every report. |
| G1 | Governance (not fixable by ACL) | A platform administrator can always grant themselves a role or edit ACLs. | Accepted platform behaviour. Such changes are recorded in system logs and update history. Recommend restricting who holds platform `admin` on production. |

**Remaining inherited-rule exposure (accepted):** `impact`, `urgency` and `priority` on hostel complaints, registrations and onboarding records still follow the platform `task` rules (itil only). These fields aren't on those forms and are set by the system, so this is intended and has no user-facing effect.

## 4. Who can read restricted personal fields (after fixes)

`Y` = all rows · `C` = own record only (condition "user is me") · `–` = no access

| Field | student | faculty | hod | technician | warden | maint. | lab_admin | registrar | faculty_admin | leadership | **app admin** | **platform admin (no C360 role)** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| student.date_of_birth, gender, blood_group, personal_phone, personal_email, home_address, guardian_name, guardian_relation, guardian_phone | C | – | – | – | – | – | – | **Y** | – | – | **Y** | **–** |
| faculty.date_of_birth, personal_phone, personal_email, home_address, emergency_contact, emergency_phone | – | C | C | – | – | – | – | – | **Y** | – | **Y** | **–** |
| student_reg.applicant_phone, date_of_birth, gender, guardian_name, guardian_phone | C* | C* | C* | C* | C* | C* | C* | **Y** | C* | C* | **Y** | **–** |
| fac_onboard.personal_email, personal_phone | – | – | – | – | – | – | – | – | **Y** | – | **Y** | **–** |

\* `C` on registrations means "only the application I submitted myself" (the applicant).
**Result: 0 violations against the approved matrix.** HOD, leadership, wardens and technicians can read the student or faculty *record* but not these fields.

**Blind-query protection** (filtering or sorting on a field to infer values): `query_range` and `query_match` are denied on every sensitive field except for registrar and app admin (faculty_admin and app admin for faculty fields). The platform's public `*.*` query rule is the fallback, and the deny-unless rule takes precedence.

**What app admin means:** `x_774308_campus360.admin` inherits `registrar` and `faculty_admin`, so it *can* read personal data. This matches the approved matrix. To keep it narrow, give this role only to the app owner.

> **Note for you:** because of F1, your own PDI account (`admin`) will **not** see these fields in Campus360 unless you also give yourself `x_774308_campus360.admin` (or registrar / faculty_admin). This is intended.

## 5. Table-level effective access (after fixes)

Each cell is **R C W D** (read, create, write, delete): `Y` all rows · `C` row-scoped by condition · `-` none.

| Table | student | faculty | hod | technician | warden | maint. | lab_admin | registrar | faculty_admin | leadership | app admin | platform admin |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| acad_term / program | Y--- | Y--- | Y--- | Y--- | Y--- | Y--- | Y--- | YYY- | Y--- | Y--- | YYYY | YYYY |
| department / course | Y--- | Y--- | Y-C- | Y--- | Y--- | Y--- | Y--- | YYY- | Y--- | Y--- | YYYY | YYYY |
| course_sec | Y--- | Y--- | YCC- | Y--- | Y--- | Y--- | Y--- | YYY- | Y--- | Y--- | YYYY | YYYY |
| enrollment | C--- | C--- | C--- | ---- | ---- | ---- | ---- | YYY- | ---- | Y--- | YYYY | YYYY |
| student | C--- | C--- | C--- | ---- | ---- | ---- | ---- | YYY- | ---- | Y--- | YYYY | YYYY |
| faculty | Y--- | Y--- | Y--- | Y--- | Y--- | Y--- | Y--- | Y--- | YYY- | Y--- | YYYY | YYYY |
| student_reg | CY-- | CY-- | CY-- | CY-- | CY-- | CY-- | CY-- | YYY- | CY-- | YY-- | YYYY | YYYY |
| fac_onboard | ---- | ---- | C--- | ---- | ---- | ---- | ---- | ---- | YYY- | Y--- | YYYY | YYYY |
| onboard_tsk | C-C- | C-C- | C-C- | C-C- | C-C- | C-C- | C-C- | C-C- | YYY- | Y-C- | YYYY | YYYY |
| onb_tmpl | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | YYY- | ---- | YYYY | YYYY |
| technician | ---- | ---- | ---- | Y-C- | ---- | ---- | ---- | ---- | ---- | Y--- | YYYY | YYYY |
| issue_cat / issue_sub | Y--- | Y--- | Y--- | Y--- | Y--- | Y--- | Y--- | Y--- | Y--- | Y--- | YYYY | YYYY |
| **it_issue** | CYC- | CYC- | CYC- | YYC- | CYC- | CYC- | CYC- | CYC- | CYC- | YYC- | YYYY | YYYY |
| hostel | Y--- | Y--- | Y--- | Y--- | Y-C- | Y--- | Y--- | Y--- | Y--- | Y--- | YYYY | YYYY |
| hostel_room | C--- | ---- | ---- | Y--- | CCC- | Y--- | ---- | Y--- | ---- | Y--- | YYYY | YYYY |
| room_alloc | CC-- | ---- | ---- | ---- | CCC- | ---- | ---- | Y--- | ---- | Y--- | YYYY | YYYY |
| hostel_cmpl | CYC- | C-C- | C-C- | C-C- | CYC- | C-C- | C-C- | C-C- | C-C- | Y-C- | YYYY | YYYY |
| laboratory | Y--- | Y--- | Y-C- | Y--- | Y--- | Y--- | YYY- | Y--- | Y--- | Y--- | YYYY | YYYY |
| maint_req | C--- | CY-- | CY-- | YY-- | CY-- | YYC- | YYY- | C--- | C--- | Y--- | YYYY | YYYY |
| pm_schedule | ---- | ---- | ---- | ---- | ---- | Y--- | YYY- | ---- | ---- | Y--- | YYYY | YYYY |
| class_sess | Y--- | CCC- | CCC- | ---- | ---- | ---- | ---- | YYYC | ---- | Y--- | YYYC | YYYY |
| **stu_attend** | C--- | CCC- | CCC- | ---- | ---- | ---- | ---- | YYY- | ---- | Y--- | YYY**-** | YYY**-** |
| **fac_attend** | ---- | CCC- | CCC- | ---- | ---- | ---- | ---- | ---- | YYY- | Y--- | YYY**-** | YYY**-** |

Observations, all intended:
- Attendance can't be deleted by **anyone**, including platform admins (deny-unless, no override).
- "C" write on it_issue, hostel_cmpl and onboard_tsk for most personas means *own* records (caller) or *assigned-group* records. Workflow fields stay technician-, warden- or role-only through field ACLs.
- Leadership and HOD "C" write appears only where they are the caller of their own ticket.
- Platform admin keeps full **record** access to non-sensitive data (standard ServiceNow), but **no** access to sensitive fields (F1).
- **For your decision:** any Campus360 user can *create* a registration (`student_reg`, column "C**Y**"), because applicants hold only the base `user` role. If registrations should come only through the public or applicant portal, this can be narrowed in Part 5.

## 6. Secondary access paths

| Path | How it is protected | Status |
|---|---|---|
| **Reference lookups** (pickers, auto-complete) | The picker query runs as the user and applies row ACLs. A student picking a student sees only themselves. Display values are non-sensitive by design: student = `student_id`, faculty = `employee_id`. | ✅ by design. **Known functional gap:** wardens can't pick students in allocations until Part 3 adds RL-04. |
| **Dot-walking** (e.g. adding `student.date_of_birth` to an enrollment list or report) | The target field's ACL is evaluated, so the sensitive field ACL applies. | ✅ |
| **Reports** | Reports run as the viewer and apply row and field read ACLs. `report_view` is now set explicitly on task tables (F4). Grouping or filtering on sensitive fields is blocked by query ACLs. | ✅ (runtime test RT-3) |
| **List exports** (CSV, Excel, PDF) | Exports run in the user's session over the same filtered list. Fields without read access come out empty. | ✅ by platform design (runtime test RT-4) |
| **REST Table API / Aggregate API / GraphQL** | Same row, field and query ACLs. In addition, `ws_access = false` on the 8 personal-data tables (student, faculty, enrollment, stu_attend, fac_attend, room_alloc, student_reg, fac_onboard), so the Table API returns 403 for them. | ✅ (runtime test RT-5) |
| **Scripted REST, portal widgets** (future parts) | Rule: always use `GlideRecordSecure` (ARCHITECTURE §5) | ⏳ enforced in code review of Parts 11+ |
| **Audit and history** (old and new values of sensitive fields) | The raw `sys_audit` table can be read only by `audit_viewer`/admin. The History UI requires `glide.history.role = itil` plus record access (both verified). | ⚠️ **Residual risk:** a user who holds `itil` *and* a Campus360 role that can read the student record (e.g. an HOD who is also an ITIL agent) might see sensitive old and new values in History. Runtime test RT-6. If confirmed, the options are `no_audit` on sensitive fields (conflicts with your audit requirement) or removing `itil` from such users. Your decision. |
| **Attachments** | Platform `sys_attachment` read rules defer to the parent record's read ACL | ✅ |
| **Notifications** | None yet. Rule: sensitive fields are never placed in emails (ARCHITECTURE §7). | ⏳ Part 12 |

## 7. Runtime tests to run right after deployment

These need the app installed. They would use **temporary test users** (`c360.test.*`, `example.edu`) that I'd create and then delete, **with your approval**.

| ID | Test | Expected |
|---|---|---|
| RT-1 | Impersonate a student and open another student's record | Row not visible |
| RT-2 | Impersonate an HOD and open a department student | Record visible; DOB, phone, address and guardian fields empty |
| RT-3 | As leadership, report on students grouped by gender | Denied / no values |
| RT-4 | As leadership, export the student list to Excel | Sensitive columns blank |
| RT-5 | `GET /api/now/table/x_774308_campus360_student` as the registrar | 403 (web services disabled) |
| RT-6 | ITIL user with HOD role views History of a student record | Confirm whether sensitive values appear (residual risk) |
| RT-7 | Warden edits `hostel_room.occupied` through list edit | Not editable |
| RT-8 | Student creates an IT issue with a short description and comment | Succeeds (F3) |
| RT-9 | Platform admin without a Campus360 role opens a student's DOB | Empty (F1) |
| RT-10 | Insert a duplicate attendance row | Rejected by the unique index |
