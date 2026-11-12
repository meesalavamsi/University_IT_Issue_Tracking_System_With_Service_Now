# Campus360: Database Schema

> **Status:** Design for approval (Part 1). Nothing in this document has been built yet.
> **Scope:** `x_774308_campus360` · **Instance:** dev382380 (Australia release, Patch 7) · **SDK:** 4.14.0

## 0. Conventions

| Rule | Value / reason |
|---|---|
| Table name | `x_774308_campus360_<suffix>`. The SDK limits table names to **30 characters**, and the prefix uses 19, so every suffix is **11 characters or fewer**. Labels are full English names. |
| Column names | Columns on Campus360 tables have no prefix (the table already carries ownership). Campus360 adds **no columns to platform tables** (no `augments`), so no global table is changed. |
| Column types | Only Fluent column APIs supported by SDK 4.14 (`StringColumn`, `ReferenceColumn`, `ChoiceColumn`, ...). |
| Task tables | Six transactional tables extend `task`. They inherit `number`, `state`, `priority`, `impact`, `urgency`, `assignment_group`, `assigned_to`, `opened_by`, `opened_at`, `closed_at`, `close_notes`, `work_notes`, `comments`, `location`, `cmdb_ci`, `parent`, `approval`, `due_date`, `watch_list` and other task fields. Inherited fields are **not** redefined. They are only changed through `OverrideColumn` or `ChoiceSet`. |
| Auto-numbering | Through the table's `autoNumber` property. Prefixes were checked against the `sys_number` table on the instance; none are in use. |
| Uniqueness | Enforced with **unique database indexes** (`index: [{ unique: true, element: [...] }]`). This covers duplicate attendance, enrollment and so on. Business rules add a friendly error message, but the index is the final guarantee. |
| Sensitive data | Marked **S** below. These fields are protected by field-level ACLs (read, write, `query_range`, `query_match`). See ROLE_PERMISSION_MATRIX.md. |
| Auditing | `audit: true` on every table that holds personal, attendance or allocation data. |
| Web services | `allowWebServiceAccess: false` on tables with personal data. Portals use server-side widget scripts, not the REST Table API. Imports use Import Sets, not REST. |

Legend: **M** = mandatory · **U** = unique · **RO** = read-only (set by logic) · **S** = sensitive · **Idx** = indexed

Let `P = x_774308_campus360_` below.

---

## 1. Table inventory (26 tables)

| # | Table name | Label | Extends | Number | Module |
|---|---|---|---|---|---|
| 1 | `x_774308_campus360_department` | Department | – | – | Department Mgmt |
| 2 | `x_774308_campus360_acad_term` | Academic Term | – | – | Academic |
| 3 | `x_774308_campus360_program` | Academic Program | – | – | Student Mgmt |
| 4 | `x_774308_campus360_course` | Course | – | – | Academic |
| 5 | `x_774308_campus360_course_sec` | Course Section | – | – | Academic / Attendance |
| 6 | `x_774308_campus360_enrollment` | Course Enrollment | – | – | Academic / Attendance |
| 7 | `x_774308_campus360_student` | Student | – | – | Student Mgmt |
| 8 | `x_774308_campus360_student_reg` | Student Registration | **task** | REG | Student Registration |
| 9 | `x_774308_campus360_faculty` | Faculty | – | – | Faculty Mgmt |
| 10 | `x_774308_campus360_fac_onboard` | Faculty Onboarding | **task** | ONB | Faculty Onboarding |
| 11 | `x_774308_campus360_onboard_tsk` | Onboarding Task | **task** | OBT | Faculty Onboarding |
| 12 | `x_774308_campus360_onb_tmpl` | Onboarding Task Template | – | – | Faculty Onboarding |
| 13 | `x_774308_campus360_technician` | Technician | – | – | IT Issue Tracking |
| 14 | `x_774308_campus360_issue_cat` | Issue Category | – | – | IT Issue Tracking |
| 15 | `x_774308_campus360_issue_sub` | Issue Subcategory | – | – | IT Issue Tracking |
| 16 | `x_774308_campus360_it_issue` | IT Issue | **task** | ITI | **IT Issue Tracking (core)** |
| 17 | `x_774308_campus360_hostel` | Hostel | – | – | Hostel |
| 18 | `x_774308_campus360_hostel_room` | Hostel Room | – | – | Hostel |
| 19 | `x_774308_campus360_room_alloc` | Room Allocation | – | HAL | Hostel |
| 20 | `x_774308_campus360_hostel_cmpl` | Hostel Complaint | **task** | HCP | Hostel |
| 21 | `x_774308_campus360_laboratory` | Laboratory | – | – | Laboratory |
| 22 | `x_774308_campus360_maint_req` | Maintenance Request | **task** | MNT | Infrastructure |
| 23 | `x_774308_campus360_pm_schedule` | Preventive Maintenance Plan | – | – | Infrastructure |
| 24 | `x_774308_campus360_class_sess` | Class Session | – | SES | Student Attendance |
| 25 | `x_774308_campus360_stu_attend` | Student Attendance | – | – | Student Attendance |
| 26 | `x_774308_campus360_fac_attend` | Faculty Attendance | – | – | Faculty Attendance |

**Platform tables reused (not duplicated):** `sys_user`, `sys_user_group`, `sys_user_role`, `cmn_location`, `cmn_department`, `core_company`, `alm_asset`, `alm_hardware`, `cmdb_ci`, `cmdb_ci_computer`, `cmdb_ci_wap_network`, `incident`, `task`, `sysapproval_approver`, `sc_catalog`, `sc_category`, `sc_cat_item`, `sc_cat_item_producer`, `sc_req_item`, `sc_task`, `contract_sla`, `task_sla`, `cmn_schedule`. See ARCHITECTURE.md §4 for the reasoning behind each.

