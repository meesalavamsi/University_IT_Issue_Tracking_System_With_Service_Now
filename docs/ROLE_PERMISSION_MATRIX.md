# Campus360: Roles, Groups and Permission Matrix

## 1. Roles (`Role` API)

All roles are scoped: `x_774308_campus360.<name>`.

| Role | Contains | Persona | Typical holders |
|---|---|---|---|
| `user` | – | Base Campus360 access (portal, own records) | Everyone who uses Campus360 |
| `student` | user | Student self-service | Enrolled students (assigned when registration is approved) |
| `faculty` | user | Teaching, marking attendance, self check-in | Teaching staff (assigned when onboarding completes) |
| `hod` | faculty | Department-wide academic oversight | Heads of department |
| `technician` | user | Works IT issues | IT support staff |
| `it_manager` | technician | IT queue, technicians, categories, SLAs | IT service desk lead |
| `warden` | user | Hostel rooms, allocations, complaints for their hostel | Wardens and assistant wardens |
| `maintenance` | user | Facilities work orders | Facilities and electrical staff |
| `lab_admin` | user | Labs, preventive maintenance plans, lab assets view | Lab administrators |
| `registrar` | user | Students, programs, courses, terms, registrations, attendance override | Registrar office |
| `faculty_admin` | user | Faculty records, onboarding, faculty attendance | HR / faculty administration |
| `leadership` | user | Read-only analytics across modules (no sensitive fields) | Dean, principal, management |
| `admin` | all of the above | Campus360 application administrator | App owner |

Platform roles reused: `admin` (platform), `itil` (only for staff who also work central IT incidents; it is **not** given to Campus360 users by default), `approver_user`, and `asset` (needed by `lab_admin`, `faculty_admin` and `technician` to update `alm_hardware`).

Licensing note: on a PDI there are no licensing limits. In production, students and faculty only *request* through the portal and approve, so they wouldn't count as fulfillers. Technicians and administrators would.

## 2. Groups (`sys_user_group` records, configuration data)

| Group | Roles granted through the group (`sys_group_has_role`) | Routing |
|---|---|---|
| C360 IT Service Desk | technician | software, default IT queue |
| C360 Desktop & Hardware Support | technician, asset | hardware, computer_laptop |
| C360 Network & Wi-Fi Team | technician | network, campus_wifi, hostel_wifi |
| C360 Lab Support | technician, asset | lab_equipment |
| C360 Facilities & Electrical | maintenance | building_electrical, maint_req |
| C360 Hostel Administration | warden | hostel_cmpl |
| C360 Registrar Office | registrar | student_reg |
| C360 Faculty Onboarding Team | faculty_admin | fac_onboard, onboard_tsk |
| C360 IT Management | it_manager | Approvals and escalations |

Roles are given to people **through groups**, never directly. The exception is `student` and `faculty`, which provisioning assigns to each person individually.

## 3. Table-level permission matrix

C = create · R = read · W = write · D = delete. **own** = the user's own records; **scoped** = a row-level rule applies (see §4); – = no access.

