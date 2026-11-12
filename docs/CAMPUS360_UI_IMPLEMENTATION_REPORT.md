# Campus360 UI and Security Hardening: Implementation Report and Deployment Plan

> 2026-11-11 · scope `x_774308_campus360` · v2.0.0 (in-place update) · **Revision 3.1. Status: DEPLOYED 2026-11-11 11:10 UTC. Rev 3 results are in [DEPLOYMENT_EXECUTION_REPORT.md](DEPLOYMENT_EXECUTION_REPORT.md) Part C; the rev 3.1 fix-forward (DEF-1/2/3, GAP-4, TEST-5; ATF 111/111) is in Part D.**
> - Rev 1: D-2, W-3 (IT issues), portal.
> - Rev 2: W-3 for complaints and maintenance; Cancel/Resolve hardening; 7-persona portal ATF.
> - **Rev 3: native-form workflow security; W-3 for rooms, sessions and onboarding tasks; own-room fix.**

## 1. Security fixes
| Item | Decision | Result | Detail |
|---|---|---|---|
| **D-2** platform admin reads personal data | Option A (accepted) | 73 role-based personal ACLs also require explicit Campus360 role membership | [D2_PERSONAL_DATA_SECURITY_FIX.md](D2_PERSONAL_DATA_SECURITY_FIX.md) |
| **W-3** aggregate counts bypass row ACLs | Approved (rev 1–3) | Before-query rules on **all six** REST-enabled tables with row-conditional read ACLs | [W3_STATISTICS_SECURITY_FIX.md](W3_STATISTICS_SECURITY_FIX.md) |
| **Native-form workflow security** | Approved (rev 3) | Conditional field ACLs + update guards: technicians work only their groups' issues, wardens only their hostels' complaints, creators never change workflow status | [NATIVE_WORKFLOW_SECURITY_FIX.md](NATIVE_WORKFLOW_SECURITY_FIX.md) |
| **W-4** audit history | Investigate only | **Open.** No history/audit change | [W4_AUDIT_HISTORY_REVIEW.md](W4_AUDIT_HISTORY_REVIEW.md) |

### 1a. Revision 3 changes (exact)
**Standard-form security (approved item 1)**

| Change | Files | Records |
|---|---|---|
| Added the condition *assignment group is one of my groups* to the 12 technician field-write ACLs on `it_issue`: state, on_hold_reason, resolution_code, close_notes, work_notes, assignment_group, assigned_to, priority, impact, urgency, caller, category | `src/fluent/security/it-issue.acl.now.ts` | 12 updated (same `$id`s) |
| Added 12 unconditional `it_manager` field-write ACLs for the same fields (it_manager ⊂ Campus360 admin) | same | 12 new |
| Added the condition *hostel.warden = me OR hostel.assistant_warden = me* to the 6 warden field-write ACLs and the work-notes read ACL on `hostel_cmpl` | `src/fluent/security/hostel.acl.now.ts` | 7 updated |
| Added 7 unconditional Campus360 `admin` field ACLs for the same fields | same | 7 new |
| Before-update guard **C360 IT Issue - workflow changes need group authority** (order 50) | `src/fluent/logic/workflow-guard.now.ts`, `src/server/issue/workflow-guard.ts`, `workflow-authority.ts` | 1 BR |
| Before-update guard **C360 Hostel Complaint - workflow changes need hostel authority** (order 50) | same | 1 BR |

Also confirmed:
- Unchanged: caller record ACLs and the description/comments ACLs (ownership editing), create ACLs, and the escalation ACL.
- No roles, group roles or platform ACLs were changed.
- The guards only abort; they never write data.

**Statistics security (approved item 2)**

| Change | Records |
|---|---|
| Query rules **C360 Hostel Room / Class Session / Onboarding Task - restrict queries to visible rows**, mirroring their read ACLs | 3 BRs |
| `acl-hostel-room-read-own` (student role + `canStudentReadOwnRoom`): a student always reads the room of their own active allocation, even when full. Shared with the room query rule through `ownActiveRoomIds()`. | 1 ACL, `src/server/security/own-room.ts` |
| **Defect fixed:** the portal couldn't resolve the hostel of a student in a **full** room, so it refused their hostel complaint. Fixed by the ACL above. | – |

**Test-harness corrections found during review**
- The integrity and portal ATF fixture lookups used plain `GlideRecord`. With query rules active, those lookups would hide fixture rows from restricted personas and fail falsely.
- Lookups now use `setWorkflow(false)` in **ATF scripts only**. Assertions stay rule-enforced, and product code never uses `setWorkflow(false)` (build test).

### 1b. Revision 2 changes (accepted)
- W-3 for `hostel_cmpl` and `maint_req`.
- Cancel requires a work note (server-side).
- Complaint resolve requires notes.
- Portal operational-authority checks.
- 7-persona portal ATF.