---

## 2. Academic structure

### 2.1 `x_774308_campus360_department` (Department)
Display: `name` · Audit: no · Extensible: no

| Column | Label | Type | Details | Flags |
|---|---|---|---|---|
| code | Code | StringColumn | maxLength 10, e.g. `CSE` | M, U |
| name | Name | StringColumn | maxLength 100 | M, U |
| hod | Head of Department | ReferenceColumn | → `faculty`; qualifier `department=<this>^status=active` | |
| platform_dept | Platform Department | ReferenceColumn | → `cmn_department`. Links to the platform department so `sys_user.department` and `alm_asset.department` stay consistent. | |
| building | Building | ReferenceColumn | → `cmn_location` | |
| email | Department Email | EmailColumn | | |
| phone | Phone | StringColumn | maxLength 40 | |
| established_year | Established | IntegerColumn | min 1800, max 2100 | |
| description | Description | MultiLineTextColumn | maxLength 4000 | |
| active | Active | BooleanColumn | default true | |

Indexes: unique(`code`), unique(`name`).

### 2.2 `x_774308_campus360_acad_term` (Academic Term)
Display: `name`

| Column | Label | Type | Details | Flags |
|---|---|---|---|---|
| name | Name | StringColumn | maxLength 60, e.g. `2026-27 Odd Semester` | M, U |
| academic_year | Academic Year | StringColumn | maxLength 9, format `YYYY-YY` (checked by a business rule) | M |
| term_type | Term Type | ChoiceColumn | `odd` Odd · `even` Even · `summer` Summer | M |
| start_date | Start Date | DateColumn | | M |
| end_date | End Date | DateColumn | must be after start_date (business rule) | M |
| is_current | Current Term | BooleanColumn | Only one term can be current (business rule clears the others). | |
| registration_open | Registration Open | BooleanColumn | Controls the student registration record producer. | |
| active | Active | BooleanColumn | default true | |

Indexes: unique(`name`), unique(`academic_year`,`term_type`).

### 2.3 `x_774308_campus360_program` (Academic Program)
Display: `name`

| Column | Label | Type | Details | Flags |
|---|---|---|---|---|
| code | Code | StringColumn | maxLength 20, e.g. `BTECH-CSE` | M, U |
| name | Name | StringColumn | maxLength 120 | M |
| department | Department | ReferenceColumn | → `department` | M, Idx |
| degree_level | Degree Level | ChoiceColumn | `diploma` · `ug` Undergraduate · `pg` Postgraduate · `phd` Doctoral · `certificate` | M |
| duration_years | Duration (Years) | IntegerColumn | min 1, max 6 | M |
| total_semesters | Total Semesters | IntegerColumn | min 1, max 12 | M |
| intake_capacity | Annual Intake | IntegerColumn | min 0 | |
| active | Active | BooleanColumn | default true | |

Indexes: unique(`code`), index(`department`).

### 2.4 `x_774308_campus360_course` (Course)
Display: `name`

| Column | Label | Type | Details | Flags |
|---|---|---|---|---|
| code | Course Code | StringColumn | maxLength 20, e.g. `CS301` | M, U |
| name | Course Name | StringColumn | maxLength 120 | M |
| department | Offering Department | ReferenceColumn | → `department` | M, Idx |
| program | Program | ReferenceColumn | → `program` (empty for electives open to every program) | |
| semester_no | Semester | IntegerColumn | min 1, max 12 | |
| credits | Credits | DecimalColumn | 0–10 | M |
| course_type | Course Type | ChoiceColumn | `theory` · `lab` · `theory_lab` · `elective` · `project` | M |
| min_attendance_pct | Min. Attendance % | IntegerColumn | default 75, min 0, max 100. Overrides the system property for this course. | |
| active | Active | BooleanColumn | default true | |

Indexes: unique(`code`), index(`department`).

### 2.5 `x_774308_campus360_course_sec` (Course Section)
One course offered in one term for one section, taught by one faculty member. Display: `name`.

| Column | Label | Type | Details | Flags |
|---|---|---|---|---|
| name | Name | StringColumn | maxLength 80. **RO**; a business rule builds it as `<course.code>-<section> (<term.name>)`. | RO |
| course | Course | ReferenceColumn | → `course` | M |
| term | Academic Term | ReferenceColumn | → `acad_term` | M |
| section | Section | StringColumn | maxLength 5, e.g. `A` | M |
| faculty | Instructor | ReferenceColumn | → `faculty`; qualifier `status=active` | M, Idx |
| co_instructors | Co-Instructors | ListColumn | → `faculty` | |
| laboratory | Laboratory | ReferenceColumn | → `laboratory` (lab courses) | |
| room | Classroom | ReferenceColumn | → `cmn_location` | |
| max_students | Max Students | IntegerColumn | min 1 | M |
| enrolled_count | Enrolled | IntegerColumn | Maintained by a business rule on `enrollment`. | RO |
| status | Status | ChoiceColumn | `planned` · `active` · `completed` · `cancelled` (default planned) | M |

Indexes: **unique(`course`,`term`,`section`)**, index(`faculty`), index(`term`).

### 2.6 `x_774308_campus360_enrollment` (Course Enrollment)
Audit: **yes**

| Column | Label | Type | Details | Flags |
|---|---|---|---|---|
| student | Student | ReferenceColumn | → `student` | M |
| course_section | Course Section | ReferenceColumn | → `course_sec` | M |
| enrolled_on | Enrolled On | DateColumn | default today | |
| status | Status | ChoiceColumn | `enrolled` · `dropped` · `completed` · `failed` · `withdrawn` (default enrolled) | M |
| sessions_held | Sessions Held | IntegerColumn | | RO |
| sessions_attended | Sessions Attended | IntegerColumn | Present, late and on-duty all count as attended. | RO |
| attendance_pct | Attendance % | DecimalColumn | Recalculated asynchronously after each attendance change. | RO |
| exam_eligible | Exam Eligible | BooleanColumn | attendance_pct ≥ course.min_attendance_pct | RO |

