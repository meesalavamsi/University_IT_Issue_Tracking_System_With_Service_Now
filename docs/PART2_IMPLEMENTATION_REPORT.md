# Campus360: Part 2 Implementation and Build Report

> **Part:** 2, Application data model and configuration · **Date:** 2026-11-11
> **Scope:** `x_774308_campus360` (scopeId `0fa4e9c7e087434bb52c03096bab3ae9`) · **SDK:** `@servicenow/sdk` 4.14.0 · **Target:** dev382380 (Australia, Patch 7)
> **Deployment status: NOT DEPLOYED.** The build output exists only locally in `dist/app`. Deploying needs your separate approval.
>
> **Update after the security audit ([SECURITY_AUDIT.md](SECURITY_AUDIT.md)):** fixes F1–F4 added 88 ACLs (298 → **386**; 218 field-level), turned off admin override on all 93 sensitive-field ACLs, and added `src/fluent/security/hardening.acl.now.ts`. Re-validated: build ✅, `--frozenKeys` ✅, 1,860 files, 0 issues. The ACL counts in §7 below are the pre-audit figures.

---

## 1. Build and validation results (actual)

| Check | Command / method | Result |
|---|---|---|
| SDK build (compile, type-check, Fluent diagnostics) | `npm run build` | ✅ `Build completed successfully` (0 errors, 0 warnings) |
| Record identity (keys) up to date | `now-sdk build --frozenKeys` | ✅ `Build completed successfully with keys validation` |
| Independent output validation | `validate_build.ps1` (parses all 1,668 generated XML files) | ✅ **0 issues** |
| Every record in the correct scope | `sys_scope` checked on every record | ✅ all `0fa4e9c7…` |
| No global tables modified | No `augments`, no dictionary entries or overrides on non-scope tables | ✅ 0 found |
| Table name length ≤ 30 | All 26 tables | ✅ maximum is 30 (`…_fac_onboard`, `…_student_reg`, `…_hostel_room`, `…_hostel_cmpl`, `…_onboard_tsk`, `…_pm_schedule`) |
| Roles scoped | 13 roles all named `x_774308_campus360.*` | ✅ |
| ACLs scoped | 298 ACLs, all on `x_774308_campus360_*` objects | ✅ |
| Demo data in default install | Files under `unload.demo` | ✅ 0 (none created in Part 2) |
| Unique indexes generated | `<index unique="true">` in the table definition | ✅ 24 unique and 37 non-unique |
| Query ACL operations exist on the instance | `sys_security_operation` lookup | ✅ query_range `e66cf897…`, query_match `521c7497…` |

Generated artifacts (from `dist/app`):

| Artifact | Count | Artifact | Count |
|---|---|---|---|
| Tables (`sys_db_object`) | 26 | ACLs (`sys_security_acl`) | 298 |
| Columns (`sys_dictionary`) | 299 custom (+ 26 table entries) | ACL role links | 321 |
| Dictionary overrides | 10 | Roles / role containment links | 13 / 18 |
| Choice lists | 54 | Groups / group role grants | 9 / 11 |
| Number sequences (`sys_number`) | 8 | System properties | 9 |
| Form layouts / sections | 26 / 69 | List layouts | 26 |
| Application menu / modules | 1 / 48 | Configuration records | 8 categories, 24 subcategories, 10 onboarding templates |

---

## 2. Requirement A: platform verification (done before use)

| What | How it was verified | Result |
|---|---|---|
| Task fields used by the 6 task-based tables (23 fields) | Read-only `exec` script, `GlideRecord.isValidField` | All exist |
| `sys_user`, `sys_user_group`, `sys_group_has_role`, `sys_user_role`, `cmn_location`, `cmn_department`, `core_company.vendor`, `alm_asset`, `alm_hardware`, `cmdb_ci`, `incident`, `sys_app_module`, `sys_app_application` | Same script | All exist |
| `task.state` base values | `sys_choice` | -5, 1, 2, 3, 4, 7 (our values 6, 8–12 are added only on our own tables) |
| Dictionary attributes `close_states`, `default_close_state`, `default_work_state` | `sys_schema_attribute` | All exist |
| Platform role `asset` | `sys_user_role` | `bf7dfe64c0a80169002ee4e83aa20d57` |
| `alm_hardware.install_status` "In stock" | `GlideChoiceList` (read-only) | `6 = In stock` |
| Dynamic filters "Me" / "One of My Groups" | `sys_filter_option_dynamic` | `90d1921e…` / `d6435e96…` |
| Schedules, SLA, flow, catalog, CMDB and asset plugins | `sys_db_object` and `v_plugin` | Present / active |
| Name collisions | `sys_user_group` `C360*`, `sys_user` `c360.*`, `sys_number` prefixes | None |

