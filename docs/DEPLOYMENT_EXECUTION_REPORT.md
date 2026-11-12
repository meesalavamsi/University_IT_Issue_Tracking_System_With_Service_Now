# Campus360: Deployment Execution Report, Parts 2 + 3

> **Latest (2026-11-11 16:10 UTC): Part F, "Campus records" (all 40 navigator entries inside the portal), is deployed. ATF 111/111. See the end of this document.**
> Earlier: Part E, the portal visual redesign (14:52 UTC).

> Status (2026-11-11 10:38–11:16 UTC): Part D, the rev 3.1 fix-forward.
> DEF-1, DEF-2, DEF-3, GAP-4 and TEST-5 are fixed and deployed in place. **All 4 ATF tests pass: 111/111 steps.** No regressions; nothing changed outside the Campus360 scope; no demo data; ATF runner OFF.

> Earlier status (2026-11-11 09:57–10:28 UTC): Part C, the security hardening + React portal release (rev 3). Deployed in place; three code defects and one pre-existing ACL gap found (fixed in Part D).

> Earlier status (D-1 fix and re-verification, 2026-11-11 06:45–08:10 UTC): see Part B.
> D-1 is fixed and deployed; the relationship rules work on the instance; W-1 cleanup is done; W-2 is verified.
> New findings for your decision: **D-2** (platform admins can read personal fields), **W-3** (aggregate API count leak), **W-4** (residual raw-history-line path).

# Part A: Initial deployment (06:17–06:40 UTC)

## Overall result (initial deployment)

**The deployment succeeded and the platform verification passed.** The on-instance security regression suite then found **one defect in the Part 3 module bridge**. It **fails closed**, so no data is exposed, but instructor-to-student and warden-to-resident access don't work yet. A fix is built and tested **locally only**; per your instructions it has **not** been deployed. Your approval is needed to redeploy (§14). *(Resolved in Part B.)*

## 1. Deployment date and time
| Event | UTC |
|---|---|
| Deployment started | 2026-11-11 06:17:28 |
| Installation completed | 2026-11-11 06:23:04 (about 5.5 min) |
| Post-deployment verification, actions A–C | 06:23–06:40 |

## 2. Instance
`dev382380`: https://dev382380.service-now.com · release `glide-australia-02-11-2026__patch7` · credential alias `dev` (user `admin`)

## 3. Application
| Property | Value |
|---|---|
| Name | Campus360 – University IT Issue Tracking & College Campus Management System |
| Scope / scopeId | `x_774308_campus360` / `0fa4e9c7e087434bb52c03096bab3ae9` (unchanged) |
| Version | 2.0.0 · active |
| Install rollback context | https://dev382380.service-now.com/sys_rollback_context.do?sys_id=0178d624932017107430f01bdd03d66d |
| Application record | https://dev382380.service-now.com/sys_app.do?sys_id=0fa4e9c7e087434bb52c03096bab3ae9 |