Indexes: **unique(`student`,`course_section`)**, index(`course_section`).
A business rule rejects the enrollment when `course_sec.enrolled_count ≥ max_students`, when the student's status isn't active, or when the section's status isn't planned or active.

---

## 3. People

### 3.1 `x_774308_campus360_student` (Student)
A profile **attached to** `sys_user`. The user record holds name, email, photo and login, which are **not duplicated** here. Display: `student_id`. Audit: **yes** · Web services: **off**.

| Column | Label | Type | Details | Flags |
|---|---|---|---|---|
| user | User | ReferenceColumn | → `sys_user`; cascadeRule `restrict` | M, U |
| student_id | Student ID / Roll No. | StringColumn | maxLength 20 | M, U |
| department | Department | ReferenceColumn | → `department` | M, Idx |
| program | Program | ReferenceColumn | → `program`; qualifier `department=<department>` | M, Idx |
| admission_term | Admission Term | ReferenceColumn | → `acad_term` | |
| batch | Batch | StringColumn | maxLength 9, e.g. `2024-28` | |
| current_semester | Current Semester | IntegerColumn | min 1, max 12 | |
| year_of_study | Year of Study | IntegerColumn | min 1, max 6 | |
| section | Section | StringColumn | maxLength 5 | |
| advisor | Faculty Advisor | ReferenceColumn | → `faculty` | Idx |
| status | Status | ChoiceColumn | `active` · `on_leave` · `suspended` · `graduated` · `withdrawn` (default active) | M, Idx |
| admission_date | Admission Date | DateColumn | | |
| hostel_resident | Hostel Resident | BooleanColumn | Maintained by the `room_alloc` business rule. | RO |
| registration | Source Registration | ReferenceColumn | → `student_reg` | RO |
| date_of_birth | Date of Birth | DateColumn | | **S** |
| gender | Gender | ChoiceColumn | `female` · `male` · `non_binary` · `undisclosed`. Used for hostel eligibility. | **S** |
| blood_group | Blood Group | ChoiceColumn | A+, A-, B+, B-, AB+, AB-, O+, O- | **S** |
| personal_phone | Personal Phone | StringColumn | maxLength 40 | **S** |
| personal_email | Personal Email | EmailColumn | | **S** |
| home_address | Home Address | MultiLineTextColumn | maxLength 1000 | **S** |
| guardian_name | Guardian Name | StringColumn | maxLength 100 | **S** |
| guardian_relation | Guardian Relation | ChoiceColumn | `father` · `mother` · `guardian` · `spouse` · `other` | **S** |
| guardian_phone | Guardian Phone | StringColumn | maxLength 40 | **S** |

Indexes: unique(`user`), unique(`student_id`), index(`department`,`program`), index(`status`), index(`advisor`).
**Data minimisation:** no national ID, financial, caste, religion or medical-history fields are stored.

### 3.2 `x_774308_campus360_faculty` (Faculty)
Display: `employee_id` · Audit: **yes** · Web services: **off**

| Column | Label | Type | Details | Flags |
|---|---|---|---|---|
| user | User | ReferenceColumn | → `sys_user`; cascadeRule `restrict` | M, U |
| employee_id | Employee ID | StringColumn | maxLength 20 | M, U |
| department | Department | ReferenceColumn | → `department` | M, Idx |
| designation | Designation | ChoiceColumn | `professor` · `assoc_professor` · `asst_professor` · `lecturer` · `lab_instructor` · `visiting` · `adjunct` | M |
| employment_type | Employment Type | ChoiceColumn | `permanent` · `contract` · `visiting` · `adjunct` | M |
| joining_date | Joining Date | DateColumn | | |
| status | Status | ChoiceColumn | `onboarding` · `active` · `on_leave` · `sabbatical` · `resigned` · `retired` (default onboarding) | M, Idx |
| highest_qualification | Highest Qualification | ChoiceColumn | `phd` · `mphil` · `masters` · `bachelors` · `other` | |
| specialization | Specialization | StringColumn | maxLength 200 | |
| experience_years | Experience (Years) | IntegerColumn | min 0, max 60 | |
| office_location | Office | ReferenceColumn | → `cmn_location` | |
| onboarding | Source Onboarding | ReferenceColumn | → `fac_onboard` | RO |
| date_of_birth | Date of Birth | DateColumn | | **S** |
| personal_phone | Personal Phone | StringColumn | maxLength 40 | **S** |
| personal_email | Personal Email | EmailColumn | | **S** |
| home_address | Home Address | MultiLineTextColumn | maxLength 1000 | **S** |
| emergency_contact | Emergency Contact Name | StringColumn | maxLength 100 | **S** |
| emergency_phone | Emergency Contact Phone | StringColumn | maxLength 40 | **S** |

Indexes: unique(`user`), unique(`employee_id`), index(`department`), index(`status`).
No salary or payroll data is stored. Payroll is out of scope.

### 3.3 `x_774308_campus360_technician` (Technician)
Display: `user`

| Column | Label | Type | Details | Flags |
|---|---|---|---|---|
| user | User | ReferenceColumn | → `sys_user` | M, U |
| employee_id | Employee ID | StringColumn | maxLength 20 | |
| primary_group | Primary Group | ReferenceColumn | → `sys_user_group`; qualifier `nameSTARTSWITHC360` | M |
| skills | Skills (Categories) | ListColumn | → `issue_cat` | |
| availability | Availability | ChoiceColumn | `available` · `busy` · `off_shift` · `on_leave` (default available) | M |
| shift | Shift | ChoiceColumn | `general` · `morning` · `evening` · `night` | |
| max_open_issues | Max Open Issues | IntegerColumn | default 10, min 1 | |
| open_issue_count | Open Issues | IntegerColumn | Maintained by an `it_issue` business rule; reconciled nightly. | RO |
| base_location | Base Location | ReferenceColumn | → `cmn_location` | |
| active | Active | BooleanColumn | default true | |