Both `exec` runs were read-only, and each is logged in the instance's Script Execution History.

---

## 3. Table inventory (26)

| Table | Label | Extends | Number | Columns | Refs | Mandatory | Audit | Web services |
|---|---|---|---|---|---|---|---|---|
| department | Department | – | – | 10 | 3 | 2 | – | default |
| acad_term | Academic Term | – | – | 8 | 0 | 5 | – | default |
| program | Academic Program | – | – | 8 | 1 | 6 | – | default |
| course | Course | – | – | 9 | 2 | 5 | – | default |
| course_sec | Course Section | – | – | 11 | 6 | 6 | – | default |
| enrollment | Course Enrollment | – | – | 8 | 2 | 3 | ✅ | **off** |
| student | Student | – | – | 23 | 6 | 5 | ✅ | **off** |
| student_reg | Student Registration | task | REG | 22 | 6 | 6 | ✅ | **off** |
| faculty | Faculty | – | – | 18 | 4 | 6 | ✅ | **off** |
| fac_onboard | Faculty Onboarding | task | ONB | 15 | 6 | 7 | ✅ | **off** |
| onboard_tsk | Onboarding Task | task | OBT | 5 | 3 | 2 | ✅ | default |
| onb_tmpl | Onboarding Task Template | – | – | 8 | 1 | 4 | – | default |
| technician | Technician | – | – | 10 | 4 | 3 | – | default |
| issue_cat | Issue Category | – | – | 13 | 1 | 3 | – | default |
| issue_sub | Issue Subcategory | – | – | 5 | 2 | 3 | – | default |
| **it_issue** | **IT Issue** | **task** | **ITI** | 17 | 10 | 2 (+ short_description) | ✅ | default |
| hostel | Hostel | – | – | 11 | 3 | 5 | – | default |
| hostel_room | Hostel Room | – | – | 9 | 1 | 5 | – | default |
| room_alloc | Room Allocation | – | HAL | 11 | 4 | 5 | ✅ | **off** |
| hostel_cmpl | Hostel Complaint | task | HCP | 6 | 4 | 3 | ✅ | default |
| laboratory | Laboratory | – | – | 14 | 5 | 6 | – | default |
| maint_req | Maintenance Request | task | MNT | 15 | 7 | 3 (+ location) | ✅ | default |
| pm_schedule | Preventive Maintenance Plan | – | – | 11 | 4 | 6 | – | default |
| class_sess | Class Session | – | SES | 15 | 4 | 7 | – | default |
| stu_attend | Student Attendance | – | – | 7 | 3 | 3 | ✅ | **off** |
| fac_attend | Faculty Attendance | – | – | 10 | 2 | 3 | ✅ | **off** |

All tables are prefixed `x_774308_campus360_`. **Field definitions:** see [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) (changes made during implementation are in §10 of that document). The source of truth is `src/fluent/tables/*.now.ts`.

**State definitions (ChoiceSet on the inherited `task.state`, own tables only):**

| Table | States (value = label) | Close states |
|---|---|---|
| it_issue | 1 New · 2 In Progress · -5 On Hold · 6 Resolved · 3 Closed · 7 Cancelled | 3;7 |
| hostel_cmpl | Same as it_issue | 3;7 |
| maint_req | 1 New · 10 Scheduled · 2 In Progress · -5 On Hold · 3 Completed · 7 Cancelled | 3;7 |
| student_reg | 1 Submitted · 2 Registrar Review · 10 Pending HOD Approval · 11 Approved · 12 Rejected · 3 Enrolled · 7 Cancelled | 3;7;12 |
| fac_onboard | 1 Draft · 9 Awaiting Approval · 2 In Progress · -5 On Hold · 3 Completed · 8 Rejected · 7 Cancelled | 3;7;8 |
| onboard_tsk | 1 Open · 2 Work in Progress · -5 Pending · 3 Closed Complete · 4 Closed Incomplete · 7 Closed Skipped | 3;4;7 |