## 4. Pre-deployment checks (all passed)
| # | Check | Result |
|---|---|---|
| 1 | `npm run build` | ✅ Build completed successfully |
| 2 | `npm test` | ✅ 92/92 passed |
| 3 | `now-sdk build --frozenKeys`; now.config and package.json reviewed | ✅ scope, scopeId and version unchanged |
| 4 | Validation of all 390 ACLs (scope validator plus access simulation) | ✅ 1,910 files, 0 issues; 0 sensitive violations; 0 open; 0 duplicates |
| 5 | Scope and scopeId still unused on the instance | ✅ 0 records |
| 6 | Credentials and instance availability; company code 774308; same release | ✅ |
| 7 | Deploy command | ✅ `now-sdk install --demoData=false` |
| 8 | Destructive operations in the package | ✅ none (only 36 `delete_multiple` entries, each limited to Campus360's own new ATF step variables) |

## 5. Deployment command
```
npm run deploy   →   now-sdk install --demoData=false
```
Exit code 0. Output: `Installation completed`. **`--demoData=false` was passed** (verified in the command output).

## 6. Installed components (verified on the instance)
| Component | Expected | Actual |
|---|---|---|
| Tables (`x_774308_campus360_*`) | 26 | ✅ 26 |
| Roles | 13 | ✅ 13 |
| Groups (`C360*`) / group role grants | 9 / 11 | ✅ 9 / 11 |
| ACLs (in scope, and by name prefix) | 390 | ✅ 390 / 390 (429 ACL-role links) |
| Scripted relationship ACLs | 4 | ✅ 4 |
| Sensitive-field ACLs with admin override **on** | 0 | ✅ 0 |
| Attendance delete-deny ACLs | 2 | ✅ stu_attend and fac_attend: deny, admin_overrides=false, condition `sys_idISEMPTY` |
| Script include `x_774308_campus360.C360Security` | 1 | ✅ active, `package_private`, client_callable=false |
| Server modules (sys_module) | 5 | ✅ 5 (3 security modules + package.json + bom.json) |
| Application menu / modules | 1 / 48 | ✅ 1 / 48 |
| Forms / lists | 26 / 26 | ✅ 26 / 26 |
| System properties | 10 | ✅ 10 |
| ATF test / steps | 1 / 36 | ✅ 1 / 36 |
| Configuration records | 8 / 24 / 10 | ✅ issue_cat 8, issue_sub 24, onb_tmpl 10; every other table empty |

## 7. Unique indexes
`sys_index` turned out to be only a partial metadata table (33 rows on the whole instance), so indexes were verified against the **physical database descriptors** (`GlideTableDescriptor`):

**24 of 24 designed unique indexes present, 0 missing, 0 unexpected.** The platform renames them; for example `stu_attend` has `UNIQUE class_session [class_session, student]`, `fac_attend` has `UNIQUE faculty [faculty, attendance_date]`, and `enrollment` has `UNIQUE student_2 [student, course_section]`.

## 8. Security script include verification
| Check | Result |
|---|---|
| Installed, active, private to the scope, not client-callable | ✅ |
| ACL scripts reach the module bridge | ✅ (the bridge `require` resolved) |
| **Module-to-module import at runtime** | ❌ **DEFECT D-1**, see §14 |

## 9. ATF results: "C360 Security – Student profile access regression (Part 3)"
Run: https://dev382380.service-now.com/sys_atf_test_result.do?sys_id=647ade20936017107430f01bdd03d660 · **status: failure**

| Steps | Result |
|---|---|
| 1–13: create 13 fictional users (`c360.test.*@example.edu`, correct roles, including platform admin) | ✅ passed |
| 14–15: fixture as the Campus360 app admin via `GlideRecordSecure` (2 departments, 4 faculty, 4 students, 2 sections, 3 enrollments, 2 hostels, 2 allocations) | ✅ passed. The app admin can create all of this through ACLs. |
| 16–17: **student** checks: own row ✓, own DOB ✓, own guardian phone ✓, student B ✗, student C ✗ | ✅ **passed (all 5 assertions)** |
| 18: impersonate instructor | ✅ passed |
| 19: **instructor** checks | ❌ **failed**. Expected to read enrolled student A; got false. Root cause D-1. |
| 20–36: other faculty, advisor, HOD, wardens A/B, app admin, leadership, platform admin, REST | ⏭ **skipped** (ATF stops after a failure) |

Totals: **18 passed, 1 failed, 17 skipped.** ATF rolled back all its users and data (verified: 0 `c360.*` users remain).

## 10. Manual verification
| Area | Method | Result |
|---|---|---|
| **Student attendance duplicate protection** | Insert the same class_session + student twice | ✅ The second insert was rejected by the database (`Unique Key violation … for key 'class_session'`); 1 row remains |
| **Faculty attendance duplicate protection** | Same faculty + date twice | ✅ rejected; 1 row remains |
| **Attendance immutability** | `GlideRecordSecure.canDelete()` / `deleteRecord()` as **your admin** | ✅ canDelete=false, deleteRecord=false, record still present (stu_attend and fac_attend) |
| **Correction history (no silent overwrite)** | Change status on an attendance row | ✅ `sys_audit` entry created |
| **Incident escalation: authorised and duplicate-protected** | Set `escalated_incident` as app admin (contains it_manager), then try to change it | ✅ Writable while empty; after the first escalation the field is **no longer writable**, and the second escalation was blocked (value unchanged) |
| System-maintained fields | `canWrite()` on `stu_attend.locked` and `marked_by` | ✅ writable only by the app admin role (by design) |
| **REST: personal-data tables** | Raw `GET /api/now/table/<table>` as the platform admin session | ⚠️ **Inconclusive:** HTTP 200 with 0 rows. The tables are empty, and the caller is a platform admin. This does **not** prove the 403 for non-admin users. Metadata is verified (`ws_access=false` on all 8 tables). Must be re-tested with a non-admin user and data (ATF step 36 or RT-5). |
| REST: config table | Same call on `issue_cat` | ✅ HTTP 200 (as expected) |
| Persona access (student / faculty / advisor / HOD / warden), restricted fields, platform admin | ATF | Student ✅. Others **not executed** (skipped, see §9) |
| Reports, exports, list editing, reference lookups | Need interactive or persona sessions | ⏭ **not executed**. Planned with the ATF rerun after the fix (RT-3/4/7) |
| Administrator access | Your admin user now holds the Campus360 admin role | ✅ see §12 |

Temporary verification data: 11 records created and **11 deleted**, 0 left over (cleanup was server-side). IT issue numbers ITI0001001–ITI0001002 were consumed.

## 11. Critical security regression scenarios (your §5)
| # | Scenario | Status |
|---|---|---|
| 1 | Student: own records yes, another student's data no | ✅ verified (ATF steps 16–17) |
| 2 | Faculty: only enrolled students | ❌ blocked by D-1 (denies everything; nothing exposed) |
| 3 | Faculty: not unrelated students | ✅ by fail-closed behaviour; ⏳ full assertion after the fix |
| 4 | Advisors and HODs: authorised students only | ⏳ skipped (declarative ACLs, unaffected by D-1) |
| 5–6 | Wardens: own hostel only | ❌ blocked by D-1 (denies; nothing exposed) |
| 7 | Guardian contact restricted to the warden of active residents | Fails closed (no warden access) ⏳ |
| 8 | Administrator access follows approved permissions | ✅ ACL config verified (0 sensitive ACLs with override); ⏳ platform-admin persona skipped |
| 9 | Reports, exports, lookups and APIs don't bypass ACLs | ⏳ not executed (see §10) |
| 10 | Attendance can't be deleted or silently overwritten | ✅ verified |
| 11 | Escalation limited to IT managers and duplicate-protected | ✅ verified (write-once); IT-manager-only is enforced by role ACL ⏳ persona test |
| 12 | Personal-data and REST protections effective | ✅ ACLs and metadata; ⚠️ REST 403 inconclusive (§10) |

## 12. Administrator role assignment (action A)
`x_774308_campus360.admin` was added to user `admin` (1 `sys_user_has_role` record). Role count went from 126 to 136: 1 direct plus 9 inherited Campus360 roles (it_manager, technician, warden, maintenance, lab_admin, registrar, faculty_admin, leadership, user). `student`, `faculty` and `hod` are not inherited, by design. **No existing role was changed or removed.** Rollback context: `sys_rollback_context` cb4a5a20936017107430f01bdd03d6bc.

## 13. ATF enablement (action B)
`sn_atf.runner.enabled`: false → **true** (06:26) → **false** (06:39). **Final state: false**, verified.

## 14. Errors, warnings and skipped checks

### D-1: Server module import fails at runtime (Part 3)
| | |
|---|---|
| Error | `ModuleResolutionException: No module with path "x_774308_campus360/campus360/2.0.0/src/server/security/access-rules" found in sys_module table` |
| Cause | `c360-security.ts` and `glide-access-data.ts` imported `'./access-rules'` without the `.ts` extension. On the instance, modules are stored under their exact `…/access-rules.ts` path, and `require` doesn't add extensions. The local Node tests resolved the import differently, so they didn't catch it. |
| Impact | The 4 scripted ACLs throw an error, so access is **denied** (fails closed). Instructors can't see their enrolled students, and wardens can't see residents or guardian contact. **No over-exposure.** |
| Fix (local, not deployed) | Relative imports changed to `'./access-rules.ts'` and `'./glide-access-data.ts'` (the project tsconfig already sets `allowImportingTsExtensions`). New regression test: every relative import inside the bundled modules must resolve to an existing `sys_module` path. Result: build ✅, **93/93 tests ✅**. |
| Needs | **Your approval** to redeploy (`npm run deploy`, an update in place with no reinstall) and to re-run ATF (enable, run, disable). |

### W-1: Automatically created cross-scope privileges (from verification)
The scope's runtime access tracking ("permissive") recorded 5 `sys_scope_privilege` records (status *allowed*) when my in-scope verification script first used these APIs: `GlideRecord.deleteRecord`, `GlideRecord.setWorkflow`, `sys_audit` (read), `incident` (read), `GlideRecordSecure.getValue`. They aren't part of the source code. **Recommendation:** delete the first three, which the app doesn't need; keep `incident` read (needed for escalation in Part 4) and `GlideRecordSecure.getValue` (harmless). **Not removed: deleting them needs your approval.**

### W-2: REST 403 for non-admin users not proven
See §10.

### Skipped
ATF steps 20–36; manual report, export, list-edit and reference-lookup checks. Both are planned after the D-1 fix.

## 15. Demo data
✅ **None installed.** `--demoData=false`; 0 `unload.demo` files in the package; 0 `c360.*` users after testing; all app tables empty except the 42 configuration records.

## 16. Global and platform table modifications
✅ **No platform schema or ACL changes.** 0 dictionary entries or overrides on non-Campus360 tables. Since the deployment started, the only update record outside the scope is the `sn_atf.runner.enabled` property, which was approved and **restored to false**. Approved data changes: 1 `sys_user_has_role` (action A). Records inside the scope: the 5 privileges in W-1.

## 17. Final status and remaining risks
| Item | Status |
|---|---|
| Application | **Installed and active**, v2.0.0, 26 tables, 390 ACLs, 24/24 unique indexes, demo data off |
| ATF runner | Disabled (original state) |
| Your admin user | Holds `x_774308_campus360.admin`; the **Campus360** menu is visible in the navigator |
| Open defect | **D-1** (fails closed). Fix ready locally, awaiting approval to redeploy. |
| Open items | W-1 privilege clean-up (approval); W-2 REST 403 retest; full persona, report, export and list-edit regression after the fix; audit-history risk RT-6 |
| Part 4+ | **Not started**, as instructed |


---

# Part B: D-1 fix, W-1 cleanup and security re-verification (approved 2026-11-11)

## B1. D-1 root cause and exact source changes
| | |
|---|---|
| Root cause | Relative imports without a file extension (`'./access-rules'`). On the instance, modules are stored in `sys_module` under their exact source path (`…/access-rules.ts`), and `require()` doesn't append an extension. Node's local resolver did, so local tests passed. |
| `src/server/security/c360-security.ts` | `from './access-rules'` → `from './access-rules.ts'`; `from './glide-access-data'` → `from './glide-access-data.ts'` (plus an explanatory comment) |
| `src/server/security/glide-access-data.ts` | `from './access-rules'` → `from './access-rules.ts'` |
| Security logic | **Unchanged.** No ACL, rule, condition or fail-closed behaviour was modified. |
| New regression test | `test/security/build-config.test.mjs` → "every relative import/require inside bundled sys_module content resolves to an existing module path" |
| Verified on the instance | Deployed modules import `./access-rules.ts` and `./glide-access-data.ts`; ATF confirms instructor and warden access now evaluates correctly (B6) |

Test-only additions in the same deployment (no app logic or ACL changes): ATF test **"C360 Integrity – Attendance and escalation regression"** (`src/fluent/tests/integrity.test.now.ts`, `src/scripts/atf/integrity-*.js`), plus two later fixes to the ATF helper scripts (B6).

## B2. Import-resolution, build and local test results
| Check | Result |
|---|---|
| Source imports inspected | 3 relative imports, all with `.ts` |
| Built module imports vs `sys_module` paths | 3/3 **resolve** |
| `npm run build` / `build --frozenKeys` | ✅ / ✅ (re-run before each deploy) |
| `npm test` | ✅ **93/93 passed**, 0 failed, 0 skipped |

## B3. W-1: cross-scope permission cleanup
Inspected first (all source = Campus360, target scope = Global, status = allowed, created 06:33–06:34 by my verification script). Confirmed unused by any Campus360 runtime code (source search: the only `deleteRecord` is `GlideRecordSecure.deleteRecord` in a test-only ATF script, a different API).

| sys_id | Target | Operation | Action | Reason |
|---|---|---|---|---|
| `742cde24936017107430f01bdd03d657` | GlideRecord.deleteRecord | execute | **Deleted** | Server-side deletes bypassing ACLs; not used by the app |
| `092cde24936017107430f01bdd03d6da` | GlideRecord.setWorkflow | execute | **Deleted** | Lets scripts skip business rules; not used by the app |
| `f02cde24936017107430f01bdd03d66d` | sys_audit | read | **Deleted** | Raw audit-log read; not needed by the app |

Each deletion was guarded by an identity check (sys_id + source scope + target + type + operation).

**Remaining Campus360 cross-scope permissions (final):**
| sys_id | Target | Operation | Keep? |
|---|---|---|---|
| `3c2cde24936017107430f01bdd03d672` | incident | read | Yes: needed for incident escalation |
| `052cde24936017107430f01bdd03d68a` | GlideRecordSecure.getValue | execute | Yes: harmless, ACL-enforced read API |
| `d6cf6260936417107430f01bdd03d610` | Glide API: properties | execute | **New, recorded automatically 07:59 UTC** when the security module read `x_774308_campus360.security.debug` via `gs.getProperty` during persona checks. **Legitimate runtime need; kept.** |

## B4. Redeployments (all in place, `npm run deploy` = `now-sdk install --demoData=false`, target dev382380)
| # | UTC | Content | Pre-deploy inspection | Result |
|---|---|---|---|---|
| R1 | 06:53:14 – 06:57:05 | **D-1 fix** + new integrity ATF test | 0 DELETE actions; 72 `delete_multiple`, **all** limited to Campus360's own ATF step inputs (55 variable values, 17 element mappings); no keys marked deleted; 26 table definitions; same scope and version | ✅ exit 0 · rollback context `b8a062ac936017107430f01bdd03d6c3` |
| R2 | 07:03:17 – 07:11:14 | **Test-only:** ATF helper null-safety; `failOnServerError:false` on the integrity test | Same as above | ✅ exit 0 · `6be2e62c936017107430f01bdd03d67e` |
| R3 | 07:47:23 – ~07:52:50 | **Test-only:** ATF field-existence check via schema | Same as above | ⚠️ The client lost its connection during tracking (`fetch failed`). The instance tracker `580da2a0…` was polled and reported **Successful 100 %**. Update confirmed on the instance (10 updated check steps). |

R2 and R3 were needed to obtain valid ATF results (B6). They changed **test scripts only**. No uninstall or reinstall at any point.

**Preservation after R1 (baseline diff):** identical except ATF tests 1 → 2 and steps 36 → 55. Tables 26, roles 13, groups 9, group grants 11, ACLs 390, 24/24 unique indexes, script include, menu (48), forms and lists (26/26), properties 10, 42 configuration records, demo users 0, no update records outside the scope. Admin roles 136 (unchanged).

## B5. Demo data and data preservation
- `--demoData=false` on every deploy; 0 `unload.demo` files; 0 demo records.
- Existing data preserved: issue_cat 8, issue_sub 24, onb_tmpl 10 (all other app tables empty, as before).

## B6. ATF results
ATF was enabled at about 06:58 UTC and disabled at about 07:55 UTC, before the W-2 tests. **Final state: OFF** (`sn_atf.runner.enabled=false`, verified twice).

| Run | Suite | Passed | Failed | Skipped | Cause / note |
|---|---|---|---|---|---|
| 1 | Security | 18 | 1 | 17 | Test bug: `GlideRecordSecure` returns no element for an unreadable field → helper crashed |
| 1 | Integrity | 10 | 1 | 8 | Test configuration: expected duplicate-key DB errors + `failOnServerError:true`. **No assertion failed.** |
| 2 | Security | 18 | 1 | 17 | Test bug: `GlideRecordSecure.isValidField()` is **false** for an unreadable field, so my typo guard misfired. That's strong evidence of field hiding. |
| 2 | **Integrity** | **19** | **0** | **0** | ✅ **PASSED** |
| 3 (final) | **Security** | **34** | **1** | **1** | **D-2** (platform admin reads DOB); the REST step was skipped by ATF and covered in B7 |

**Integrity suite (passed), assertions verified as real personas:**
- Instructor's first attendance insert **succeeds**, then the duplicate is **rejected**, leaving exactly 1 row.
- Faculty's own first attendance succeeds; a same-date duplicate is **rejected**.
- Instructor, registrar and Campus360 admin all get **canDelete = false**, and `deleteRecord()` is refused.
- An instructor can correct the status (persisted); the `student` and `locked` fields aren't writable.
- A technician **can't** set `escalated_incident`. An IT manager can set it while empty, then it's **no longer writable**, and a duplicate escalation is **blocked** (value unchanged).
- The Campus360 admin reads configuration (8 categories).

**Security suite (final run), per persona:**
| Persona | Rows | Restricted fields | Result |
|---|---|---|---|
| Student A | own ✓; B ✗; C ✗ | own DOB ✓, own guardian ✓ | ✅ |
| Instructor | enrolled A ✓; B ✗; C ✗; **dropped D ✗** | DOB ✗, phone ✗, guardian ✗ | ✅ |
| Other faculty | own-section C ✓; A ✗ | DOB ✗ | ✅ |
| Advisor | advisee B ✓; A ✗ | guardian ✗ | ✅ |
| HOD | dept A, D ✓; other dept C ✗ | DOB ✗, guardian ✗ | ✅ |
| Warden A | resident A ✓; C ✗; D ✗ | guardian name/phone ✓; relation ✗; DOB ✗; phone ✗ | ✅ |
| Warden B | resident C ✓; A ✗ | guardian ✓; DOB ✗ | ✅ |
| Campus360 admin | all ✓ | DOB ✓, guardian ✓ | ✅ (approved) |
| Leadership | A, C ✓ | DOB ✗, guardian ✗, phone ✗ | ✅ |
| **Platform admin without a Campus360 role** | A ✓ | **DOB = true (expected false)** | ❌ **D-2** |

ATF rolls back all its users and data (verified: 0 `c360.*` users after each run).

## B7. W-2: REST security evidence (non-admin users, real data)
Method: 8 temporary fictional users (`c360.rest.*@example.edu`) with random passwords (never written to the repository; the local copy is deleted) and real records. **Instance MFA for integrations is enforced**, so plain Basic auth initially returned **401** (correctly not counted as evidence). Only these temporary users were flagged *Web service access only* (identity type Machine); platform MFA settings were **not** changed.

| # | Request (user) | HTTP | Response | Verdict |
|---|---|---|---|---|
| 1a | GET other student B (student A) | **403** | "User Not Authorized – Failed API level ACL Validation" | ✅ denied |
| 1b | GET own record A (student A) | 403 | same | ✅ REST disabled by design for personal tables |
| 1c | LIST students (student A) | 403 | same | ✅ |
| 2a | GET unrelated student B (instructor) | **403** | same | ✅ |
| 2b | GET enrolled student A (instructor) | 403 | same | ✅ by design |
| 3a | GET other-hostel resident B (warden A) | **403** | same | ✅ |
| 3b | GET own resident A (warden A) | 403 | same | ✅ by design |
| 4a | GET A with guardian_phone + DOB fields (leadership) | **403** | same | ✅ |
| 4b | Blind query `guardian_phoneSTARTSWITH+1999` (instructor) | **403** | same | ✅ |
| 5a/5b | LIST students / enrollments (registrar, authorised role) | 403 / 403 | same | ✅ intended: REST off for everyone |
| 6a | LIST own IT issues (caller A) | **200** | 1 record (own) | ✅ row ACL |
| 6b | LIST IT issues (student B) | **200** | **0 records** | ✅ empty because ACL-filtered (A's issue exists) |
| 6c | GET A's issue directly (student B) | **404** | "No Record found … or ACL restricts the record retrieval" | ✅ denied |
| 6d | GET own issue with work_notes (caller A) | 200 | `work_notes` **not returned** | ✅ field ACL |
| 6e | Aggregate API count (student B) | 200 | **stats.count=1** | ⚠️ **W-3:** count includes a record B can't read |
| 6f | Aggregate API count (caller A) | 200 | count=1 | ✅ |
| 6g | Aggregate API on the personal table (student A) | 403 | – | ✅ |
| 7 | Raw `sys_history_line` / `sys_audit` (leadership) | **403 / 403** | – | ✅ |
| 8 | Platform admin UI session GET student A (DOB) | 200 | DOB returned | Admin holds the Campus360 admin role (approved); also see D-2 |

## B8. Remaining manual verification
| Area | Evidence | Result |
|---|---|---|
| **Exports** | CSV export of the student list via Basic auth for 6 personas → **403** (web-service switch on the personal table). Control: the same export on REST-enabled tables → 200, and the it_issue export contained **only the caller's own row**. Interactive exports use row and field ACLs (verified below via `GlideRecordSecure`). | ✅ |
| **Reference lookups** (picker = ACL-enforced query) | student → A only; instructor → A only; warden A → A only; warden B → B only; leadership, registrar, HOD → A and B | ✅ |
| **Personal-field visibility** | Matches the approved matrix for every persona (B6 and impersonation checks) | ✅ (except D-2) |
| **List editing** | Warden A: own room row ✓, `status` ✓, **`occupied` ✗**; other hostel's room hidden. Student and leadership: no room edits. Student can't edit own profile row; registrar can. | ✅ |
| **Role-based navigation** (Campus360 modules visible) | student 0 · instructor 0 · warden 5 · leadership 8 · registrar 13 · HOD 13 | ✅ (students and faculty use portals) |
| **Self-service** | Student reads own record and own personal fields | ✅ |
| **Warden boundaries** | Own hostel only, for rows, guardian contact and rooms | ✅ |
| **Audit history (RT-6)** | When each user opens a record's history, the lines are generated **for that viewer**: leadership, itil+HOD and instructor see **0** DOB lines; student (self) and registrar see them (approved). Raw `sys_history_line` and `sys_audit` over REST → 403 for non-admins. **Residual (W-4):** lines generated for a privileged viewer stay readable through server-side `GlideRecordSecure` on `sys_history_line` until regenerated. The interactive raw-list URL path couldn't be tested headlessly. | ⚠️ W-4 |
| **Reports / dashboards** | No dashboards exist yet (Part 12). Report data paths: aggregate API is row-filtered for rows but **not for counts** (W-3); personal tables 403; `report_view` ACLs present. Interactive report rendering wasn't tested (needs a browser session). | ⚠️ partial |
| **Attendance history and immutability** | ATF integrity suite (B6) + earlier `sys_audit` evidence | ✅ |
| **Administrator** | Your `admin` keeps 136 roles (unchanged); the Campus360 admin reads all approved data | ✅ |

## B9. Temporary test data cleanup
| Data | Created | Removed | Remaining |
|---|---|---|---|
| ATF users and records (5 runs) | by ATF | ATF rollback | 0 |
| W-2 / manual fixture records | 17 | 6 via global script + **11 via REST DELETE (HTTP 204)**, exact sys_ids | 0 |
| Temporary users `c360.rest.*` (+ role links) | 8 | 8 | 0 |
| History sets for test records | 1 | 1 | 0 |
| Local password file | 1 | deleted | 0 |

Note: the global-scope cleanup couldn't delete 11 records because Campus360 tables have *"Can delete from other application scopes" = off* (correct default, left unchanged). The remaining records were deleted through the REST API, which applies the normal delete ACLs. Side effects: IT issue numbers up to ITI0001006 were consumed, and `sys_audit` keeps audit rows of the deleted test records (standard platform behaviour).

## B10. Unresolved findings and decisions needed
| ID | Severity | Finding | Evidence | Options (not implemented; need approval) |
|---|---|---|---|---|
| **D-2** | **High (privacy)** | A **platform `admin` without any Campus360 role can read student and faculty personal fields.** On ServiceNow, `admin` passes every **role** check, so role-only ACLs can't exclude it regardless of the admin-override setting. **This corrects my earlier SECURITY_AUDIT F1 statement.** Condition-based rules (attendance delete-deny) do hold against admins. | ATF security run 3, step 35 | (a) Add a script condition to the 93 sensitive-field ACLs requiring **explicit** membership (direct or inherited `sys_user_has_role`) of self / registrar / faculty_admin / Campus360 admin, so platform admins without those roles are denied. (b) Accept platform admins as trusted superusers (they can edit ACLs anyway) and document it. |
| **W-3** | Low | The aggregate (stats) API returns counts that include records the caller can't read (student B count=1, 0 readable). No content leaks. | B7 #6e | (a) Before-query business rule on `it_issue` (and other self-service tables) restricting non-staff to their own rows; it also filters counts. (b) Accept. |
| **W-4** | Low–Medium | Raw history lines generated for a privileged viewer remain readable by other record readers via `GlideRecordSecure` on `sys_history_line` until regenerated. REST access to them is 403. | B8 RT-6 | `sys_history_line` is a global platform table, outside Campus360's scope. Options: platform-team review of history ACLs, or `no_audit` on sensitive fields (conflicts with the audit requirement). |
| Info | – | Interactive (browser) report rendering and the raw list URL not tested | – | Manual browser check by you, or later UI ATF |

## B11. Final Campus360 status
| Item | Status |
|---|---|
| Application | **Installed, active**, v2.0.0, scope `x_774308_campus360` unchanged |
| Components | 26 tables · 13 roles · 9 groups · 390 ACLs · 24/24 unique indexes · script include · 48 modules · 2 ATF tests |
| D-1 | **Fixed and verified** on the instance |
| W-1 | **Done** (3 deleted; 3 legitimate remain) |
| W-2 | **Verified**: personal-data REST denied (403) for all non-admin users; row and field ACLs enforced on REST-enabled tables |
| ATF | Integrity **19/19 passed**; Security **34 passed / 1 failed (D-2) / 1 skipped (covered in B7)**; runner **OFF** |
| Demo data | None · temporary data fully cleaned |
| Platform changes | None to schema or ACLs. Temporary: ATF property (restored), temporary users (deleted). Persistent approved: admin role assignment (Part A). |
| Part 4+ | **Not started** |

---

# Part C: Security hardening + React portal release (rev 3), deployed 2026-11-11

> Approval: "I APPROVE DEPLOYMENT OF CAMPUS360 VERSION 2.0.0", package `target/campus_360_2_0_0.zip`, SHA-256 `1A6D5DC9…5150F`.
> All times are UTC; the instance clock is UTC and the workstation is UTC+05:30. Every instance check ran through `now-sdk exec` in **global** scope, so verification couldn't create app-scope privilege records, except the one cleanup step noted in C9.

## C1. Overall result
**Deployment succeeded (exit 0) and the security boundaries hold on the instance.** No security regression, no unexpected data change, and nothing outside the Campus360 scope was modified.

Post-deployment testing found:
- **three code defects** in the new release: DEF-1 to DEF-3. All fail **closed** except DEF-1, which is a narrow script-only gap in a new control. None expose data.
- **one pre-existing ACL gap** from Part 2: GAP-4.

Two ATF tests stopped at their first failure, so their later steps didn't run. Per your instruction, **no further changes were made**: no code edits, no redeploy, no rollback. A fix-forward plan is in C10 and **needs your approval**.

## C2. Pre-deployment checks
| # | Check | Result |
|---|---|---|
| 1 | Package SHA-256 | ✅ `1A6D5DC92D72B607C964063326F716CF4BF09B5AB62CB9D63D0B5DD361B5150F`, exact match |
| 1b | Package contents = install source | ✅ all **2,077** zip entries byte-identical to `dist/app` (the folder `now-sdk install` deploys); no extra files |
| 2 | Read-only baseline downloaded | ✅ `C:\Users\cgtir\OneDrive\Desktop\Campus360_baselines\pre-deploy-rev3-2026-11-11\`: **1,908 files**, 4,579 KB. Contains 390 ACLs, 26 tables, 0 business rules, 2 ATF tests. The SDK download omits JS modules, so the **5 installed `sys_module` records** were exported read-only to `installed_sys_modules.json` (D-1-fixed code, no rev-3 code). |
| 3 | Baseline saved and accessible | ✅ every file set **read-only**; SHA-256 manifest `pre-deploy-rev3-2026-11-11.sha256.txt`; re-verified after the deployment: **1,908 / 1,908 intact** |
| 4 | Manifest re-verified | ✅ 411 ACLs, 9 BRs, 18 REST operations, 4 ATF tests / 111 steps |
| 5 | Destructive operations / global tables | ✅ **0** `DELETE` actions. 151 `delete_multiple`, **all 151 keyed to sys_ids inside the package** (0 foreign). **0** tables or dictionary entries outside the scope. |
| 6 | `--demoData=false` | ✅ `package.json` deploy script = `now-sdk install --demoData=false` |
| 7 | In-place (no `--reinstall`) | ✅ |
| – | Instance before (read-only snapshot, 09:57) | v2.0.0 active; 26 tables; 13 roles; 9 groups; **390** ACLs; 0 BRs; no REST API or UI page; 2 ATF tests (55 steps); data = base configuration only (42 records); 3 scope privileges; ATF runner off. Matches B11 exactly. |

## C3. Deployment
| Item | Value |
|---|---|
| Command | `npm run deploy` → `now-sdk install --demoData=false` (alias `dev`, admin) |
| Time | 09:59:37 – 10:09:53 UTC (local client); exit code **0** |
| Platform rollback context | `284b03e0932817107430f01bdd03d661` (undo installation) |
| Package integrity note | `now-sdk install` **re-ran `pack` internally and overwrote** `target/campus_360_2_0_0.zip`; the new container hash is `DD314C44…C6DA9A`. Of `dist/app`, **only `package_inventory.csv` was rewritten** (15:29:47 local). All 2,076 application XML files keep their pre-approval timestamps and were proven byte-identical to the approved zip before install. **The deployed application content is exactly the approved content**; only the zip container and inventory listing were regenerated. |

## C4. Post-deployment verification (instance, read-only)
| Item | Expected | Actual |
|---|---|---|
| Application | installed, active, v2.0.0, scope unchanged | ✅ |
| Tables / roles / groups | 26 / 13 / 9 | ✅ 26 / 13 / 9 (group-role 11, role-contains 18, unchanged) |
| ACLs | 411 | ✅ **411 active** (role links 450); D-2 explicit-role scripts **73**; personal-field ACLs with admin override **0** |
| Workflow ACLs | technician + group condition; IT manager unconditional; warden + hostel condition; admin unconditional | ✅ verified on `it_issue.state`, `it_issue.close_notes`, `hostel_cmpl.state`, `hostel_cmpl.work_notes` (read); escalation ACL unchanged (it_manager, write-once) |
| Own-room ACL | student + `canStudentReadOwnRoom` | ✅ |
| Business rules | 6 query + 2 guards + 1 stamp, active | ✅ 9 active, correct table/when/action/order |
| Portal | REST API + 18 routes + UI page + module | ✅ "Campus360 Portal API" active, **18/18 routes active, all ACL-enforced and authenticated**; UI page (direct); 2 UX assets; module "Campus360 Portal" active |
| ATF | 4 tests, 111 steps | ✅ |
| Demo data | none | ✅ 0 demo users; data = issue_cat 8, issue_sub 24, onb_tmpl 10 (unchanged) |
| Global / platform changes | none | ✅ `sys_update_xml` outside the scope since deployment start: **none**; dictionary and ACLs on non-Campus360 objects: **0** |

## C5. ATF results (runner enabled 10:12:03 → disabled 10:26:15; final state **OFF**, verified)
| Test | Passed | Failed | Skipped | Result |
|---|---|---|---|---|
| C360 Security - Student profile access regression (Part 3) | **36** | 0 | 0 | ✅ **D-2 confirmed fixed** (step 35: platform admin without a Campus360 role can't read DOB) |
| C360 Integrity - Attendance and escalation regression | **23** | 0 | 0 | ✅ attendance duplicates blocked, no deletes, escalation write-once/IT-manager-only, W-3 IT-issue aggregates |
| C360 Portal - API end-to-end regression | 12 | **1** | 10 | ❌ step 13 (faculty): "own maintenance aggregate should be 1 but was 0" → **GAP-4** (C7) |
| C360 Security - Native workflow boundaries and statistics (rev 3) | 16 | **1** | 12 | ❌ step 17 (technician outside the group): emptying `assignment_group` via script wasn't aborted → **DEF-1** |
| **Total (111 steps)** | **87** | **2** | **22** | |

Assertions that passed on the instance before the stops:
- **Portal, student A (16 assertions):**
  - `/me`;
  - IT issue and hostel complaint created; spoofed hostel overridden;
  - My requests = 2;
  - queue, hostel, stats and admin refused;
  - **cannot cancel own issue (403)**;
  - W-3 aggregates: own = 1, others = 0;
  - invalid category 400.
- **Native, creator (14 assertions):**
  - cannot change state or resolve via ACL **and** script path;
  - description edit preserved;
  - **own FULL room readable; other full room hidden**;
  - counts: rooms 2, sessions 2, tasks 0;
  - **full-room resident raises hostel complaint → 201**.
- **Native, student B:** rooms 1; another student's full room not readable.
- **Native, technician outside the group:**
  - ownership write allowed;
  - state, assignment group and work-notes field ACLs denied;
  - cancel ignored on the ACL path and aborted on the script path.

## C6. Manual checks (impersonated temporary users + real REST), 10:20–10:26
Method: 7 temporary fictional users `c360.diag.*@example.edu` (technician outside the group, technician **in** *C360 Network & Wi-Fi Team*, faculty, warden A, warden B, IT manager, REST technician) and 7 `C360D` records, all removed in C9. "ACL path" = `GlideRecordSecure`, the same evaluation as forms and list editing. "Script path" = `GlideRecord` with business rules on. REST = real Table API and portal API calls with Basic auth as web-service-only temporary users (instance-generated random passwords, never written to disk).

| # | Check | Result |
|---|---|---|
| M27 | Technician outside the group, own-raised issue: **REST** `PATCH state=7` and `PATCH assignment_group` | ✅ 200 but **nothing stored** (state 1, group unchanged); `PATCH description` stored (ownership) |
| M27 | Same via ACL path (form/list edit) | ✅ state and group unchanged; field `canWrite` false; description edit stored |
| G1 | Same via script path | ✅ cancel aborted (state 1); reassign to another group aborted · ❌ **set group to empty → not aborted (DEF-1)** |
| M28 | Warden of another hostel, own-raised complaint: resolve via ACL and script path | ✅ state stays 1 on both paths; description edit stored |
| WA | Warden of the complaint's hostel resolves with notes | ✅ state 6, notes stored |
| **M29** | Technician **in** the group: start, then **hand off** to *Desktop & Hardware Support* | ✅ start allowed; **hand-off allowed** (ACL and script path); afterwards that technician **loses** write access (no longer their group) |
| ITM | IT manager cancels another group's issue; sets escalation link | ✅ cancel stored; escalation set, then **not writable again** (write-once) |
| AUD | Audit history (`sys_audit`) | ✅ cancel `1→7 by c360.diag.itmgr`; resolve `1→6` and `close_notes` `∅→… by c360.diag.wardena`; hand-off `assignment_group` changes by the technician (2 entries); escalation `∅→<incident> by c360.diag.itmgr` |
| M30 | Student in a **full** room raises a hostel complaint | ✅ ATF native step 13: 201 |
| PRT | Portal API as IT manager | ✅ `/me` (personas technician, it_manager), `/queue` scope all, `/stats`; **cancel without note → 400** · ❌ **note / assign-to-me / hold → 403 (DEF-2)** |
| PRT | Portal API as technician outside the group | ✅ start own other-group issue → **403**; queue `my_groups`, empty |
| JNL | Work-note persistence | ❌ **DEF-3**: `setValue('work_notes', …)` is silently ignored, even by platform admin; `work_notes.setJournalEntry()` works |
| FAC | Faculty creates a maintenance request (portal path) | ⚠️ record created and **visible to its creator** (query rule correct), but only defaults stored → **GAP-4** |
| BRW | Browser check of the React portal | ⏳ **not performed**: no browser is available to me in this session. Please open *Campus360 → Campus360 Portal*. |
| M31 | Stats API per persona for rooms/sessions/tasks | ✅ partly (student A/B via ATF) · ⏳ other personas: ATF steps skipped |

## C7. Findings (not fixed; awaiting your decision)
| ID | Severity | Finding | Evidence | Proposed fix |
|---|---|---|---|---|
| **DEF-1** | Low (security, narrow) | The workflow **guard misses changes that empty a field**. On this instance a `GlideElement` whose value is empty evaluates **falsy**, and the guard tested `!!el && el.changes()`. Only affects **script-path** updates (forms, list editing, REST and portal are blocked by ACLs, verified). Worst case: a technician who raised an issue in another group can *clear* its assignment group or notes from a server script run as themselves. They still can't work it. | ATF native step 17; G1b; read-only proof that `changes()` = true for an emptied reference | `el !== null && el !== undefined && el.changes()` in `workflow-guard.ts` |
| **DEF-2** | Medium (functional, fails closed) | **Portal lifecycle actions refuse authorised users** whenever the target field is currently empty (`assigned_to` on start/assign, `on_hold_reason`, `resolution_code`, `close_notes`, work notes), because of the same falsy-element check in `applyPlanned()`. The IT queue and warden complaint actions are effectively unusable in the portal. The native forms work. `pick()` also omits empty fields (cosmetic). | Portal API as IT manager: note, assign-me, hold → 403 | Null checks in `operations.ts` `applyPlanned()` and `http.ts` `pick()` |
| **DEF-3** | Medium (history) | **Work notes written with `setValue()` are silently discarded** on this instance (0 journal rows ever on any Campus360 table, including platform-admin writes). The portal's mandatory cancellation note is validated but not stored. **State changes are still audited** (AUD). | JNL: `setValue` → 0 rows; `setJournalEntry` / property assignment → stored | Write notes with `gr.work_notes.setJournalEntry(note)` in `applyPlanned()` |
| **GAP-4** | Medium (functional, pre-existing since Part 2) | `maint_req` has **no requester write/create path**. Faculty, technicians and wardens hold the *create* role, but fields without a field-create ACL fall back to the record **write** ACL (lab_admin / maintenance group only), so their requests store **only defaults**: no description, type or location. Native forms are affected too. The record **is** visible to its creator. | FAC: stored `short_description=null`, `type=null`, `location` empty | Field-create ACLs on `maint_req` for requester fields (the pattern used on `it_issue`), approved as an ACL change |
| **TEST-5** | – | Test scripts share the issues: `can()` in `native-check.js` uses `!!el` (false negatives on empty fields), and the ATF/portal checks write notes with `setValue`. | C6 "escalation canWrite (empty)=false" despite a successful write | Fix helpers; rerun all 4 tests (111 steps) |

**Not a security regression:**
- Every boundary that existed before still holds (Part 3 suite 36/36).
- D-2 is now enforced.
- Native ACL boundaries work on forms, list editing and REST.
- DEF-1 narrows a new control; before this release, that path had no protection at all.
- No data was exposed or unexpectedly changed (business data identical before and after: 42 configuration records).

**Rollback was therefore not triggered.** Rolling back would also remove D-2 and the working native boundaries.

## C8. Your post-deployment checklist
| # | Item | Status |
|---|---|---|
| 1 | Installed and accessible | ✅ |
| 2 | 26 tables, 13 roles, 9 groups, 411 ACLs | ✅ |
| 3 | Six statistics query rules | ✅ present and active; behaviour verified for the creator and student B (rooms, sessions, tasks) and IT issues/complaints (ATF); remaining personas pending a rerun |
| 4 | React portal + 18 REST routes | ✅ installed, active, ACL-enforced; read endpoints work · ❌ write actions DEF-2/3 |
| 5–7 | ATF enabled, 4 tests run, results recorded, runner OFF | ✅ 87 passed / 2 failed / 22 skipped; runner **OFF** (verified 10:26:15 and 10:27:43) |
| 8 | Manual checks incl. M29 | ✅ M27, M28, M29 (hand-off allowed), M30, audit · ⏳ browser |
| 9 | Forms, list editing, REST enforce the restrictions | ✅ (ACL path + real REST); script path ✅ except DEF-1 |
| 10 | Full-room students raise hostel complaints | ✅ |
| 11 | Cancel / resolve / escalation audited | ✅ state, close-notes and escalation audited · ❌ portal work notes not stored (DEF-3) |
| 12 | Browser check | ⏳ needs you |
| 13 | No demo data | ✅ |
| 14 | Baseline and rollback available | ✅ baseline intact (1,908/1,908); platform rollback context `284b03e0…d661`; portal-disable switches unchanged |

## C9. Platform changes and temporary data
| Item | Detail | Final state |
|---|---|---|
| ATF runner property | `sn_atf.runner.enabled` false → true (10:12:03) → **false** (10:26:15) | ✅ OFF |
| Temporary users | 7 `c360.diag.*` + 7 role links + 1 group membership | ✅ deleted; 0 remain |
| Temporary records | 2 hostels, 3 IT issues, 1 complaint, 1 maintenance request (`C360D*`), deleted in app scope with sys_id + marker identity checks; their journal entries went with them | ✅ 0 remain; `sys_audit` keeps the audit rows (standard) |
| ATF data | ATF rollback | ✅ none remain |
| **Scope privileges** (runtime access tracking) | **9 new**, recorded automatically. **6 are runtime needs of the deployed code:** "Glide API: user roles and groups" (query rules and guards, 10:10:25); `RESTAPIRequest`, `RESTAPIRequestBody`, `ScriptableServiceResultBuilder.setBody` / `.setStatus`, `sys_user_group` read (portal API, 10:22:55–56). **3 were created by my app-scope cleanup script** (10:26:42–43): `GlideRecord.deleteRecord`, "Glide API: scripting", `ResourceSupport`. | **Kept; your decision needed** to remove the 3 cleanup-created ones (as in W-1). The 9 in-scope `sys_update_xml` rows are these privilege records. |

## C10. Recommended next step (needs your approval)
**Fix forward as v2.0.0 rev 3.1**, in place, with the same pre-checks, baseline and evidence:
1. Fix DEF-1, DEF-2 and DEF-3 (three small code changes) and TEST-5.
2. Add the GAP-4 field-create ACLs on `maint_req`. This is an ACL change, so it needs explicit approval.
3. Add unit and build tests for the falsy-element and journal patterns.
4. Rebuild, test, package, and send you the hash for approval.
5. Redeploy in place, rerun all 4 ATF tests (111 steps), repeat the C6 checks, and clean up.

Alternatives: (b) only disable the portal's write actions until fixed (portal-disable §9.4 of the implementation report); (c) roll back via context `284b03e0…d661` (not recommended).

Part 4 and later: **not started.**

*(Outcome: you approved the fix-forward ("do whatever it requires"). Executed in Part D.)*

---

# Part D: Rev 3.1 fix-forward (2026-11-11 10:38–11:16 UTC)

## D1. Result
**Successful.** All findings from C7 are fixed and verified on the instance. **All 4 ATF tests pass: 111 of 111 steps** (rev 3: 87 passed / 2 failed / 22 skipped). No security regression, no data modification, nothing outside the Campus360 scope, no demo data. The ATF runner is OFF.

## D2. Changes
| ID | File | Change |
|---|---|---|
| DEF-1 | `src/server/issue/workflow-guard.ts` | `changes()` tests `el !== null && el !== undefined` (an empty GlideElement is falsy), so clearing a protected field is now caught. |
| DEF-2 | `src/server/portal/http.ts`, `operations.ts`, `academics.ts` | New `hasElement()` helper replaces `!el` in `applyPlanned()`, `pick()` and the registrar review (same defect found in `academics.ts`). |
| DEF-3 | `src/server/portal/operations.ts` | Work notes written with **property assignment** `gr.work_notes = note`. Probed **in the app scope** on a temporary record (deleted): `setValue` → not stored; property assignment on GlideRecord and GlideRecordSecure → stored. `setJournalEntry()` (the fix proposed in C7) is **not allowed in this scope** (`MethodNotAllowedException`, seen in the first rev 3.1 ATF run), so it is not used. |
| GAP-4 | `src/fluent/security/infrastructure.acl.now.ts` | **10 field-create ACLs** on `maint_req` (`caller, short_description, description, maintenance_type, request_type, location, laboratory, hostel, hostel_room, urgency`) for exactly the record-create roles (faculty, technician, warden, maintenance, lab_admin). Create only: **no record write was added**, so requesters still cannot edit work orders afterwards (verified). ACLs 411 → **421**. |
| GAP-4 (portal) | `src/server/portal/core.ts` | The portal now keeps the hostel on a maintenance request (it was only used to derive the location), so wardens see their hostels' work orders. |
| TEST-5 | `src/scripts/atf/native-check.js`, `portal-check.js` | Helpers fixed (presence check, property assignment for journals). New ATF assertions for DEF-2, DEF-3 and GAP-4. One over-strict expectation corrected: a faculty member cannot even *see* the student's issue ("invisible"), which is stricter than "visible but not writable". |
| Tests | `test/security/build-config.test.mjs`, `test/portal/core.test.mjs` | +16 tests: no GlideElement truthiness checks, no `setValue` on journal fields, no `setJournalEntry`, guard pattern, GAP-4 ACL wiring per field, no new write path on `maint_req`, hostel kept. **257/257 pass.** |

`keys.ts`: additions only (10 ACLs + 50 role links); 0 lines removed. No Table, BusinessRule or Record definition was deleted.

## D3. Deployments (all in place, `npm run deploy` = `now-sdk install --demoData=false`, no `--reinstall`)
| Run | UTC | Package SHA-256 (as built) | Rollback context | Why |
|---|---|---|---|---|
| 3.1 | 10:42:23–10:46:07 | `53BD4CEE…BF72CE` | `9e05d7e8936417107430f01bdd03d69d` | DEF-1/2/3, GAP-4, TEST-5 |
| 3.1b | 10:54:54–10:58:36 | `D6C4FBD9…62377A` | `37e7d7ac93a817107430f01bdd03d651` | DEF-3 corrected to property assignment; maintenance hostel kept |
| 3.1c | 11:06:07–11:10:11 | `869535BC…B81EE9` | `398a5f6c93e817107430f01bdd03d6a9` | ATF expectation only (no code or ACL change) |

After each install the built files (`dist/app`, 2,137 files) were byte-identical to the packaged ones (0 differences). As in Part C, `now-sdk install` re-packs the zip, so the zip hash on disk differs; the content does not. Between builds the only non-code differences are ATF step scripts and the SDK's regenerated placeholder IDs for the `task` parent of 6 tables; verified after each deploy that all 6 still extend `task`.

## D4. Baselines and rollback
| Baseline (read-only, with SHA-256 manifest) | State captured | Files |
|---|---|---|
| `Campus360_baselines\pre-deploy-rev3-2026-11-11` | before rev 3 | 1,908 (re-verified intact 10:39) |
| `Campus360_baselines\pre-deploy-rev31-2026-11-11` | live rev 3, before 3.1 | 2,063 (incl. 18 exported JS modules) |
| `Campus360_baselines\pre-deploy-rev31b-2026-11-11` | live 3.1, before 3.1b | 2,126 |

**Deviation:** the baseline download before 3.1c failed (network reset, `ECONNRESET`) and my combined command did not stop, so 3.1c was installed without its own extra baseline. Impact is nil: 3.1c changed only ATF test scripts, the 3.1b state is covered by the platform rollback context `398a5f6c…d6a9`, and the exact 3.1b package is kept (`campus_360_2_0_0_rev31b.zip`, session scratchpad). Rollback to rev 3: context `9e05d7e8…d69d`; to before rev 3: `284b03e0…d661`.

## D5. Post-deploy verification (3.1c, read-only, global scope)
| Check | Result |
|---|---|
| App | Campus360 2.0.0, active |
| Tables / roles / groups | 26 / 13 / 9 |
| ACLs | **421 active**, 500 role links; 73 D-2 explicit-role scripts; 0 personal-field ACLs with admin override |
| Business rules | 9 active (6 query rules, 2 workflow guards, 1 registrar stamp) |
| Portal | UI page + module active; REST API active, **18/18 routes**, all with ACL and authentication |
| Server modules | 18; the deployed `operations.ts` contains the DEF-3 fix |
| Task-extended tables | 6/6 still extend `task` |
| Outside scope | 0 `sys_update_xml` outside the app; 0 dictionary entries / overrides / ACLs on non-Campus360 objects |
| Data | config only (issue_cat 8, issue_sub 24, onb_tmpl 10); 0 `c360.*` users; no demo data |
| ATF runner | **false** (OFF at 11:02:35 and 11:13:53, confirmed 11:14:56) |

## D6. ATF results (final run 11:11–11:14 UTC)
| Test | Passed | Failed | Skipped |
|---|---|---|---|
| Part 3 security (student profile access, D-2) | 36 | 0 | 0 |
| Integrity (attendance and escalation) | 23 | 0 | 0 |
| Portal API end-to-end (7 personas) | 23 | 0 | 0 |
| Native workflow boundaries and statistics (9 personas) | 29 | 0 | 0 |
| **Total** | **111** | **0** | **0** |

Highlights now proven on the instance:
- **DEF-1:** a technician outside the group cannot clear the assignment group by script (guard aborts).
- **DEF-2:** an IT manager can start (empty assignee filled), add a note and assign to self in the portal; a warden can start and resolve with notes.
- **DEF-3:** start, note and cancellation work notes are journaled.
- **GAP-4:** a faculty request stores type, location, hostel and caller; the requester cannot edit it afterwards; a student cannot see it.
- Unchanged boundaries: creators cannot cancel/resolve; technicians outside the group get 403; wardens of another hostel cannot work complaints; students see only their own and available rooms; W-3 aggregates count only visible rows; D-2 holds.

Intermediate runs (recorded for completeness): 3.1 → 82 passed / 2 failed / 27 skipped (`setJournalEntry` blocked in scope; hostel not stored); 3.1b → 108/1/2 (over-strict faculty expectation).

## D7. Platform records changed by me in Part D
| Item | Final state |
|---|---|
| ATF runner property | toggled on/off three times; **OFF** |
| ATF data | removed by ATF rollback; 0 `c360.*` users, no test records |
| Journal probe | 1 temporary IT issue in app scope, deleted in the same script (verified) |
| Scope privileges | Removed the 3 created by my Part C cleanup (`GlideRecord.deleteRecord`, `Glide API: scripting`, `ResourceSupport`) and 3 created by my probe (`GlideRecord.setValue/update/insert`). **9 remain**, all runtime needs of the app. Both deletions ran with a rollback context. |

## D8. Still open
- **W-4** (residual raw-history-line path): open by your decision; no changes made.
- **Browser check:** done by you after Part D (portal loaded with all roles). Open `https://dev382380.service-now.com/x_774308_campus360_portal.do` (or *Campus360 → Campus360 Portal*). The portal shows content by **Campus360 role**; a platform `admin` with no Campus360 role sees "Campus360 access not set up". See the end-user guide §1 and the UI test plan M1–M31.
- Part 4 and later: **not started.**

---

# Part E: Portal visual redesign (2026-11-11 14:44–14:52 UTC)

**Requested by you** ("make my UI superb"). **Front-end only**: no server code, ACL, table, business rule, REST route or data change.

| Area | Change |
|---|---|
| Shell | Deep-indigo gradient sidebar with an icon per menu item, glowing active indicator, role chips and a "signed in securely" footer; glass top bar with breadcrumb, today's date and a user pill. |
| Dashboard | Gradient hero with a time-of-day greeting, primary actions and role chips; stat tiles with icons and animated counts; colourful **Quick actions** cards (role-aware, same server-authorised views); activity feed with type icons and skeleton loading; friendlier empty state. |
| All screens | New design tokens (indigo → violet → cyan brand palette, softer shadows, larger radii); stat tiles on Queue, Hostel, Classes, Attendance, Registrations and Insights inherit the new look; polished tables, steppers, timelines, progress bars; branded loading splash; page-entry animation. |
| Accessibility | All motion is disabled under `prefers-reduced-motion`; icons are `aria-hidden`; focus rings kept; real `<button>` elements for new actions; responsive drawer below 960 px. |
| Theme | Surfaces and text still follow the instance Horizon light/dark theme. |

Files: `src/client/components/icons.tsx` (new), `components/shell.tsx`, `components/ui.tsx`, `views/Dashboard.tsx`, `app.tsx`, `main.tsx`, `styles/tokens.css`, `styles/layout.css`, `styles/components.css`, `styles/showcase.css` (new; the stylesheet was split so both stay bundled into the page script, as before).

| Check | Result |
|---|---|
| Build (frozen keys, type check) | ✅; `keys.ts` unchanged |
| Tests | ✅ 257/257 |
| Package diff vs live | only the portal UI page + its 2 bundle assets (plus the SDK's regenerated `task` placeholder IDs); 421 ACLs; 0 deletes |
| Baseline | `Campus360_baselines\pre-deploy-ui-2026-11-11` (2,126 files, read-only, SHA-256 manifest); guarded: the deploy would not run if it failed |
| Deploy | `npm run deploy`, in place, 14:46:39–14:50:30 UTC, exit 0; rollback context `5efc443093a057107430f01bdd03d6ad` |
| Post-deploy | built files identical to the package; live bundle 435,086 bytes contains the new styles; 421 ACLs, 9 business rules, 18/18 routes, 9 scope privileges, 0 changes outside scope, no demo data, ATF runner OFF; all 6 task tables still extend `task` |

---

# Part F: "Campus records" in the portal (2026-11-11 15:30–16:10 UTC)

**Your report:** the ServiceNow navigator (*All → Campus360*) shows many entries (IT Issues, Students, Faculty, Academics, Attendance, Hostel, Labs & Infrastructure, Administration) but the portal sidebar showed only a few.

**Why:** they are two different menus. The navigator is generated from the **40 navigator modules** in `src/fluent/menu/campus360.menu.now.ts` (native list views of every table). The portal sidebar was designed as a **task workspace** (Dashboard, Requests, IT queue, My hostel, Maintenance, Registrations, Insights, Administration) and never listed those 40 modules. Nothing was missing or broken; the portal simply didn't offer them.

**Fix:** a new **Campus records** section in the portal sidebar that mirrors the navigator exactly: same 8 sections, same 40 entries, same titles, filters and role lists (unit-tested line by line against the menu file).

| Part | Detail |
|---|---|
| Sidebar | "Campus records" with collapsible sections, icons and counts; the section of the open list expands automatically. |
| Lists | `?view=browse&id=<entry>`: header, search, record count, **New** (only if you may create), refresh; columns = the table's native list layout; status/yes-no cells styled; click a row to open it. |
| Records | Ticket tables keep the request page (status timeline). All other tables (students, hostels, courses…) open the platform form inside the portal, with a link to the classic form. |
| Create New | "IT Issues → Create New" opens a new-record form in the portal. |
| Platform tables | *Campus Hardware Assets*, *Properties*, *Campus360 Groups* open the native list in a new tab (the portal never queries non-Campus360 tables). |
| Server | 2 new **read-only** routes: `GET /browse` (entries for your roles) and `GET /browse/{module}` (rows). Filters are **server-defined**; the browser sends only an entry key, never a query. Data is read with GlideRecordSecure as the user, so ACLs, D-2 field rules and the W-3 query rules decide every row and field (fields you can't read show "—"). Routes 18 → **20**, both behind the portal API ACL and authentication. |

Files: `src/server/portal/module-catalog.ts`, `src/server/portal/browse.ts` (new); `src/fluent/portal/portal-api.now.ts` (+2 routes); client `views/Browse.tsx`, `views/RecordView.tsx` (new), `components/shell.tsx`, `components/icons.tsx`, `context/session.tsx`, `services/api.ts`, `app.tsx`, `main.tsx`, `styles/records.css` (new); tests `test/portal/module-catalog.test.mjs` (new, 13), `portal-check.js` (+15 ATF assertions); `package.json` test script.

| Check | Result |
|---|---|
| `keys.ts` | additions only (2 routes, 2 modules; 0 removed) |
| Tests | ✅ **270/270** |
| Package diff vs live | +2 server modules, +2 REST operations; changed: portal page + 2 bundle assets, portal ATF steps, bundled `package.json` (test line); 421 ACLs; 0 deletes |
| Baseline | `Campus360_baselines\pre-deploy-records-2026-11-11` (2,126 files, read-only, SHA-256 manifest; guarded) |
| Deploy | in place, 16:02:02–16:06:31 UTC, exit 0; rollback context `8e3e5034932457107430f01bdd03d6e4` |
| Post-deploy | identical to package; 421 ACLs, 9 BRs, **20/20 routes** (both new ones ACL-enforced), 20 server modules; 0 changes outside scope; 9 scope privileges (none new); no demo data |
| ATF (16:07–16:09) | ✅ **111/111** (36 + 23 + 23 + 29). New checks: student sees 0 entries and gets 403 on IT lists; unknown entry 404; warden sees only *Hostel*, lists own hostel, 403 on Students; admin sees all 40, IT list includes the issue, the *Resolved* filter excludes it, platform tables are not listed by the portal (400). Runner OFF. |