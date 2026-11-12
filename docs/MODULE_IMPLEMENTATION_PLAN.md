# Campus360: Module Implementation Plan

Each part ends with `npm run build` passing and a review checkpoint. Parts after Part 2 also end with `npm run deploy` to `dev382380` and a smoke test, which happens only after you approve that part. SDK artifact names are the Fluent APIs confirmed in SDK 4.14 (`now-sdk explain --list`).

| Part | Name | Depends on | Main Fluent APIs |
|---|---|---|---|
| 0 | Initialization | – | `init` · **done** |
| 1 | Architecture & database design | 0 | Documents · **this deliverable** |
| 2 | Foundation & data model | 1 | Role, Record (groups), Property, Table, ChoiceSet, OverrideColumn, Form, List, ApplicationMenu |
| 3 | Security | 2 | ScriptInclude, Acl, BusinessRule (before query) |
| 4 | Core IT Issue Tracking | 2–3 | BusinessRule, ClientScript, UiPolicy, DataPolicy, UiAction, StateModel, assignment rules, Sla, ScheduledScript |
| 5 | Departments, academics, students & registration | 2–3 | BusinessRule, Flow, ScriptInclude |
| 6 | Faculty & onboarding | 5 | Flow, BusinessRule |
| 7 | Student & faculty attendance | 5–6 | BusinessRule, UiAction, ScheduledScript, DatabaseView |
| 8 | Hostel management | 5 | BusinessRule, Flow, ScheduledScript |
| 9 | Labs, infrastructure & assets | 4 | BusinessRule, ScheduledScript, Record (sys_relationship) |
| 10 | Service catalog & request management | 4–9 | CatalogItem, CatalogItemRecordProducer, variables, subflow |
| 11 | Student & faculty portals | 4–10 | ServicePortal, SPPage, SPWidget, SPMenu, SPTheme |
| 12 | Notifications, reports & dashboards | 4–9 | EmailNotification, Record (sysevent_register, sys_report), Dashboard |
| 13 | Data import & sample data | 2–9 | ImportSet, Record ($meta demo) |
| 14 | Testing & hardening | all | Test, TestSuite |

---

## Part 2: Foundation and data model
**Files**
- `src/fluent/roles/roles.now.ts`: 13 roles
- `src/fluent/data/config/groups.now.ts`: 9 groups and their group-role records
- `src/fluent/properties/properties.now.ts`: 8 properties
- `src/fluent/tables/<module>/*.now.ts`: 26 tables (column specs from DATABASE_SCHEMA.md), indexes, autoNumber, ChoiceSets on `state`, OverrideColumns
- `src/fluent/tables/<module>/*.form.now.ts`: default form and list for each table
- `src/fluent/menu/campus360.menu.now.ts`: application menu and modules
- `src/fluent/data/config/issue-categories.now.ts`, `onboarding-templates.now.ts`

**Build order** (to respect references): department → acad_term → program → course → faculty → student → course_sec → enrollment → technician → issue_cat → issue_sub → hostel → hostel_room → laboratory → pm_schedule → it_issue → hostel_cmpl → maint_req → room_alloc → class_sess → stu_attend → fac_attend → student_reg → fac_onboard → onb_tmpl → onboard_tsk. Circular references (department.hod → faculty → department) are resolved by referencing table names as strings.

**Acceptance:** build passes; after deploy all 26 tables appear in `sys_db_object` under the scope; unique indexes appear in `sys_index`; inserting a duplicate attendance row fails.

## Part 3: Security
- `C360Security` script include and `src/server/security/*.ts`
- `security/<module>.acl.now.ts`: table, field, query_range and query_match ACLs according to ROLE_PERMISSION_MATRIX.md
- Before-query business rules for student, faculty, it_issue, hostel_cmpl, stu_attend, enrollment, room_alloc

**Acceptance:** impersonating a demo student, faculty member, warden or technician shows exactly the rows and fields in the matrix (this becomes ATF in Part 14).

## Part 4: Core IT Issue Tracking
- Business rules from ARCHITECTURE §6.3 (it_issue), `C360IssueUtils`, `C360Ajax`
- Client scripts (category and caller onChange), UI policies, data policies
- UI actions: Assign to Me, Resolve, Reopen, Escalate to Incident, Create Maintenance Request
- StateModel for it_issue (transitions: New→In Progress→On Hold↔In Progress→Resolved→Closed; Resolved→In Progress on reopen; any→Cancelled)
- Assignment rules per category and subcategory group (data-driven from issue_cat)
- SLA definitions P1–P4
- Scheduled scripts: auto-close, technician workload reconcile

