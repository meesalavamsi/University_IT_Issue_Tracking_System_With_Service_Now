# Campus360: Requirements Traceability Matrix

Maps each business requirement to its table(s), role(s), workflow/logic and test case. **Status:** ✅ built in Part 2 · ⏳ planned (part number). Test cases are ATF tests to be built in Part 14 (`Test` API); IDs are reserved here.

## 1. Core IT Issue Tracking

| ID | Requirement | Tables | Roles | Workflow / logic | Test case | Status |
|---|---|---|---|---|---|---|
| IT-01 | Report hardware, software, network, campus Wi-Fi, hostel Wi-Fi, computer/laptop, lab equipment and building/electrical issues | it_issue, issue_cat (8 seeded), issue_sub (24 seeded) | user (create) | Record producer "Report IT Issue" | TC-IT-01 Create one issue per category | ✅ data model · ⏳ P10 intake |
| IT-02 | Route issues to the correct team | issue_cat.assignment_group, issue_sub.assignment_group | technician | Assignment rules from category | TC-IT-02 Each category routes to its group | ✅ config · ⏳ P4 |
| IT-03 | Technician management (skills, availability, workload) | technician | it_manager, technician (own availability) | Workload business rule + nightly reconcile | TC-IT-03 open_issue_count matches | ✅ table/ACL · ⏳ P4 |
| IT-04 | Priority from impact × urgency | it_issue (task impact/urgency/priority) | technician (field ACL) | Priority business rule (matrix) | TC-IT-04 All 9 matrix cells | ⏳ P4 |
| IT-05 | Status management New → In Progress → On Hold → Resolved → Closed / Cancelled | it_issue.state ChoiceSet, close_states | technician (state field ACL) | StateModel | TC-IT-05 Valid and invalid transitions | ✅ states · ⏳ P4 |
| IT-06 | Request tracking by the caller | it_issue.caller, opened_by | user (RL-05) | Portal "My Requests" | TC-IT-06 Caller sees own issues, not others' | ✅ ACL · ⏳ P11 |
| IT-07 | Resolution management (code, notes, resolved by/at, reopen) | it_issue.resolution_code, close_notes, resolved_*, reopen_count | technician | Resolution business rule; auto-close job | TC-IT-07 Resolve, then auto-close after N days | ✅ fields · ⏳ P4 |
| IT-08 | Callers can't change workflow fields | it_issue | technician-only field ACLs | – | TC-IT-08 Caller edit of state or priority is denied | ✅ |
| IT-09 | Authorised, duplicate-protected incident escalation | it_issue.escalated_incident (index) | it_manager (write-once field ACL) | UI action "Escalate to Incident" with duplicate check | TC-IT-09 Second escalation is blocked | ✅ field/ACL · ⏳ P4 |
| IT-10 | SLAs | task_sla (related list) | – | contract_sla P1–P4 | TC-IT-10 SLA attaches and pauses on hold | ⏳ P4 |

## 2. Students, registration and departments

| ID | Requirement | Tables | Roles | Workflow / logic | Test case | Status |
|---|---|---|---|---|---|---|
| ST-01 | Student records without duplicating user data | student (→ sys_user, unique user) | registrar | – | TC-ST-01 Second profile for the same user fails | ✅ |
| ST-02 | Unique roll number | student.student_id (unique) | registrar | – | TC-ST-02 Duplicate ID fails | ✅ |
| ST-03 | Registration: **registrar review, then HOD approval** | student_reg (states 1→2→10→11/12→3) | registrar, hod | Flow "C360 Student Registration" | TC-ST-03 HOD approval only after the registrar recommends | ✅ states/fields/ACL · ⏳ P5 |
| ST-04 | Provision user and student on approval, exactly once | student_reg.created_user/created_student | system | C360Provisioning | TC-ST-04 Re-running doesn't duplicate | ⏳ P5 |
| ST-05 | No duplicate application per email and term | student_reg (index email+term) | – | Before business rule | TC-ST-05 Second application rejected | ✅ index · ⏳ P5 |
| DP-01 | Departments linked to platform departments | department.platform_dept → cmn_department | registrar | – | TC-DP-01 Link resolves | ✅ |
| DP-02 | HOD maintains own department, courses and labs | department, course, laboratory | hod (RL-15) | – | TC-DP-02 HOD can't edit another department | ✅ |
| AC-01 | Programs, courses, terms, sections, enrollment | program, course, acad_term, course_sec, enrollment | registrar | Section naming, capacity business rules | TC-AC-01 Capacity enforced | ✅ model · ⏳ P5 |
| AC-02 | No duplicate enrollment or section | unique indexes | – | – | TC-AC-02 Duplicate rejected | ✅ |