## 2. UI architecture selected
**A React 18 UI Page built with the ServiceNow SDK** (`x_774308_campus360_portal.do`), using `@servicenow/react-components`. It's backed by a scoped Scripted REST API (`/api/x_774308_campus360/portal`, **18 routes**) using only `GlideRecordSecure` as the logged-in user. Detail screens reuse the platform form. See [CAMPUS360_SYSTEM_ARCHITECTURE.md](CAMPUS360_SYSTEM_ARCHITECTURE.md).

## 3. Why this instance supports it
- SDK 4.14.0 supports `UiPage` with a React client (bundle in `sys_ux_lib_asset`).
- Scripted REST and `rest_endpoint` ACLs are core features.
- The page uses the user's session (`g_ck`): no OAuth, CORS, external host or stored credentials.

## 4. Screens implemented
Dashboard · Raise a request · My requests · Request detail · IT work queue (assign, start, hold, resume, resolve, reopen, cancel with confirmation and note, work note) · My hostel (start, hold, resume, resolve with notes) · Maintenance · Classes & attendance · Registrations · Campus insights · Administration. Routes and backends are unchanged from rev 2 (§4 of rev 2, and the architecture doc §6).

## 5. Backend tables and workflows connected
Unchanged from rev 2. All portal reads and writes go through `GlideRecordSecure`, so they now also inherit the rev 3 field conditions, guards and query rules. 9 business rules are in the package: 6 query, 2 guard, 1 stamp.

## 6. Role feature matrix
| Capability | student | faculty | hod | warden | technician | it_manager | maintenance | lab_admin | registrar | faculty_admin | leadership | admin |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Dashboard, raise request, my requests | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Edit description / comment on own ticket (any interface) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Hostel complaint (own allocation; full rooms included) | ✓ | – | – | – | – | – | – | – | – | – | – | – |
| IT work queue | – | – | – | – | own groups | all | – | – | – | – | – | all |
| **Change IT issue workflow (any interface)** | – | – | – | – | **assigned group only** | ✓ | – | – | – | – | – | ✓ |
| Set escalation link (write-once) | – | – | – | – | – | ✓ | – | – | – | – | – | ✓ |
| **Change complaint workflow (any interface)** | – | – | – | **own hostels only** | – | – | – | – | – | – | – | ✓ |
| Maintenance list | – | – | – | ✓ | ✓ | ✓ | ✓ | ✓ | – | – | – | ✓ |
| Classes & attendance | – | own sections | own sections | – | – | – | – | – | – | – | – | – |
| Registrations | – | – | read-only | – | – | – | – | – | review | – | – | review |
| Campus insights | – | – | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | – | ✓ | ✓ |
| Administration | – | – | – | – | – | – | – | – | – | – | – | ✓ |
| **Counted / visible rooms** | available + own | – | – | own hostels | all | all | all | – | all | – | all | all |
| **Counted / visible sessions** | all (timetable) | own | own + department | – | – | – | – | – | all | – | all | all |
| **Counted / visible onboarding tasks** | by group | by group | by group | by group | by group | by group | by group | by group | by group | all | all | all |

Full matrix: [ROLE_PERMISSION_MATRIX.md](ROLE_PERMISSION_MATRIX.md) §6c. Traceability: [TRACEABILITY_MATRIX.md](TRACEABILITY_MATRIX.md) SEC-12 to SEC-17, UX-02.

## 7. Documents
- D2_PERSONAL_DATA_SECURITY_FIX
- W3_STATISTICS_SECURITY_FIX (rev 3)
- **NATIVE_WORKFLOW_SECURITY_FIX (new)**
- W4_AUDIT_HISTORY_REVIEW
- CAMPUS360_SYSTEM_ARCHITECTURE
- CAMPUS360_ADMINISTRATOR_GUIDE
- CAMPUS360_END_USER_GUIDE
- CAMPUS360_WORKFLOW_AND_PROCESS_GUIDE
- CAMPUS360_UI_TEST_PLAN
- this report
- ROLE_PERMISSION_MATRIX §6c and TRACEABILITY_MATRIX (updated)

## 8. Build and test results (actual, 2026-11-11, revision 3)
| Check | Command | Result |
|---|---|---|
| Type check (server, Fluent, React client) + build | `npm run build` | ✅ type check completed, build completed |
| Frozen keys + sys_id conflicts | `npx now-sdk build --frozenKeys --errorOnConflict` | ✅ completed, no conflicts |
| Full local suite | `npm test` | ✅ **241 tests, 30 suites, 241 pass, 0 fail** (rev 2: 179) |
| Package validation | `validate_build.ps1` | ✅ 2,076 XML files, **411 ACLs**, 49 modules, 0 demo files. 1 expected finding: the portal REST endpoint ACL |
| ACL access simulation | `acl_audit.ps1` | ✅ 411 ACLs; **0 sensitive read violations**; platform admin "–" on all personal fields |
| ATF preparation | build output | ✅ **4 tests, 111 steps** (Part 3 security, integrity, portal, **native rev 3**) |
| On-instance ATF and manual M1–M31 | – | ⏳ after deployment |