Other choice lists: 48 inline choice columns (status, type and category fields). All are listed in `dist/app/author_elective_update`.

---

## 4. Index inventory

**Unique (24):** these prevent duplicates at database level.

| Table | Index | Columns | Requirement |
|---|---|---|---|
| **stu_attend** | c360_satt_session_student_u | class_session, student | **No duplicate student attendance** |
| **fac_attend** | c360_fatt_faculty_date_u | faculty, attendance_date | **One faculty attendance record per day** |
| enrollment | c360_enr_student_section_u | student, course_section | No duplicate enrollment |
| class_sess | c360_ses_section_date_time_u | course_section, session_date, start_time | No duplicate session |
| class_sess | c360_ses_number_u | number | – |
| course_sec | c360_sec_course_term_sec_u | course, term, section | No duplicate section |
| student | c360_stu_user_u / c360_stu_id_u | user / student_id | One profile per user; unique roll number |
| faculty | c360_fac_user_u / c360_fac_empid_u | user / employee_id | One profile per user; unique employee ID |
| technician | c360_tech_user_u | user | One profile per user |
| hostel_room | c360_room_hostel_number_u | hostel, room_number | No duplicate rooms |
| room_alloc | c360_alloc_number_u | number | – |
| department | c360_dept_code_u / c360_dept_name_u | code / name | – |
| acad_term | c360_term_name_u / c360_term_year_type_u | name / academic_year, term_type | One odd, even and summer term per year |
| program, course, hostel, laboratory, issue_cat | *_code_u | code | – |
| issue_sub | c360_isub_cat_code_u | category, code | – |
| onb_tmpl | c360_onbt_type_u | task_type | One template per task type |

**Non-unique (37):** on every foreign key or filter column used by ACL conditions, lists and reports (full list in the validation output; for example `room_alloc(hostel_room,status)`, `room_alloc(student,status)` for capacity counts, and `class_sess(faculty,session_date)`).

**Support verification (requirement B):** the SDK `Table.index` API emits `<index name=… unique="true">` inside the table definition XML. This is the platform's standard way to create database indexes and is supported on Australia. The indexes are physically created when the app is installed, so they'll be confirmed on the instance (`sys_index`) during deployment smoke tests.
**Documented limitation:** conditional uniqueness, such as "at most N *active* allocations per room", can't be expressed as a database index. It's enforced by the Part 8 business rules, the aggregate recount and the nightly reconciliation job.

---

## 5. Role inventory (13)

| Role | Contains | Description |
|---|---|---|
| x_774308_campus360.user | – | Base access |
| x_774308_campus360.student | user | Student self-service |
| x_774308_campus360.faculty | user | Teaching staff |
| x_774308_campus360.hod | faculty | Head of department |
| x_774308_campus360.technician | user | IT support |
| x_774308_campus360.it_manager | technician | IT lead |
| x_774308_campus360.warden | user | Hostel warden |
| x_774308_campus360.maintenance | user | Facilities staff |
| x_774308_campus360.lab_admin | user | Lab administration |
| x_774308_campus360.registrar | user | Registrar office |
| x_774308_campus360.faculty_admin | user | Faculty administration |
| x_774308_campus360.leadership | user | Read-only analytics |
| x_774308_campus360.admin | it_manager, warden, maintenance, lab_admin, registrar, faculty_admin, leadership | App administrator (**excludes** the student and faculty personas; see §9) |

## 6. Group inventory (9, configuration data)

| Group | Roles granted |
|---|---|
| C360 IT Service Desk | technician |
| C360 Desktop & Hardware Support | technician, **asset** (platform) |
| C360 Network & Wi-Fi Team | technician |
| C360 Lab Support | technician, **asset** (platform) |
| C360 Facilities & Electrical | maintenance |
| C360 Hostel Administration | warden |
| C360 Registrar Office | registrar |
| C360 Faculty Onboarding Team | faculty_admin |
| C360 IT Management | it_manager |