Indexes: unique(`user`), index(`primary_group`,`availability`).
Group membership itself stays in `sys_user_grmember`. This table adds only the workload and skill data that the platform doesn't model.

---

## 4. Core IT Issue Tracking

### 4.1 `x_774308_campus360_issue_cat` (Issue Category)
Configuration data that drives routing, portal display and form rules. Display: `name`.

| Column | Label | Type | Details | Flags |
|---|---|---|---|---|
| code | Code | StringColumn | maxLength 40 | M, U |
| name | Name | StringColumn | maxLength 80 | M |
| description | Description | MultiLineTextColumn | maxLength 1000 | |
| assignment_group | Assignment Group | ReferenceColumn | → `sys_user_group` | M |
| default_impact | Default Impact | ChoiceColumn | `1` High · `2` Medium · `3` Low (default 3) | |
| default_urgency | Default Urgency | ChoiceColumn | `1` High · `2` Medium · `3` Low (default 3) | |
| requires_asset | Asset Required | BooleanColumn | Makes `affected_asset` mandatory (UI policy and data policy). | |
| requires_lab | Lab Required | BooleanColumn | | |
| requires_hostel | Hostel Required | BooleanColumn | | |
| portal_visible | Show on Portal | BooleanColumn | default true | |
| icon | Portal Icon | StringColumn | maxLength 40 (Font Awesome name) | |
| order | Order | IntegerColumn | | |
| active | Active | BooleanColumn | default true | |

**Seed rows (configuration, not demo):**

| code | name | default group |
|---|---|---|
| `hardware` | Hardware | C360 Desktop & Hardware Support |
| `software` | Software | C360 IT Service Desk |
| `network` | Network (Wired) | C360 Network & Wi-Fi Team |
| `campus_wifi` | Campus Wi-Fi | C360 Network & Wi-Fi Team |
| `hostel_wifi` | Hostel Wi-Fi | C360 Network & Wi-Fi Team (requires_hostel) |
| `computer_laptop` | Computer & Laptop | C360 Desktop & Hardware Support (requires_asset) |
| `lab_equipment` | Laboratory Equipment | C360 Lab Support (requires_lab) |
| `building_electrical` | Building & Electrical | C360 Facilities & Electrical |

### 4.2 `x_774308_campus360_issue_sub` (Issue Subcategory)
Display: `name`

| Column | Label | Type | Details | Flags |
|---|---|---|---|---|
| category | Category | ReferenceColumn | → `issue_cat` | M |
| code | Code | StringColumn | maxLength 40 | M |
| name | Name | StringColumn | maxLength 80 | M |
| assignment_group | Override Group | ReferenceColumn | → `sys_user_group` (optional override of the category group) | |
| active | Active | BooleanColumn | default true | |

Indexes: unique(`category`,`code`).
Example seeds: hardware → printer, projector, peripheral; software → os, licensed_software, lms_access, email; network → lan_port, vpn; campus_wifi → no_signal, slow, auth_failure; building_electrical → power_outage, lighting, socket, ac_fan.

### 4.3 `x_774308_campus360_it_issue` (IT Issue): **core table**
Extends **`task`** · autoNumber `ITI` 1000, 7 digits · Audit: yes

**Inherited task fields used:** number, short_description (M), description, state, impact, urgency, priority, assignment_group, assigned_to, opened_by, opened_at, closed_at, closed_by, close_notes, work_notes, comments, location (building), cmdb_ci (affected CI, such as a Wi-Fi access point), parent, watch_list, due_date, active.

**New columns:**

| Column | Label | Type | Details | Flags |
|---|---|---|---|---|
| caller | Reported For | ReferenceColumn | → `sys_user`; default `javascript:gs.getUserID()` | M, Idx |
| reporter_type | Reporter Type | ChoiceColumn | `student` · `faculty` · `staff` · `guest`. Derived from the caller's roles. | RO |
| department | Department | ReferenceColumn | → `department`. Copied from the caller's student or faculty profile at creation, as a snapshot for reporting. | RO |
| category | Category | ReferenceColumn | → `issue_cat`; qualifier `active=true` | M, Idx |
| subcategory | Subcategory | ReferenceColumn | → `issue_sub`; qualifier `category=<category>^active=true` | |
| channel | Channel | ChoiceColumn | `portal` · `phone` · `email` · `walk_in` · `catalog` (default portal) | |
| room_detail | Room / Spot | StringColumn | maxLength 60 | |
| laboratory | Laboratory | ReferenceColumn | → `laboratory` | |
| hostel | Hostel | ReferenceColumn | → `hostel` | |
| hostel_room | Hostel Room | ReferenceColumn | → `hostel_room`; qualifier `hostel=<hostel>` | |
| affected_asset | Affected Asset | ReferenceColumn | → `alm_asset` | |
| on_hold_reason | On Hold Reason | ChoiceColumn | `awaiting_caller` · `awaiting_parts` · `awaiting_vendor` · `scheduled_visit` | |
| resolution_code | Resolution Code | ChoiceColumn | `fixed` · `workaround` · `hardware_replaced` · `config_change` · `user_guidance` · `duplicate` · `not_reproducible` · `vendor_referral` · `referred_maintenance` | |
| resolved_by | Resolved By | ReferenceColumn | → `sys_user` | RO |
| resolved_at | Resolved At | DateTimeColumn | | RO |
| reopen_count | Reopen Count | IntegerColumn | default 0 | RO |
| escalated_incident | Escalated Incident | ReferenceColumn | → `incident`. Set by the "Escalate to Incident" UI action. | RO |