**Protections re-verified by the suite**

| Area | Result |
|---|---|
| Personal data (D-2) | 93 + 2 ACLs; 73 with the explicit-role script; 20 self-access; admin override off |
| Assignment-group and hostel boundaries | Per-field build tests + 17 unit tests |
| Attendance | Unique indexes, no-delete ACLs and system-field ACLs unchanged (Part 2/3 tests) |
| Incident escalation | IT-manager-only, write-once, admin override off |
| Cancel/resolve audited | `audit="true"` on 7 tables; guards abort-only; portal never disables engines |
| W-4 | Open; no history or audit changes |

## 9. Final deployment package and plan (requires your explicit approval)
### 9.1 Package
| Item | Value |
|---|---|
| Artifact | **`target/campus_360_2_0_0.zip`** (1,972 KB, 2,077 entries) |
| SHA-256 | **`1A6D5DC92D72B607C964063326F716CF4BF09B5AB62CB9D63D0B5DD361B5150F`** |
| Inventory | `dist/app/package_inventory.csv` |
| Install command | `npm run deploy` → `now-sdk install --demoData=false` (alias `dev`) |

### 9.2 Manifest and pre-deployment confirmations (verified from the build output)
| Confirmation | Status | Evidence |
|---|---|---|
| Scope unchanged | ✅ `x_774308_campus360` (scopeId `0fa4e9c7e087434bb52c03096bab3ae9`), v2.0.0 | `now.config.json`, `sys_app` record |
| No tables or business data deleted | ✅ **0** record-delete actions. All **151** `delete_multiple` statements are keyed to records **inside this package**: 111 ATF step variable sets, 37 element mappings of scripted records, and the previous UI bundle attachment, its document chunks and source-artifact links. **0** are keyed to anything else. | sys_id cross-check of every delete key |
| No global or platform tables modified | ✅ 26 / 26 tables and all dictionary entries are `x_774308_campus360_*`. Every ACL targets a Campus360 object or the scoped REST endpoint. | Manifest scan; build test |
| No demo data | ✅ `--demoData=false`; 0 demo files; 0 demo entries in the zip. `issue_cat` (8), `issue_sub` (24) and `onb_tmpl` (10) are base configuration already installed. | Package scan |
| In-place update | ✅ `now-sdk install` **without** `--reinstall` (forbidden: it uninstalls) | Command review |
| Portal and all 18 REST routes included | ✅ 1 `sys_ui_page`, 2 `sys_ux_lib_asset`, 1 `sys_ws_definition`, 1 `sys_ws_version`, **18 `sys_ws_operation`**, REST ACL, module | Manifest |
| No additional platform privileges | ✅ 13 roles, 18 role-containment records and 11 group-role records, identical in count and source to the rev 1 and rev 2 builds (no Fluent role or group changes in rev 3). New ACLs re-grant only what it_manager / Campus360 admin already held through role containment. | Manifest; source diff |

**Manifest (record type × count, all INSERT_OR_UPDATE unless noted)**

| Category | Records |
|---|---|
| Application | sys_app 1, sys_app_application 1, sys_app_module 49 |
| Security | sys_security_acl 411, sys_security_acl_role 450, sys_user_role 13, sys_user_role_contains 18, sys_user_group 9, sys_group_has_role 11 |
| Data model | sys_db_object 26, sys_dictionary 325, sys_dictionary_override 10, sys_documentation 325, sys_choice 301, sys_choice_set 108, sys_number 8 |
| Logic | sys_script 9, sys_script_include 1, sys_module 18, sys_properties 10 |
| UI | sys_ui_form 26, sys_ui_form_section 69, sys_ui_section 69, sys_ui_element 498, sys_ui_list 26, sys_ui_list_element 194, sys_ui_annotation 4, sys_ui_page 1, sys_ux_lib_asset 2, sys_attachment 1, sys_attachment_doc 1, sn_glider_source_artifact 1, sn_glider_source_artifact_m2m 3 |
| REST | sys_ws_definition 1, sys_ws_version 1, sys_ws_operation 18, sys_element_mapping 37 |
| Tests | sys_atf_test 4, sys_atf_step 111, sys_variable_value 365 |
| Base config data | issue_cat 8, issue_sub 24, onb_tmpl 10 |
| delete_multiple (own children only) | sys_variable_value 111, sys_element_mapping 37, sys_attachment 1, sys_attachment_doc 1, sn_glider_source_artifact_m2m 1 |