## 7. ACL inventory (298)

| Table | Total | Read | Create | Write | Delete | Field / query ACLs included |
|---|---|---|---|---|---|---|
| student | 52 | 22 | 1 | 10 | 1 | 9 sensitive fields × (read, read-self, write, query_range deny, query_match deny) |
| faculty | 34 | 13 | 1 | 7 | 1 | 6 sensitive fields × 5 |
| it_issue | 28 | 6 | 5 | 16 | 1 | Technician-only workflow fields; create-time field ACLs; write-once escalation link |
| student_reg | 23 | 13 | 4 | 1 | 1 | Applicant personal fields; registrar-only review fields |
| hostel_cmpl | 16 | 5 | 1 | 9 | 1 | Confidentiality **deny** ACL; warden-only workflow fields |
| stu_attend | 14 | 4 | 4 | 5 | **deny-all** | Student and session can't be changed after creation (except by registrar) |
| fac_attend | 13 | 3 | 4 | 5 | **deny-all** | Faculty and date can't be changed except by faculty_admin |
| class_sess | 10 | 4 | 2 | 3 | 1 (before attendance only) | – |
| fac_onboard | 10 | 4 | 1 | 2 | 1 | approval field (engine-only); personal fields |
| technician | 10 | 1 | 1 | 7 | 1 | it_manager-only fields |
| room_alloc | 9 | 3 | 3 | 2 | 1 | Students may only create `requested` allocations for themselves |
| hostel_room | 8 | 3 | 2 | 2 | 1 | – |
| enrollment | 7 | 4 | 1 | 1 | 1 | – |
| maint_req | 7 | 3 | 1 | 2 | 1 | – |
| course_sec, hostel, onboard_tsk | 6 each | – | – | – | 1 | – |
| department, course, laboratory | 5 each | 1 | 1 | 2 | 1 | HOD writes own department, courses and labs |
| acad_term, program, issue_cat, issue_sub, pm_schedule, onb_tmpl | 4 each | 1 | 1 | 1 | 1 | – |

Totals: 136 field-level · 81 conditional (row-level) · 39 deny · 3 without admin override (attendance deletes; escalation link). Source: `src/fluent/security/*.acl.now.ts`.

**Row-level rules implemented declaratively** (dot-walk plus the dynamic filters "Me" / "One of My Groups", no scripts): RL-01, RL-03, RL-05, RL-06, RL-07, RL-08, RL-09, RL-10, RL-11, RL-12, RL-13, RL-14, RL-15, plus advisor access (part of RL-02).
**Deferred to Part 3** (these need a sub-query and the `C360Security` script include): RL-02 (instructors reading students enrolled in their sections), RL-04 (wardens reading resident profiles and guardian contact), and student read of *own* sessions, rooms and sections. Until then these users simply **can't see** those rows, which is the secure default.

## 8. System properties (9)

| Property | Type | Default |
|---|---|---|
| x_774308_campus360.attendance.edit_window_hours | integer | 48 |
| x_774308_campus360.attendance.min_pct | integer | 75 |
| x_774308_campus360.issue.auto_close_days | integer | 5 |
| x_774308_campus360.issue.reopen_days | integer | 7 |
| x_774308_campus360.faculty.self_checkin_enabled | boolean | true |
| x_774308_campus360.hostel.enforce_gender_rule | boolean | true |
| x_774308_campus360.registration.public_enabled | boolean | false |
| x_774308_campus360.privacy.mask_in_lists | boolean | true |
| x_774308_campus360.demo.enabled | boolean | **false** |

Write access to every property: `x_774308_campus360.admin`.

## 9. Forms, lists and navigation

**Forms (26, default view):** every table has a form. Task forms include an Activity formatter section, plus related lists for SLAs, child maintenance requests and approvals. Sensitive fields sit in a separate **"(Restricted)"** section with a red notice and are hidden by field ACLs. Registration and onboarding forms explain their approval sequence in a notice at the top. Source: `src/fluent/layouts/*.layout.now.ts`.
**Lists (26, default view):** no sensitive field appears in any list layout.