## 3. Faculty and onboarding

| ID | Requirement | Tables | Roles | Workflow / logic | Test case | Status |
|---|---|---|---|---|---|---|
| FA-01 | Faculty records (unique user and employee ID) | faculty | faculty_admin | – | TC-FA-01 Duplicates rejected | ✅ |
| FA-02 | Custom onboarding (HR Service Delivery not installed) | fac_onboard, onboard_tsk, onb_tmpl (10 templates) | faculty_admin | – | TC-FA-02 Template-driven checklist | ✅ model/config |
| FA-03 | **Approval required before the checklist runs** | fac_onboard (states 1→9→2; approval field engine-only) | faculty_admin, approver | Flow "C360 Faculty Onboarding" | TC-FA-03 No onboard_tsk before approval | ✅ states/ACL · ⏳ P6 |
| FA-04 | Laptop allocation from in-stock assets | onboard_tsk.allocated_asset → alm_hardware (install_status=6) | technician + asset | – | TC-FA-04 Only in-stock laptops can be picked | ✅ |

## 4. Attendance

| ID | Requirement | Tables | Roles | Workflow / logic | Test case | Status |
|---|---|---|---|---|---|---|
| AT-01 | **No duplicate student attendance** | stu_attend unique(class_session, student) | – | + friendly business rule message | TC-AT-01 Second mark rejected with a clear message | ✅ index · ⏳ P7 message |
| AT-02 | **One faculty attendance per day** | fac_attend unique(faculty, attendance_date) | – | + friendly business rule message | TC-AT-02 Duplicate day rejected | ✅ index · ⏳ P7 message |
| AT-03 | Instructors mark only their own sessions | stu_attend | faculty (RL-07) | Edit-window business rule | TC-AT-03 Other instructor denied | ✅ ACL · ⏳ P7 window |
| AT-04 | Students see only their own attendance | stu_attend | student (RL-08) | – | TC-AT-04 Student A can't see B | ✅ |
| AT-05 | Attendance can't be deleted (audit) | stu_attend, fac_attend (audit on) | none (deny-all) | – | TC-AT-05 Admin delete denied | ✅ |
| AT-06 | Attendance % and exam eligibility | enrollment.attendance_pct, exam_eligible | – | Async recalculation | TC-AT-06 % correct after marks | ⏳ P7 |
| AT-07 | Faculty self check-in (today only) | fac_attend | faculty (RL-10) | Business rule | TC-AT-07 Back-dated self entry rejected | ✅ ACL · ⏳ P7 |

## 5. Hostel

| ID | Requirement | Tables | Roles | Workflow / logic | Test case | Status |
|---|---|---|---|---|---|---|
| HO-01 | Hostels, rooms, allocations, complaints | hostel, hostel_room, room_alloc, hostel_cmpl | warden (RL-11) | – | TC-HO-01 Warden limited to own hostel | ✅ |
| HO-02 | **Room capacity enforced safely** | hostel_room.capacity/occupied (read-only), room_alloc | – | validateAllocation + aggregate recount | TC-HO-02 Allocation N+1 rejected | ✅ model · ⏳ P8 |
| HO-03 | **Nightly occupancy reconciliation** | hostel_room, hostel | – | Scheduled job "C360 Hostel Occupancy Reconcile" | TC-HO-03 Counter repaired | ⏳ P8 |
| HO-04 | Students only *request* allocations | room_alloc | student (create with status=requested only) | Warden approval flow | TC-HO-04 Student can't create an active allocation | ✅ ACL · ⏳ P8 flow |
| HO-05 | Confidential complaints | hostel_cmpl.is_confidential | deny ACL (RL-12) | – | TC-HO-05 Other users can't read | ✅ |
| HO-06 | Hostel Wi-Fi handled by IT, not as a complaint | issue_cat `hostel_wifi` | – | Producer routing | TC-HO-06 Wi-Fi creates it_issue | ✅ config · ⏳ P10 |