| Table | student | faculty | hod | technician | it_manager | warden | maintenance | lab_admin | registrar | faculty_admin | leadership | admin |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| department | R | R | R, W own dept | R | R | R | R | R | CRW | R | R | CRWD |
| acad_term | R | R | R | – | – | R | – | – | CRW | R | R | CRWD |
| program | R | R | R | – | – | – | – | – | CRW | R | R | CRWD |
| course | R | R | R, W dept | – | – | – | – | – | CRW | – | R | CRWD |
| course_sec | R own | R; W own (topic, room) | CRW dept | – | – | – | – | R | CRW | – | R | CRWD |
| enrollment | R own | R own sections | R dept | – | – | – | – | – | CRW | – | R | CRWD |
| student | R own; W own contact fields (via portal) | R enrolled students + advisees (non-sensitive) | R dept (non-sensitive) | – | – | R active/requested residents (+ guardian name/phone for active residents) | – | – | CRW | – | R (non-sensitive) | CRWD |
| student_reg | – (applicants hold only `user`: C, R own) | – | R dept; approve | – | – | – | – | – | CRW | – | R | CRWD |
| faculty | R directory fields | R directory; W own contact fields | R dept | – | – | – | – | – | R | CRW | R (non-sensitive) | CRWD |
| fac_onboard | – | – | R dept; approve | – | – | – | – | – | – | CRW | R | CRWD |
| onboard_tsk | – | – | – | RW assigned group | – | – | – | – | – | CRW | R | CRWD |
| onb_tmpl | – | – | – | – | – | – | – | – | – | CRW | – | CRWD |
| technician | – | – | – | R; W own availability | CRW | – | – | – | – | – | R | CRWD |
| issue_cat / issue_sub | R (active) | R | R | R | CRW | R | R | R | R | R | R | CRWD |
| **it_issue** | C; R/W own | C; R/W own | C; R own + dept | CR; W assigned group | CRW | C; R hostel_wifi in own hostel | R where child maint_req is assigned to them | R lab issues | R | – | R | CRWD |
| hostel | R | R | R | R | R | R; W own hostel | R | – | R | – | R | CRWD |
| hostel_room | R own room | – | – | R | R | CRW own hostel | R | – | R | – | R | CRWD |
| room_alloc | C (request); R own | – | – | – | – | CRW own hostel | – | – | R | – | R | CRWD |
| hostel_cmpl | C; R own | – | – | – | – | RW own hostel | R child-linked | – | – | – | R | CRWD |
| laboratory | R | R | RW dept | R | R | – | R | CRW | R | – | R | CRWD |
| maint_req | – | C | C | C | C | C | CRW group | CRW | – | – | R | CRWD |
| pm_schedule | – | – | – | – | – | – | R | CRW | – | – | R | CRWD |
| class_sess | R own sections | CRW own sections | CRW dept | – | – | – | – | – | CRW | – | R | CRWD |
| **stu_attend** | R own | CRW own sessions, within the edit window | RW dept (override, reason required) | – | – | – | – | – | CRW (override) | – | R | CRW (**no D**) |
| **fac_attend** | – | C/R own; W own today only | R dept; W approve | – | – | – | – | – | – | CRW | R | CRW (**no D**) |

Platform tables: `alm_asset` and `alm_hardware` use platform ACLs (asset role). `incident` uses platform ACLs (itil). Campus360 does **not** change ACLs on any platform table.

**Deletes:** Only `admin` can delete, and attendance records can't be deleted at all, even by admin. Mistakes are fixed by changing the status, and the change stays in the audit history.

## 4. Row-level rules

Implemented as **Allow ACLs with conditions or script**, calling the `C360Security` script include, plus **before-query business rules** so users only ever see the rows they're allowed to in lists and reports. Each rule is listed with its ACL condition.