**Navigator "Campus360" (1 menu, 48 modules):**

| Section | Modules (roles) |
|---|---|
| IT Issues | Create New · Open · Open - Unassigned · My Groups' Work · Assigned to Me · Resolved · All · Technicians · Issue Categories · Issue Subcategories |
| Students | Students · Registrations - Pending · Registrations - All · Programs |
| Faculty | Faculty · Onboarding · Onboarding Tasks · Onboarding Templates |
| Academics | Departments · Academic Terms · Courses · Course Sections · Enrollments |
| Attendance | Class Sessions - Today · Class Sessions · Student Attendance · Low Attendance (< 75%) · Faculty Attendance |
| Hostel | Hostels · Rooms · Allocation Requests · Allocations · Complaints - Open |
| Labs & Infrastructure | Laboratories · Maintenance Requests - Open / All · Preventive Maintenance Plans · Campus Hardware Assets |
| Administration | Properties · Campus360 Groups |

Each module is limited to the roles that use it. Students and faculty use the portals (Part 11), not the navigator.

---

## 10. Changes from the approved design

| # | Change | Reason |
|---|---|---|
| D1 | `admin` does **not** contain `student` or `faculty`/`hod` | Self-service row filters (Part 3) must never restrict administrators. Admin is granted explicitly instead. |
| D2 | `course_sec` and `class_sess` are readable campus-wide (students: sessions) | Timetable data isn't personal. The design's "R own" is applied as a list filter in Part 3. |
| D3 | Students and faculty get **no** table write on their own profile | Self-edit of contact fields runs through portal widgets (Part 11), which write only the allowed fields. This is safer than broad write plus many field ACLs. |
| D4 | `student_reg`: added `registrar_recommendation`, `registrar_reviewed_by/at`, `hod_approver` and state **10 Pending HOD Approval** | Makes "registrar review, then HOD approval" explicit and auditable |
| D5 | `fac_onboard`: states **9 Awaiting Approval** and **8 Rejected**; the `approval` field is engine-only (admin-write ACL) | "Approval before checklist" can be enforced and shown |
| D6 | Blood group values stored as codes (`a_pos` …), labels A+ … | `+` and `-` aren't safe choice values |
| D7 | Added unique index on `number` for `room_alloc` and `class_sess`, and property `demo.enabled=false` | Integrity; demo is visibly off |
| D8 | Read-only fields use `readOnlyOption: 'display_read_only'` | Keeps fields read-only in the form while letting server logic update them |
| D9 | ACLs written one by one, with no helper functions | Verified by experiment: Fluent rejects functions and loops (`TS262`, `TS250`) |

## 11. Not in Part 2 (planned parts)

| Item | Part |
|---|---|
| Business rules: duplicate-attendance friendly messages, capacity validation, priority matrix, provisioning | 4–8 |
| **Incident escalation** UI action with server-side duplicate check (the field and its write-once ACL are already in place) | 4 |
| Nightly **hostel occupancy reconcile** scheduled job | 8 |
| Registration flow (registrar, then HOD approval) and onboarding flow (approval, then checklist) | 5, 6 |
| `C360Security` script include and the deferred row rules RL-02, RL-04 | 3 |
| Service Catalog items and record producers | 10 |
| Portals, notifications, dashboards, imports, **optional demo data** | 11–13 |
| Explicit relationships "C360 Lab Assets" / "C360 Lab CIs" | 9 |

## 12. Source layout added in Part 2

```
src/fluent/roles/roles.now.ts                    13 roles
src/fluent/groups/groups.now.ts                  9 groups + 11 group-role grants
src/fluent/properties/properties.now.ts          9 properties
src/fluent/tables/{academic,people,it-issue,hostel,infrastructure,attendance,registration-onboarding}.now.ts
src/fluent/layouts/*.layout.now.ts               26 forms + 26 lists
src/fluent/menu/campus360.menu.now.ts            1 menu + 48 modules
src/fluent/security/*.acl.now.ts                 298 ACLs
src/fluent/data/config/{issue-categories,onboarding-templates}.now.ts
src/fluent/generated/keys.ts                     record identity (commit this file)
```