**State (`ChoiceSet` on `state` for this table):**

| Value | Label | Meaning |
|---|---|---|
| 1 | New | Logged and not yet worked |
| 2 | In Progress | Technician working |
| -5 | On Hold | Waiting on the reason in `on_hold_reason` (mandatory) |
| 6 | Resolved | Fix applied; caller can reopen within N days (`x_774308_campus360.issue.auto_close_days`) |
| 3 | Closed | Final |
| 7 | Cancelled | Final |

`OverrideColumn` on `state`: default `1`, attributes `close_states=3;7`, `default_close_state=3`.
`OverrideColumn` on `short_description`: mandatory. `assignment_group` is filled by assignment rules from `issue_cat` and `issue_sub`.

**Priority** is calculated from impact × urgency by a business rule (`C360IssueUtils.calculatePriority`):

| Impact \ Urgency | 1 High | 2 Medium | 3 Low |
|---|---|---|---|
| **1 High** | 1 Critical | 2 High | 3 Moderate |
| **2 Medium** | 2 High | 3 Moderate | 4 Low |
| **3 Low** | 3 Moderate | 4 Low | 4 Low |

Indexes: index(`caller`), index(`category`), index(`hostel`), index(`laboratory`).

---

## 5. Hostel management

### 5.1 `x_774308_campus360_hostel` (Hostel)
Display: `name`

| Column | Label | Type | Details | Flags |
|---|---|---|---|---|
| code | Code | StringColumn | maxLength 10, e.g. `BH1` | M, U |
| name | Name | StringColumn | maxLength 100 | M |
| hostel_type | Type | ChoiceColumn | `boys` · `girls` · `co_ed` · `staff` | M |
| location | Building | ReferenceColumn | → `cmn_location` | M |
| warden | Warden | ReferenceColumn | → `sys_user`; qualifier `roles=x_774308_campus360.warden` | M, Idx |
| assistant_warden | Assistant Warden | ReferenceColumn | → `sys_user` | Idx |
| floors | Floors | IntegerColumn | min 1 | |
| total_capacity | Total Beds | IntegerColumn | Sum of room capacities (business rule) | RO |
| occupied_beds | Occupied Beds | IntegerColumn | Sum of room occupancy (business rule) | RO |
| contact_phone | Office Phone | StringColumn | maxLength 40 | |
| active | Active | BooleanColumn | default true | |

Indexes: unique(`code`).

### 5.2 `x_774308_campus360_hostel_room` (Hostel Room)
Display: `name`

| Column | Label | Type | Details | Flags |
|---|---|---|---|---|
| name | Room | StringColumn | maxLength 30. Built as `<hostel.code>-<room_number>`. | RO |
| hostel | Hostel | ReferenceColumn | → `hostel` | M |
| room_number | Room Number | StringColumn | maxLength 10 | M |
| floor | Floor | IntegerColumn | min 0 | |
| room_type | Room Type | ChoiceColumn | `single` · `double` · `triple` · `quad` · `dormitory` | M |
| capacity | Bed Capacity | IntegerColumn | min 1, max 12 | M |
| occupied | Occupied Beds | IntegerColumn | default 0; maintained only by `C360HostelUtils` | RO |
| status | Status | ChoiceColumn | `available` · `full` · `maintenance` · `closed`. Available and full are set automatically; maintenance and closed are set manually. | M |
| amenities | Amenities | StringColumn | maxLength 200 | |

Indexes: **unique(`hostel`,`room_number`)**, index(`status`).
A business rule rejects any change that would make `capacity` lower than `occupied`.

### 5.3 `x_774308_campus360_room_alloc` (Room Allocation)
autoNumber `HAL` (standalone, so it defines its own `number` column with default `javascript:global.getNextObjNumberPadded();`) · Audit: **yes**

| Column | Label | Type | Details | Flags |
|---|---|---|---|---|
| number | Number | StringColumn | maxLength 40, auto-numbered | RO |
| student | Student | ReferenceColumn | → `student`; qualifier `status=active` | M, Idx |
| hostel_room | Room | ReferenceColumn | → `hostel_room`; qualifier `status=available^hostel.active=true` | M, Idx |
| term | Academic Term | ReferenceColumn | → `acad_term` | M |
| bed_label | Bed | StringColumn | maxLength 5, e.g. `B2` | |
| start_date | Check-in Date | DateColumn | | M |
| end_date | Planned Check-out | DateColumn | | |
| status | Status | ChoiceColumn | `requested` · `active` · `vacated` · `cancelled` · `rejected` (default requested) | M |
| vacated_on | Vacated On | DateColumn | | |
| allocated_by | Allocated By | ReferenceColumn | → `sys_user` | RO |
| remarks | Remarks | MultiLineTextColumn | maxLength 1000 | |

Indexes: index(`hostel_room`,`status`), index(`student`,`status`). There's no unique index, because "at most N *active* allocations per room" is conditional uniqueness, which a database index can't express. The rules below enforce it instead.

**Capacity enforcement** (before-insert/update business rule → `C360HostelUtils.validateAllocation`), applied whenever status becomes `active`:
1. Count active allocations for the room, excluding this one. If the count is at or above `hostel_room.capacity`, abort with "Room is full".
2. If the student already has another active allocation, abort.
3. The room must not be in `maintenance` or `closed` status.
4. The student's gender must be allowed by `hostel.hostel_type`. This is checked server-side so the sensitive field never reaches the browser.
5. After insert or update, `occupied` and `status` are recalculated with an aggregate count, never by adding or subtracting. The hostel totals are then recalculated.
6. A nightly scheduled job, **C360 Hostel Occupancy Reconcile**, recounts every room. This covers the small chance of two allocations being saved at the same moment.