## 6. Labs, infrastructure, assets and CMDB

| ID | Requirement | Tables | Roles | Workflow / logic | Test case | Status |
|---|---|---|---|---|---|---|
| LB-01 | Laboratory management | laboratory | lab_admin, hod (own dept) | – | TC-LB-01 | ✅ |
| LB-02 | Lab equipment via ALM and CMDB (no duplicate table) | alm_hardware, cmdb_ci by location | lab_admin + asset | Explicit relationships | TC-LB-02 Lab form lists assets | ✅ decision · ⏳ P9 |
| IN-01 | Maintenance work orders (from issues and complaints) | maint_req (parent) | maintenance (RL-13) | UI actions | TC-IN-01 Child inherits context | ✅ model · ⏳ P9 |
| IN-02 | Preventive maintenance | pm_schedule | lab_admin | PM generator job | TC-IN-02 Work order created at the lead time | ✅ model · ⏳ P9 |

## 7. Cross-cutting

| ID | Requirement | Implementation | Test case | Status |
|---|---|---|---|---|
| SEC-01 | Role-based record access | 390 ACLs deployed (81 condition-based + 4 scripted relationship ACLs); **411 in the pending release** (100 conditional) | TC-SEC-01 Impersonation matrix (ATF "C360 Security – Student profile access regression") | ✅ |
| SEC-05 | Faculty view **only** students enrolled in their assigned classes (RL-02) | student ← enrollment ← course_sec (faculty / co_instructors); C360Security / c360-security.ts | Unit: 9 cases ✅ · ATF: facteach ✅, facother ✅ (dropped and unrelated denied) | ✅ **Verified on the instance** after the D-1 fix (2026-11-11). SEC-06/07/08 are also verified by ATF. |
| SEC-11 | Personal-data REST blocked for non-admin users | ws_access=false | W-2: 11 non-admin requests → 403; REST-enabled table row and field ACLs enforced (200 own / 0 others / 404 direct) | ✅ verified |
| SEC-12 | Platform admin without a Campus360 role can't read personal fields | D-2: explicit-membership script on 73 personal ACLs (`explicit-roles.ts`) | Build tests ✅ · ACL audit: platform admin "–" ✅ · ATF security step 35 ⏳ | ✅ built · ⏳ deploy + ATF |
| SEC-13 | Aggregate counts don't reveal unreadable records | W-3: before-query rules on it_issue, hostel_cmpl, maint_req, hostel_room, class_sess, onboard_tsk; portal counts via GlideRecordSecure only | 45 unit tests ✅ · build test: every REST-enabled row-conditional table has a rule ✅ · ATF portal + native rev 3 ⏳ | ✅ built · ⏳ deploy + ATF |
| SEC-14 | Audit history doesn't expose personal fields | Per-viewer history generation; sys_audit/sys_history_line REST 403 | RT-6 checks | ✅ UI history view / ⚠️ **W-4 open** (investigation only, auditing unchanged) |
| SEC-15 | Technicians work only issues of their assigned groups; wardens only complaints of their hostels; creators never change workflow status (forms, list edit, REST, scripts) | Conditional field ACLs (12 + 6 + work-notes read), IT-manager / admin field ACLs (19), before-update guard BRs (2), portal server check | Unit 17 + build 25 ✅ · ATF "C360 Security - Native workflow boundaries and statistics (rev 3)" ⏳ · manual M27–M30 ⏳ | ✅ built · ⏳ deploy + ATF |
| SEC-16 | Students always see their own allocated room, even when full | `acl-hostel-room-read-own` + `ownActiveRoomIds()`; room query rule includes own room | Unit ✅ · ATF rev 3 (full single room → readable, complaint 201) ⏳ | ✅ built (fixes portal full-room defect) |
| SEC-17 | Cancel requires a work note; resolve requires notes; history preserved | Portal `planIssueAction` / `planComplaintAction`; ordinary audited updates (no setWorkflow / autoSysFields in portal; guards abort only) | Unit ✅ · build ✅ · ATF portal + rev 3 (sys_mod_count, journal, sys_updated_by) ⏳ · manual M23/M24 (sys_audit) | ✅ built |
| UX-02 | ServiceNow-native React portal using the existing backend | UI page `x_774308_campus360_portal.do`, scripted REST `/api/x_774308_campus360/portal` (18 routes, GlideRecordSecure only) | Unit/build ✅ · ATF portal (7 personas) ✅ 23/23 (rev 3.1) · manual M1–M26 ⏳ browser | ✅ deployed (rev 3.1) |
| AT-01/02/05, IT-09 (ATF) | Attendance duplicates, immutability, escalation authorisation | – | ATF "C360 Integrity" 19/19 | ✅ verified |
| DEP-01 | Parts 2+3 deployed to dev382380 without demo data or platform changes | – | Post-deployment verification | ✅ 2026-11-11 (26 tables, 13 roles, 9 groups, 390 ACLs, 24/24 unique indexes) |
| AT-01/02 (runtime) | Duplicate attendance blocked on the live database | stu_attend, fac_attend | Manual integrity check | ✅ Unique key violation on second insert |
| AT-05 (runtime) | Attendance not deletable, even by admin | ACL | Manual integrity check | ✅ |
| IT-09 (runtime) | Escalation link write-once | it_issue.escalated_incident | Manual integrity check | ✅ |
| SEC-06 | Advisors and HODs keep authorised access | Declarative ACLs (advisor.user, department.hod.user) | ATF: facadvisor, hod | ✅ |
| SEC-07 | Wardens view **only** residents of their hostels (RL-04) | student ← room_alloc (active/requested) ← hostel_room ← hostel (warden / assistant) | Unit: 8 cases ✅ · ATF: wardena, wardenb | ✅ built · ⏳ ATF run |
| SEC-08 | Guardian contact follows restricted-field rules (RL-04g) | Field script ACLs on guardian_name / guardian_phone, active residents only, admin override off | Unit: 4 cases ✅ · ATF: wardena / wardenb fields | ✅ built · ⏳ ATF run |
| SEC-09 | Invalid, empty or malicious references fail closed; no circular ACLs | isValidSysId; GlideRecord lookups inside ACLs | Unit: 57 cases ✅ | ✅ |
| SEC-10 | Admin access doesn't expose personal fields beyond approved roles | admin override off on all sensitive-field ACLs | Build-config test ✅ · ATF: platadmin, admin | ✅ built · ⏳ ATF run |
| SEC-02 | Sensitive data protected | 15 sensitive fields × read/write/query ACLs; restricted form sections; excluded from lists | TC-SEC-02 Leadership and HOD can't see DOB | ✅ |
| SEC-03 | Audit | audit=true on 12 tables | TC-SEC-03 Audit history created | ✅ |
| SEC-04 | Personal data not exposed over REST | ws_access=false on 8 tables | Build-config test ✅ · ATF REST step · RT-5 manual 403 check | ✅ |
| PLT-01 | No global table modification | No augments or overrides on non-scope tables (validated) | Build validation | ✅ |
| PLT-02 | Reuse platform features | sys_user, groups, cmn_location, cmn_department, task, approvals, alm, cmdb, incident | – | ✅ |
| SR-01 | Service Catalog-based requests | Campus360 catalog, producers, items | TC-SR-01 Each item creates the correct record | ⏳ P10 |
| UX-01 | Student, faculty and admin interfaces | Admin navigator (48 modules) ✅; portals | TC-UX-01 Module visibility by role | ✅ admin · ⏳ P11 |
| DM-01 | **Demo data optional and off by default; `c360.` users with example.edu emails** | `$meta.installMethod: 'demo'` only; property demo.enabled=false | TC-DM-01 Clean install has no demo rows | ✅ none shipped · ⏳ P13 |
| NT-01 | Notifications | EmailNotification | TC-NT-* | ⏳ P12 |
| RP-01 | Reports and dashboards | Dashboard (par_dashboard), DatabaseView | TC-RP-* | ⏳ P12 |
| IM-01 | Data import | ImportSet transform maps | TC-IM-* | ⏳ P13 |