**Acceptance:** each of the 8 categories routes to its group; priority matrix is correct; SLAs attach; resolve → auto-close after N days; escalation creates a linked incident.

## Part 5: Departments, academics, students and registration
- Business rules for acad_term, course_sec, enrollment, student and student_reg
- `C360AcademicUtils`, `C360Provisioning` (student path)
- Flow **C360 Student Registration** (approvals, provisioning, optional hostel request)

**Acceptance:** an approved registration creates sys_user, student and the role exactly once; a duplicate application is rejected; section capacity is enforced.

## Part 6: Faculty and onboarding
- Faculty business rules, `C360Provisioning` (faculty path)
- Flow **C360 Faculty Onboarding** (task generation from onb_tmpl, wait, activate, laptop allocation)

**Acceptance:** onboarding generates the conditional checklist; completing it activates the faculty member and grants the role; the laptop asset's `assigned_to` is set.

## Part 7: Attendance
- class_sess, stu_attend and fac_attend business rules; `C360AttendanceUtils`
- UI actions: Generate Roster, Submit, Lock
- Scheduled scripts: lock attendance, missing faculty attendance
- Database view `x_774308_campus360_attv`

**Acceptance:** duplicate marks are rejected (index and business rule); a non-enrolled student is rejected; edits after the window are rejected for faculty but allowed for the registrar; attendance % updates; faculty can't have two records for the same day.

## Part 8: Hostel
- `C360HostelUtils`; room_alloc, hostel_room and hostel_cmpl business rules
- Flow **C360 Room Allocation Request**; scheduled occupancy reconcile
- Database view `x_774308_campus360_allv`

**Acceptance:** allocation N+1 into a room with capacity N is rejected; a second active allocation for the same student is rejected; occupancy and status update; a non-resident can't raise a complaint.

## Part 9: Labs, infrastructure and assets
- Laboratory and maint_req business rules; PM generator scheduled script
- Relationships "C360 Lab Assets" and "C360 Lab CIs" with related lists
- Create Maintenance Request from an IT issue or complaint

**Acceptance:** lab form lists the assets and CIs at its location; PM plans generate work orders on time; child work orders inherit context.

## Part 10: Service catalog and requests
- Catalog **Campus360** with categories IT Support, Hostel, Academic, Facilities, Faculty Services
- Record producers: Report IT Issue (→ it_issue), Hostel Complaint (→ hostel_cmpl; Wi-Fi → it_issue), Request Maintenance (staff), Apply for Admission (→ student_reg), Request Room Allocation (→ room_alloc)
- Catalog items: ID Card Replacement, Bonafide Certificate, Transcript Request, Software Installation, Lab Access, Guest Wi-Fi Access, each using the **C360 Catalog Fulfilment** subflow
- User criteria (`UserCriteria`): student-only and faculty-only items

## Part 11: Portals
- `ServicePortal` student360 and faculty360, the Campus360 `SPTheme`, header and footer, `SPMenu` for each portal
- `SPPage`s from ARCHITECTURE §5; widgets: c360-student-home, c360-attendance-summary, c360-hostel-room, c360-my-requests, c360-report-issue-tiles, c360-class-schedule, c360-take-attendance, c360-faculty-checkin, c360-hod-dashboard
- Widget server scripts use `GlideRecordSecure`

**Acceptance:** a student can't open faculty pages; take-attendance saves in one batch and shows duplicate or validation errors clearly; usable at phone width.

## Part 12: Notifications, reports and dashboards
- 12 notifications (ARCHITECTURE §7), registered events
- Reports and 5 dashboards (ARCHITECTURE §8) with role-based visibility

## Part 13: Data import and sample data
- 7 import sets (ARCHITECTURE §9.1) with CSV templates in `/data-templates`
- Demo data set (§9.2) as `Record` with `installMethod: 'demo'`

## Part 14: Testing and hardening
- ATF suites: Security, IT Issue, Attendance, Hostel, Registration, Onboarding
- `now-sdk build --frozenKeys` check, ACL review against the matrix, instance scan

---

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Two allocations saved at the same moment could exceed room capacity | Before business rule plus aggregate recount plus nightly reconcile; failures are logged |
| Many ACLs (about 180) are hard to review | One file per module; IDs follow the pattern `acl-<table>-<op>[-<field>]`; ATF visibility tests |
| Fluent `Flow` API complexity for provisioning | Keep the provisioning logic in a script include called from flows; flows only orchestrate |
| Deleting Fluent records later creates delete records on upgrade | Never remove a definition without confirming with you (keys.ts rule) |
| Demo sys_users mixing with real users | `c360.` prefix and `example.edu` emails; demo install method only |
| Portal performance with large rosters | Batched server calls in take-attendance; indexed queries; paging after 200 students |