### 5.4 `x_774308_campus360_hostel_cmpl` (Hostel Complaint)
Extends **`task`** · autoNumber `HCP` · Audit: yes

| Column | Label | Type | Details | Flags |
|---|---|---|---|---|
| caller | Raised By | ReferenceColumn | → `sys_user`; default current user | M |
| student | Student | ReferenceColumn | → `student`; filled from the caller | RO |
| hostel | Hostel | ReferenceColumn | → `hostel` | M, Idx |
| hostel_room | Room | ReferenceColumn | → `hostel_room`; qualifier `hostel=<hostel>` | |
| complaint_type | Complaint Type | ChoiceColumn | `plumbing` · `electrical` · `furniture` · `cleanliness` · `pest_control` · `mess_food` · `water_supply` · `security` · `roommate` · `noise` · `other` | M |
| is_confidential | Confidential | BooleanColumn | Visible to the warden and admin only. | |

State ChoiceSet: 1 New · 2 In Progress · -5 On Hold · 6 Resolved · 3 Closed · 7 Cancelled.
**Wi-Fi in a hostel is not a complaint type.** It's logged as an `it_issue` with category `hostel_wifi`, so the network team owns it and the work isn't split across two places.

---

## 6. Laboratory and infrastructure

### 6.1 `x_774308_campus360_laboratory` (Laboratory)
Display: `name`

| Column | Label | Type | Details | Flags |
|---|---|---|---|---|
| code | Code | StringColumn | maxLength 20 | M, U |
| name | Name | StringColumn | maxLength 100 | M |
| department | Department | ReferenceColumn | → `department` | M, Idx |
| location | Room | ReferenceColumn | → `cmn_location`. **This links the lab to its assets and CIs** (alm_asset.location and cmdb_ci.location). | M |
| lab_type | Lab Type | ChoiceColumn | `computer` · `electronics` · `electrical` · `mechanical` · `physics` · `chemistry` · `biology` · `civil` · `language` · `research` · `other` | M |
| lab_incharge | Lab In-charge | ReferenceColumn | → `faculty` | Idx |
| lab_assistant | Lab Assistant | ReferenceColumn | → `sys_user` | |
| support_group | IT Support Group | ReferenceColumn | → `sys_user_group` (default C360 Lab Support) | |
| seating_capacity | Seating Capacity | IntegerColumn | min 0 | |
| workstation_count | Workstations | IntegerColumn | min 0 | |
| operating_hours | Operating Hours | StringColumn | maxLength 60 | |
| status | Status | ChoiceColumn | `operational` · `partial` · `maintenance` · `closed` | M |
| safety_notes | Safety Notes | MultiLineTextColumn | maxLength 4000 | |
| active | Active | BooleanColumn | default true | |

Indexes: unique(`code`), index(`department`).
Lab equipment is **not** a custom table. It lives in `alm_hardware` and `cmdb_ci_*` with `location = laboratory.location`, and appears on the lab form through explicit relationships ("Lab Assets", "Lab CIs").

### 6.2 `x_774308_campus360_maint_req` (Maintenance Request)
Extends **`task`** · autoNumber `MNT` · Audit: yes
Work orders for facilities. They can be created directly (staff), from an IT issue, from a hostel complaint (`parent`), or by the preventive maintenance generator.

| Column | Label | Type | Details | Flags |
|---|---|---|---|---|
| caller | Requested By | ReferenceColumn | → `sys_user` | M |
| maintenance_type | Maintenance Type | ChoiceColumn | `electrical` · `plumbing` · `civil` · `hvac` · `carpentry` · `painting` · `cleaning` · `it_infra` · `network_cabling` · `equipment_service` · `other` | M |
| request_type | Request Type | ChoiceColumn | `corrective` · `preventive` · `inspection` · `installation` (default corrective) | M |
| laboratory | Laboratory | ReferenceColumn | → `laboratory` | |
| hostel | Hostel | ReferenceColumn | → `hostel` | |
| hostel_room | Hostel Room | ReferenceColumn | → `hostel_room` | |
| asset | Asset | ReferenceColumn | → `alm_asset` | |
| pm_plan | PM Plan | ReferenceColumn | → `pm_schedule` | RO |
| scheduled_start | Scheduled Start | DateTimeColumn | | |
| scheduled_end | Scheduled End | DateTimeColumn | | |
| vendor | Vendor | ReferenceColumn | → `core_company`; qualifier `vendor=true` | |
| estimated_cost | Estimated Cost | DecimalColumn | | |
| actual_cost | Actual Cost | DecimalColumn | | |
| safety_risk | Safety Risk | ChoiceColumn | `none` · `low` · `medium` · `high` | |
| downtime_required | Downtime Required | BooleanColumn | | |

Inherited `location` (M through OverrideColumn) is the building or area. State ChoiceSet: 1 New · 10 Scheduled · 2 In Progress · -5 On Hold · 3 Completed · 7 Cancelled.

### 6.3 `x_774308_campus360_pm_schedule` (Preventive Maintenance Plan)
Display: `name`