### 9.3 Steps
| Step | Action | Notes |
|---|---|---|
| 0 | Re-run `npm run build`, `npm test`; `npx now-sdk auth --list` (alias `dev`); confirm the zip SHA-256 matches §9.1 | Must be green |
| 0b | **Read-only baseline (preserve):** `npx now-sdk download <backup-dir>` of the installed app's metadata XML, plus a copy of this project folder | Only exact record-level baseline (no git repo). No instance writes. |
| 1 | `npm run deploy` | In place, about 2,080 records |
| 2 | Verify: UI page; REST API (18 operations active); REST ACL; **9 BRs active**; module; spot-check 3 personal ACLs (script), 3 it_issue workflow ACLs (group condition), 2 hostel_cmpl ACLs (hostel condition), own-room ACL | Read-only queries |
| 3 | `sn_atf.runner.enabled = true` → run the **4 C360** tests → set it back to `false` | ATF rolls back |
| 4 | Report any new Campus360 `sys_scope_privilege` auto-records (as in W-1); remove nothing without approval | – |
| 5 | Manual M1–M31 (impersonation or temporary `c360.test.*` users, removed afterwards) | – |
| 6 | Record evidence in DEPLOYMENT_EXECUTION_REPORT Part C | – |

### 9.4 Portal disable (reversible, no redeploy)
1. Deactivate module **Campus360 Portal**.
2. Deactivate Scripted REST API **Campus360 Portal API** (all 18 routes).
3. Optionally deactivate UI page `x_774308_campus360_portal`.

Native forms are unaffected and keep the rev 3 protections.

### 9.5 Rollback
| Scope | Procedure | Effect |
|---|---|---|
| Statistics rules (W-3) | Deactivate any of the 6 "C360 … - restrict queries to visible rows" BRs | ACLs still protect rows; only that table's counts revert. **Note:** deactivating the hostel_room rule doesn't affect the own-room ACL. |
| Scripted-path workflow guard | Deactivate the 2 "… workflow changes need … authority" BRs | Field ACLs still protect forms, list editing and REST |
| Field-ACL boundaries | Source revert (remove the `condition` from the 12 + 7 ACLs and delete the 19 `*-mgr` / `*-admin` definitions **only with your approval**, see keys.ts rule) + in-place `npm run deploy` | Restores role-only behaviour (re-opens the gap) |
| D-2 ACL scripts | Source revert of the `script` property on 73 ACLs + in-place redeploy; step-0b XML as reference | – |
| Portal | §9.4 | – |
| Never | `--reinstall`, uninstalling the app, deleting tables or data, disabling auditing | – |

Records **added** by this release (UI page, REST API, 9 BRs, 20 new ACLs, ATF tests) are not removed by redeploying an older source. Deactivate them, or remove them only with separate approval.

**Expected behaviour changes to tell users about:**
- Platform admins without Campus360 roles lose personal-field access (D-2).
- Non-staff report counts on the 6 tables are limited to visible rows.
- Leadership no longer counts other people's confidential complaints.
- Technicians must be in the issue's group to work it, **in every interface**.
- Wardens act only on their own hostels' complaints.
- Students in full rooms regain correct hostel behaviour.

## 10. Manual configuration after deployment
1. Assign roles through the C360 groups.
2. Link `student.user` / `faculty.user`.
3. Set `hostel.warden` / `assistant_warden` and `department.hod`.
4. **Put every technician in the C360 support group(s) they serve.** Without that, they can't work issues in any interface (by design).
5. Tell platform admins about D-2.

## 11. Remaining limitations
- **Not yet verified on the instance:**
  - browser rendering;
  - RecordProvider on personal tables;
  - `ws_access=false` tables through scripted REST;
  - faculty setting the inherited `location` on maintenance creation;
  - whether the field-ACL condition allows an in-group technician to **hand off** to another group (M29). If not, hand-offs go via IT managers.
- Platform admin still passes the operational workflow ACLs and guards (admin override, consistent with the operational design). A malicious platform admin is out of scope (D-2 §6). Background scripts with `setWorkflow(false)` bypass the guards.
- Mirroring ACLs in query rules means references to rooms or sessions a user can't read may display empty for that user.
- W-4 open. No Part 4–9 automation. Insights cap at 5,000 rows. No screenshots yet.

## 12. Next steps
1. **Your explicit approval of §9**, then deploy, run ATF and record evidence.
2. Confirm M29 (hand-off) and decide whether in-group hand-off must be allowed in the native form.
3. W-4 retest (M22).
4. Screenshots. Part 4 only with separate approval.