| ID | Table / op | Rule |
|---|---|---|
| RL-01 | student R (student role) | `user = gs.getUserID()` |
| RL-02 | student R (faculty) | **Implemented in Part 3** (script ACL → `c360-security.ts`): student has an `enrolled` enrollment in a **planned/active** `course_sec` where my **active** faculty profile is `faculty` or in `co_instructors`. Advisor access (`advisor.user = me`) is a separate declarative ACL (Part 2). |
| RL-03 | student R (hod) | `department = my faculty.department` and I am that department's HOD |
| RL-04 | student R (warden) | **Implemented in Part 3** (script ACL): student has an **active or requested** `room_alloc` in an **active** hostel where `warden = me` or `assistant_warden = me` |
| RL-04g | student.guardian_name / guardian_phone R (warden) | **Implemented in Part 3** (field script ACL, admin override off): same as RL-04 but **active** allocations only |
| RL-05 | it_issue R/W (caller) | `caller = me` or `opened_by = me` or `watch_list CONTAINS me` |
| RL-06 | it_issue W (technician) | `assignment_group` is one of my groups; state isn't Closed or Cancelled |
| RL-07 | stu_attend C/W (faculty) | `class_session.faculty.user = me` (or I'm a co-instructor), `class_session.session_date ≤ today`, not `locked`, and inside the edit window |
| RL-08 | stu_attend R (student) | `student.user = me` |
| RL-09 | class_sess C/W (faculty) | `course_section.faculty.user = me` or I'm a co-instructor |
| RL-10 | fac_attend C/W (faculty) | `faculty.user = me` and `attendance_date = today` and `source = self` |
| RL-11 | room_alloc / hostel_room / hostel_cmpl (warden) | `hostel.warden = me` or `hostel.assistant_warden = me` (through hostel_room.hostel for allocations) |
| RL-12 | hostel_cmpl R (confidential) | If `is_confidential`, only the caller, the warden of that hostel, and admin |
| RL-13 | maint_req W (maintenance) | `assignment_group` is one of my groups |
| RL-14 | enrollment R (student) | `student.user = me` |
| RL-15 | department/course W (hod) | `sys_id = my department` / `department = my department` |

## 5. Field-level protection (sensitive fields)

Sensitive fields: student (`date_of_birth`, `gender`, `blood_group`, `personal_phone`, `personal_email`, `home_address`, `guardian_name`, `guardian_relation`, `guardian_phone`), faculty (`date_of_birth`, `personal_phone`, `personal_email`, `home_address`, `emergency_contact`, `emergency_phone`), and student_reg / fac_onboard applicant personal fields.

| Field group | Read | Write |
|---|---|---|
| Student sensitive fields | Self, registrar, admin | Self (contact fields only: personal_phone, personal_email, home_address), registrar, admin |
| `student.guardian_phone`, `guardian_name` | Also the warden of the student's active hostel (emergency need) | Registrar, admin |
| `student.gender` | Self, registrar, admin. Hostel eligibility is checked server-side, so wardens don't need to see it. | Registrar, admin |
| Faculty sensitive fields | Self, faculty_admin, admin | Self (contact fields only), faculty_admin, admin |
| Registration and onboarding personal fields | Registrar / faculty_admin, admin | Same |

For every sensitive field there are four ACLs: **read**, **write**, **`query_range`** (deny) and **`query_match`** (deny). The query ACLs stop "blind query" probing, such as filtering `date_of_birth > X` to infer values. Leadership dashboards use only non-sensitive fields.

Other protections:
- `audit: true` on student, faculty, enrollment, stu_attend, fac_attend, room_alloc, student_reg and fac_onboard.
- `allowWebServiceAccess: false` on tables with personal data.
- No sensitive field appears in notifications, portal widgets for other users, or reports.
- System property `x_774308_campus360.privacy.mask_in_lists = true` keeps sensitive columns out of default list layouts.

## 6. Portal access

| Portal | URL | Page access |
|---|---|---|
| Student Portal | `/student360` | `x_774308_campus360.student` (registration page is available to `snc_external` / public only if enabled by a property) |
| Faculty Portal | `/faculty360` | `x_774308_campus360.faculty` (HOD pages: `hod`) |
| Admin UI | Classic UI → "Campus360" application menu | Each module is restricted to the relevant role |

## 6a. Changes made during implementation (Part 2)

- `admin` does **not** contain `student`, `faculty` or `hod`. It's granted explicitly in every ACL, so self-service row filters never restrict administrators.
- `course_sec` is readable by every Campus360 user, and `class_sess` by students. This is timetable data; the "own records" narrowing is a Part 3 list filter.
- Students and faculty have **no table write** on their own profiles. Self-edit of contact fields happens only through portal widgets (Part 11).
- ~~Faculty-reads-enrolled-students (RL-02) and warden-reads-residents (RL-04) deferred to Part 3.~~ **Done in Part 3:** see the section below.

## 6b. Part 3: relationship-based access (security script include)

| Persona | Student profile rows | Sensitive student fields |
|---|---|---|
| Student | Own only | Own only |
| Faculty (instructor / co-instructor) | Students **enrolled** in their planned/active sections (RL-02) | **None** |
| Faculty (advisor) | Advisees (declarative) | None |
| HOD | Department students (declarative) + RL-02 for their own classes | None |
| Warden / assistant warden | Students with an **active or requested** allocation in their active hostel (RL-04) | `guardian_name`, `guardian_phone` for **active** residents only (RL-04g) |
| Registrar, app admin | All | All |
| Leadership | All | None |
| Platform admin without a Campus360 role | All rows | **None** after the D-2 fix: the 73 role-based personal-field ACLs also require explicit Campus360 role membership (`hasAssignedRole` / `getRoles`). Built and tested locally, pending deployment. See [D2_PERSONAL_DATA_SECURITY_FIX.md](D2_PERSONAL_DATA_SECURITY_FIX.md). |

**Verified on dev382380 (ATF 2026-11-11):** every other row of this table behaves exactly as stated (security suite: 34 of 36 steps passed, 1 failed (D-2), and 1 skipped; that skipped step was the REST check, covered separately by W-2).

Implementation: `src/server/security/{access-rules,glide-access-data,c360-security}.ts`, script include `C360Security`, ACLs in `src/fluent/security/relationship.acl.now.ts`. ACL total: **390**. Details and test evidence: [PART3_IMPLEMENTATION_REPORT.md](PART3_IMPLEMENTATION_REPORT.md).
- Actual ACL count: **298** (136 field-level, 81 row-level, 39 deny). Inventory in [PART2_IMPLEMENTATION_REPORT.md](PART2_IMPLEMENTATION_REPORT.md) §7.

## 6c. Security hardening releases (D-2, W-3, portal, revision 3) — built, pending deployment

### Workflow authority (native forms, list edit, REST, scripts and portal)
| Action | student / faculty (creator) | technician, assigned group | technician, other group | it_manager | warden, own hostel | warden, other hostel | Campus360 admin |
|---|---|---|---|---|---|---|---|
| Edit description / add comments on own ticket | ✅ | ✅ | ✅ (own ticket) | ✅ | ✅ | ✅ (own ticket) | ✅ |
| Change IT issue state / resolve / cancel / reassign / work notes | ❌ | ✅ | ❌ (even if they raised it) | ✅ | ❌ | ❌ | ✅ |
| Set escalation link (write-once) | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Change complaint state / resolve / work notes | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ (even if they raised it) | ✅ |

Enforced by:
- conditional field ACLs: RL-06 on the IT-issue workflow fields, RL-11 on the complaint workflow fields;
- unconditional `it_manager` / Campus360 `admin` field ACLs;
- the before-update guard BRs for scripted paths;
- the portal's own server check.

See [NATIVE_WORKFLOW_SECURITY_FIX.md](NATIVE_WORKFLOW_SECURITY_FIX.md).

### Row visibility used for counts (before-query rules mirror the read ACLs)
| Table | Rule |
|---|---|
| it_issue | RL-05 / RL-06 read set: staff all; others own + warden hostel + lab + HOD department |
| hostel_cmpl | Own + warden hostel; leadership all non-confidential (RL-12) |
| maint_req | Facilities, lab, IT, leadership all; others own + warden hostel |
| hostel_room | Facilities, registrar, IT, leadership all; warden own hostels; **student: available rooms + own allocated room (new ACL `acl-hostel-room-read-own`, even when full)** |
| class_sess | Students (timetable), registrar, leadership all; faculty own; HOD department |
| onboard_tsk | faculty_admin, leadership all; others by assignment group |

Details: [W3_STATISTICS_SECURITY_FIX.md](W3_STATISTICS_SECURITY_FIX.md).

**ACL count after revision 3: 411** (240 field-level, 100 conditional, 39 deny).

## 7. ACL count estimate

About 26 tables × 4 operations ≈ 100 table ACLs, about 60 sensitive-field ACLs, and about 20 row-level script ACLs, for roughly **180 ACLs**. They're written in Part 3 as one `security/<module>.acl.now.ts` file per module, each with explicit `Acl()` calls and stable `Now.ID` keys, so they can be reviewed against this matrix.
