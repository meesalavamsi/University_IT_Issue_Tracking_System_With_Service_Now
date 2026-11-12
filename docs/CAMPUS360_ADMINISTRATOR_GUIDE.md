# Campus360 Administrator Guide

> For Campus360 application administrators and ServiceNow platform administrators. Instance dev382380 · scope `x_774308_campus360` · 2026-11-11

## 1. Where things are
| Item | Location |
|---|---|
| Application menu | Filter navigator → **Campus360** (48 modules + **Campus360 Portal**) |
| Portal | `https://dev382380.service-now.com/x_774308_campus360_portal.do` *(after the portal release is deployed)* |
| Application record | System Applications → Studio / My Company Applications → *Campus360* |
| Properties | `sys_properties` filtered by `x_774308_campus360.` (10 properties) |
| ACLs | `sys_security_acl` filtered by name starting `x_774308_campus360` (391 in build) |
| ATF tests | Automated Test Framework → Tests → names starting **C360** |
| Portal REST API | System Web Services → Scripted REST APIs → **Campus360 Portal API** |

## 2. Roles (`x_774308_campus360.*`)
| Role | Contains | Purpose |
|---|---|---|
| `user` | – | Base access: portal, own records |
| `student` | user | Student self-service |
| `faculty` | user | Own sections, sessions, attendance marking |
| `hod` | faculty | Department oversight |
| `technician` | user | Works IT issues |
| `it_manager` | technician | IT queue lead, categories |
| `warden` | user | Assigned hostels, rooms, allocations, complaints |
| `maintenance` | user | Maintenance requests |
| `lab_admin` | user | Laboratories, PM plans |
| `registrar` | user | Students, academics, registrations, **student personal data** |
| `faculty_admin` | user | Faculty records, onboarding, **faculty personal data** |
| `leadership` | user | Read-only analytics, no personal fields |
| `admin` | it_manager, warden, maintenance, lab_admin, registrar, faculty_admin, leadership | Campus360 application administrator (not student, faculty or hod) |

**Grant roles through groups where possible.** The 9 groups are C360 IT Service Desk, Desktop & Hardware Support, Network & Wi-Fi Team, Lab Support, Facilities & Electrical, Hostel Administration, Registrar Office, Faculty Onboarding Team, and IT Management. Explicit role checks (D-2) count group and inherited roles.

> **Important (D-2):** the platform `admin` role on its own does **not** reveal student or faculty personal fields. To administer personal data, a user needs `x_774308_campus360.registrar`, `faculty_admin` or `admin` explicitly (directly or through a group). See [D2_PERSONAL_DATA_SECURITY_FIX.md](D2_PERSONAL_DATA_SECURITY_FIX.md).

## 3. Onboarding a user
1. Create or locate the `sys_user` record.
2. Add them to the matching C360 group (or grant the role).
3. **Student:** create an `x_774308_campus360_student` record with `user` = the sys_user. Without this link the portal cannot show their profile, and hostel complaints are refused.
4. **Faculty:** create an `x_774308_campus360_faculty` record linked to the user, and set them as `faculty` or co-instructor on `course_sec` records.
5. **Warden:** set the user as `warden` or `assistant_warden` on the `hostel` record **and** grant the `warden` role. Both are required.
6. **HOD:** grant `hod` and set `department.hod` to their faculty record.
7. **Technician:** add them to the **C360 support group(s)** whose issues they work. Technicians can change status, notes and assignment only on issues assigned to one of their groups, in every interface. IT managers work any issue.
8. Ask the user to log out and back in so the new roles take effect.

## 4. Reference data to maintain
| Table | Notes |
|---|---|
| `issue_cat`, `issue_sub` | Drives the IT request form. `requires_lab` / `requires_room` flags change which fields the form shows. |
| `hostel`, `hostel_room` | Capacity, warden and assistant warden |
| `laboratory` | Location; used for IT and maintenance requests |
| `department`, `program`, `course`, `acad_term`, `course_sec` | Academic structure; enrollments drive rosters |
| `onb_tmpl` | Onboarding templates (task generation is Part 6) |

No demo data is installed. Optional demo data can only be installed explicitly with `npm run deploy:with-demo`, and uses fictional `c360.` users with `@example.edu` addresses.

## 5. Portal administration
- **Access:** any user with `x_774308_campus360.user` (every Campus360 role includes it). Users with no Campus360 role see "Campus360 access not set up".
- **Screens per role:** see the role matrix in [CAMPUS360_UI_IMPLEMENTATION_REPORT.md](CAMPUS360_UI_IMPLEMENTATION_REPORT.md).
- **Administration screen** (Campus360 `admin` only): readable row counts per table, links to native lists, and an embedded list explorer.
- **Disabling the portal:** deactivate the module "Campus360 Portal" and the REST API **Campus360 Portal API** (both reversible). Native forms keep working.
- **Troubleshooting:**
  - A 401/403 error in the portal usually means a missing role or an expired session; reload the page.
  - A field that is blank in the portal but filled in the database means a field ACL is hiding it, which is intended.

## 6. Security operations
| Task | How |
|---|---|
| Review who can see personal data | `sys_user_has_role` for `x_774308_campus360.registrar`, `faculty_admin`, `admin` (include group grants) |
| "Not allowed: only … can change …" on save | The workflow guard blocked a change to state, notes or assignment by someone without authority over that ticket (wrong group or hostel, or the caller). Add the user to the correct group, or set the hostel's warden. Don't deactivate the guard. |
| Debug an access decision | Set `x_774308_campus360.security.debug = true` temporarily (logs relationship checks), then turn it off |
| Run regression tests | Turn on `sn_atf.runner.enabled`, run the 4 **C360** tests, then turn it off again. ATF rolls back test data. |
| Monitor ACL changes | Filter `sys_update_xml` / `sys_security_acl` by updated date |
| Audit history | Keep `glide.history.role = itil`. See [W4_AUDIT_HISTORY_REVIEW.md](W4_AUDIT_HISTORY_REVIEW.md); do not disable auditing. |

**Do not:**
- turn on admin override on sensitive ACLs;
- grant `itil` to Campus360 users without a reason;
- enable REST (`ws_access`) on personal tables;
- delete Campus360 tables or records from a global-scope script.

## 7. Deploying changes
```
npm run build      # type check + package
npm test           # 241 local tests
npm run deploy     # now-sdk install --demoData=false (requires approval)
```
After deployment, run the ATF suite (§6) and the manual checks in [CAMPUS360_UI_TEST_PLAN.md](CAMPUS360_UI_TEST_PLAN.md). Never uninstall the application to "fix" a deployment, because that deletes business data.

## 8. Known limitations
See §11 of [CAMPUS360_UI_IMPLEMENTATION_REPORT.md](CAMPUS360_UI_IMPLEMENTATION_REPORT.md) and §8 of [CAMPUS360_WORKFLOW_AND_PROCESS_GUIDE.md](CAMPUS360_WORKFLOW_AND_PROCESS_GUIDE.md).