| Column | Label | Type | Details | Flags |
|---|---|---|---|---|
| name | Name | StringColumn | maxLength 100 | M |
| maintenance_type | Maintenance Type | ChoiceColumn | same choices as `maint_req` | M |
| location | Location | ReferenceColumn | → `cmn_location` | M |
| laboratory | Laboratory | ReferenceColumn | → `laboratory` | |
| asset | Asset | ReferenceColumn | → `alm_asset` | |
| frequency | Frequency | ChoiceColumn | `weekly` · `monthly` · `quarterly` · `half_yearly` · `yearly` | M |
| next_due | Next Due | DateColumn | Moved forward by the generator. | M |
| lead_days | Lead Days | IntegerColumn | default 3 (the work order is created this many days before it's due) | |
| assignment_group | Assignment Group | ReferenceColumn | → `sys_user_group` | M |
| instructions | Instructions | MultiLineTextColumn | maxLength 4000 | |
| active | Active | BooleanColumn | default true | |

---

## 7. Attendance

### 7.1 `x_774308_campus360_class_sess` (Class Session)
autoNumber `SES` (standalone `number` column) · Display: `number`

| Column | Label | Type | Details | Flags |
|---|---|---|---|---|
| number | Number | StringColumn | auto-numbered | RO |
| course_section | Course Section | ReferenceColumn | → `course_sec`; qualifier `status=active` | M |
| session_date | Date | DateColumn | | M, Idx |
| start_time | Start Time | TimeColumn | | M |
| end_time | End Time | TimeColumn | must be after start_time | M |
| faculty | Taken By | ReferenceColumn | → `faculty`. Defaults to the section instructor and can be a substitute. | M, Idx |
| session_type | Type | ChoiceColumn | `lecture` · `lab` · `tutorial` · `seminar` · `exam` | M |
| room | Room | ReferenceColumn | → `cmn_location` | |
| laboratory | Laboratory | ReferenceColumn | → `laboratory` | |
| topic | Topic Covered | StringColumn | maxLength 200 | |
| status | Status | ChoiceColumn | `scheduled` · `held` · `cancelled` · `rescheduled` (default scheduled) | M |
| attendance_status | Attendance Status | ChoiceColumn | `not_started` · `in_progress` · `submitted` · `locked` (default not_started) | RO |
| submitted_at | Submitted At | DateTimeColumn | | RO |
| present_count | Present | IntegerColumn | | RO |
| absent_count | Absent | IntegerColumn | | RO |

Indexes: **unique(`course_section`,`session_date`,`start_time`)**, index(`faculty`,`session_date`).
A business rule rejects a session that overlaps another session for the same faculty member at the same time.

### 7.2 `x_774308_campus360_stu_attend` (Student Attendance)
Audit: **yes** · Web services: off

| Column | Label | Type | Details | Flags |
|---|---|---|---|---|
| class_session | Class Session | ReferenceColumn | → `class_sess` | M |
| student | Student | ReferenceColumn | → `student` | M, Idx |
| status | Status | ChoiceColumn | `present` · `absent` · `late` · `excused` · `medical` · `on_duty` (default present) | M |
| marked_by | Marked By | ReferenceColumn | → `sys_user` | RO |
| marked_at | Marked At | DateTimeColumn | | RO |
| remarks | Remarks | StringColumn | maxLength 200 | |
| locked | Locked | BooleanColumn | Set when the edit window closes; only `registrar` and `hod` can change it after that, and must give a reason in `remarks`. | RO |

Indexes: **unique(`class_session`,`student`)** prevents duplicate attendance at database level. index(`student`).
Business rules:
- The student must have an `enrolled` enrollment in `class_session.course_section`. This blocks marking students from outside the class.
- Marking is not allowed for future sessions or sessions in `cancelled` status.
- Edits are not allowed after `x_774308_campus360.attendance.edit_window_hours` (default 48) or when `locked=true`, unless the user has the registrar or HOD role.
- After any change, `enrollment.attendance_pct` and `class_sess` counts are recalculated asynchronously.

### 7.3 `x_774308_campus360_fac_attend` (Faculty Attendance)
Audit: **yes** · Web services: off

| Column | Label | Type | Details | Flags |
|---|---|---|---|---|
| faculty | Faculty | ReferenceColumn | → `faculty` | M |
| attendance_date | Date | DateColumn | default today | M, Idx |
| status | Status | ChoiceColumn | `present` · `absent` · `half_day` · `on_leave` · `on_duty` · `holiday` · `wfh` | M |
| leave_type | Leave Type | ChoiceColumn | `casual` · `sick` · `earned` · `duty` · `maternity` · `paternity` · `other`. Mandatory when status is on_leave (UI policy and data policy). | |
| check_in | Check-in | DateTimeColumn | | |
| check_out | Check-out | DateTimeColumn | must be after check_in | |
| work_hours | Work Hours | DecimalColumn | check_out minus check_in | RO |
| source | Source | ChoiceColumn | `self` · `biometric_import` · `admin` (default self) | RO |
| approved_by | Approved By | ReferenceColumn | → `sys_user` | RO |
| remarks | Remarks | StringColumn | maxLength 200 | |

Indexes: **unique(`faculty`,`attendance_date`)** allows only one record per faculty member per day. index(`attendance_date`).

---

## 8. Registration and onboarding

### 8.1 `x_774308_campus360_student_reg` (Student Registration)
Extends **`task`** · autoNumber `REG` · Audit: yes · Web services: off
Admission and enrollment application. Approval runs through `sysapproval_approver`, which the flow sets up.

| Column | Label | Type | Details | Flags |
|---|---|---|---|---|
| first_name | First Name | StringColumn | maxLength 60 | M |
| last_name | Last Name | StringColumn | maxLength 60 | M |
| applicant_email | Email | EmailColumn | | M, Idx |
| applicant_phone | Phone | StringColumn | maxLength 40 | **S** |
| date_of_birth | Date of Birth | DateColumn | | **S** |
| gender | Gender | ChoiceColumn | same choices as student | **S** |
| program | Program | ReferenceColumn | → `program`; qualifier `active=true` | M |
| admission_term | Admission Term | ReferenceColumn | → `acad_term`; qualifier `registration_open=true` | M |
| admission_category | Admission Category | ChoiceColumn | `regular` · `lateral_entry` · `transfer` · `international` · `scholarship` | M |
| previous_institution | Previous Institution | StringColumn | maxLength 200 | |
| qualifying_score | Qualifying Score % | DecimalColumn | 0–100 | |
| guardian_name | Guardian Name | StringColumn | maxLength 100 | **S** |
| guardian_phone | Guardian Phone | StringColumn | maxLength 40 | **S** |
| hostel_requested | Hostel Requested | BooleanColumn | | |
| documents_verified | Documents Verified | BooleanColumn | | |
| verification_notes | Verification Notes | MultiLineTextColumn | maxLength 2000 | |
| created_user | Created User | ReferenceColumn | → `sys_user` | RO |
| created_student | Created Student | ReferenceColumn | → `student` | RO |

State ChoiceSet: 1 Submitted · 2 Under Review · 11 Approved · 12 Rejected · 3 Enrolled (closed) · 7 Cancelled.
A business rule rejects a second application with the same `applicant_email` and `admission_term` unless the earlier one is Rejected or Cancelled.

### 8.2 `x_774308_campus360_fac_onboard` (Faculty Onboarding)
Extends **`task`** · autoNumber `ONB` · Audit: yes · Web services: off

| Column | Label | Type | Details | Flags |
|---|---|---|---|---|
| first_name | First Name | StringColumn | maxLength 60 | M |
| last_name | Last Name | StringColumn | maxLength 60 | M |
| personal_email | Personal Email | EmailColumn | | M, **S** |
| personal_phone | Personal Phone | StringColumn | maxLength 40 | **S** |
| department | Department | ReferenceColumn | → `department` | M |
| designation | Designation | ChoiceColumn | same choices as faculty | M |
| employment_type | Employment Type | ChoiceColumn | same choices as faculty | M |
| joining_date | Joining Date | DateColumn | | M |
| reporting_to | Reporting To | ReferenceColumn | → `faculty`; defaults to the department HOD | |
| office_location | Office | ReferenceColumn | → `cmn_location` | |
| laptop_required | Laptop Required | BooleanColumn | default true | |
| lab_access | Lab Access | ListColumn | → `laboratory` | |
| progress_pct | Progress % | IntegerColumn | Share of child `onboard_tsk` records that are closed. | RO |
| created_user | Created User | ReferenceColumn | → `sys_user` | RO |
| created_faculty | Created Faculty | ReferenceColumn | → `faculty` | RO |

State ChoiceSet: 1 Draft · 2 Approved / In Progress · -5 On Hold · 3 Completed · 7 Cancelled.

### 8.3 `x_774308_campus360_onboard_tsk` (Onboarding Task)
Extends **`task`** · autoNumber `OBT`. Uses `parent` → the `fac_onboard` record.

| Column | Label | Type | Details | Flags |
|---|---|---|---|---|
| onboarding | Onboarding | ReferenceColumn | → `fac_onboard` | M, Idx |
| task_type | Task Type | ChoiceColumn | `it_account` · `email_setup` · `laptop_allocation` · `id_card` · `office_allocation` · `lab_access` · `orientation` · `document_verification` · `payroll_setup` · `library_card` | M |
| sequence | Sequence | IntegerColumn | | |
| allocated_asset | Allocated Asset | ReferenceColumn | → `alm_hardware` (laptop allocation sets `assigned_to` on the asset) | |
| template | Template | ReferenceColumn | → `onb_tmpl` | RO |

### 8.4 `x_774308_campus360_onb_tmpl` (Onboarding Task Template)
Display: `short_description`

| Column | Label | Type | Details | Flags |
|---|---|---|---|---|
| task_type | Task Type | ChoiceColumn | same choices as `onboard_tsk` | M, U |
| short_description | Short Description | StringColumn | maxLength 160 | M |
| description | Instructions | MultiLineTextColumn | maxLength 4000 | |
| assignment_group | Assignment Group | ReferenceColumn | → `sys_user_group` | M |
| sequence | Sequence | IntegerColumn | | M |
| due_offset_days | Due Offset (days from joining) | IntegerColumn | may be negative | |
| condition_field | Only If | ChoiceColumn | `always` · `laptop_required` · `lab_access` (default always) | |
| active | Active | BooleanColumn | default true | |

---

## 10. Changes made during implementation (Part 2)

The schema was built as specified above, with these changes (details and reasons in [PART2_IMPLEMENTATION_REPORT.md](PART2_IMPLEMENTATION_REPORT.md) §10):

| Table | Change |
|---|---|
| student_reg | **Added** `registrar_recommendation` (choice: recommend / reject / more_info), `registrar_reviewed_by`, `registrar_reviewed_at`, `hod_approver` (RO). State set: 1 Submitted · 2 Registrar Review · **10 Pending HOD Approval** · 11 Approved · 12 Rejected · 3 Enrolled · 7 Cancelled (close states 3;7;12). |
| fac_onboard | State set: 1 Draft · **9 Awaiting Approval** · 2 In Progress · -5 On Hold · 3 Completed · **8 Rejected** · 7 Cancelled (close states 3;7;8). |
| student | `blood_group` values stored as codes `a_pos, a_neg, b_pos, b_neg, ab_pos, ab_neg, o_pos, o_neg` (labels A+ …). |
| room_alloc, class_sess | Added unique index on `number`. |
| All tables | Read-only (RO) fields use `readOnlyOption: 'display_read_only'` (read-only in the UI, updatable by server logic). |
| it_issue, hostel_cmpl, maint_req, onboard_tsk, student_reg, fac_onboard | `state` override: default `1`, attributes `close_states`, `default_close_state=3`, `default_work_state=2`. |

## 9. Default forms and lists

Following the SDK table guide, every table gets a **default form view** (`Form` API) and a **default list layout** (`List` API) when it's created in Part 2. Task-based tables use a two-column top section (number, caller, category, state, priority, assignment) and a notes section with an activity formatter. Exact layouts are part of the Part 2 deliverable.
