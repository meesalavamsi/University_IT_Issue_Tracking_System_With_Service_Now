# Campus360 UI Test Plan

> Release: D-2 + W-3 (six tables) + native workflow security (rev 3) + Portal (v2.0.0 in-place update) · 2026-11-11
> Legend: ✅ passed · ⏳ pending deployment · 🧪 manual

## 1. Automated: local (passed)
| Suite | File | Tests | Result |
|---|---|---|---|
| Access rules (Part 3) | `test/security/access-rules.test.mjs` | – | ✅ |
| W-3 visibility policies: IT issues (12), hostel complaints (9), maintenance (8), **rooms (8), class sessions (5), onboarding tasks (3)** | `test/security/issue-visibility.test.mjs` | 45 | ✅ |
| **Rev 3** workflow authority (7 personas, protected field sets) | `test/security/workflow-authority.test.mjs` | 17 | ✅ |
| Build-output security: ACL counts, D-2 scripts, no admin override, 3 W-3 rules, REST ACL binding, no plain GlideRecord / GlideAggregate in portal, no workflow/audit bypass or deletes, authority checks wired, auditing on | `test/security/build-config.test.mjs` | – | ✅ |
| Portal rules: request validation, transitions, **Cancel requires a work note**, **complaint resolve requires notes**, **operational authority** (IT manager/admin/technician-in-group; admin/warden-of-hostel), marks, registrar review, personas | `test/portal/core.test.mjs` | – | ✅ |
| Build output, **rev 3**: per-field technician/warden conditions and manager/admin ACLs, guard BRs (update-only, abort-only), own-room ACL, 3 new query rules, and a generic check that every REST-enabled row-conditional table has a query rule | `test/security/build-config.test.mjs` | +29 | ✅ |
| **Total** (30 suites) | `npm test` | **241** | ✅ 241/241 |
| Type check and build (server, Fluent, React client) | `npm run build` | – | ✅ |
| Frozen keys check | build | – | ✅ |

## 2. Automated: on instance (ATF, after deployment) ⏳
Enable `sn_atf.runner.enabled`, run, then disable again. ATF creates temporary `c360.test.*` users and rolls everything back.

| ATF test | Key assertions |
|---|---|
| C360 Security - Student profile access regression (Part 3) | Includes step 35: platform admin **without** a Campus360 role cannot read DOB (**D-2**) |
| C360 Integrity - Attendance and escalation regression | Duplicate attendance blocked; attendance not deletable; escalation link write-once and IT-manager-only; **W-3**: student B aggregate count of A's issue = 0, A's own = 1 (fixture lookups now use `setWorkflow(false)` so the query rules don't break the lookup) |
| **C360 Security - Native workflow boundaries and statistics (rev 3)** (9 personas, 29 steps) | Each check on the **ACL path** (GlideRecordSecure, the same evaluation as forms, list edit and REST) and the **script path** (GlideRecord with the guard), then the true stored value. **Creator:** no cancel/resolve, description edit allowed, own **full** room readable, other full room hidden, full-room resident raises complaint (201), rooms 2 / sessions 2 / tasks 0 · **Student B:** rooms 1 · **Technician outside group (raised I2):** no state/reassign/work notes, both paths unchanged; rooms 3, sessions 0, tasks 0 · **Technician in group (real group member):** start → resolve → reopen, `sys_mod_count` +3, updated by them, work note journaled; can work a colleague's issue; no escalation write; tasks 1 · **IT manager:** cancels any issue; may set escalation; rooms 3 · **Warden of hostel:** resolves with notes (+2 history), works another warden's complaint in their hostel; rooms 2 · **Warden of other hostel (raised C2):** no state/close notes, both paths unchanged; C1 invisible; rooms 1 · **Faculty:** sessions 1, rooms 0, tasks 0 · **Campus360 admin:** resolves any complaint, rooms 3, sessions 2, tasks 2, admin overview 200 |
| C360 Portal - API end-to-end regression (7 personas, 16 steps + users) | **Student A:** `/me` 200, hostel from own allocation; IT issue and complaint 201 (spoofed hostel overridden); My requests = 2; queue/hostel/stats/admin 403; **cannot cancel own issue (403)**; W-3 aggregates own = 1, others = 0; invalid category 400 · **Faculty:** creates maintenance 201; W-3 own = 1, student's issue/complaint = 0; 404 on student issue; queue/hostel/stats/admin 403 · **Student B:** 404 on A's issue and complaint; W-3 aggregates of A's issue, A's complaint and faculty maintenance = 0; non-resident complaint 403 · **IT manager:** queue `all`; start → 2; illegal reopen 400; **cancel without note 400, state unchanged; cancel with note 200 → 7, note journaled, sys_mod_count incremented, sys_updated_by = actor**; stats 200 · **Technician (no group):** reads own issue; **start/cancel/assign-to-me on own issue in another group 403**, state unchanged; queue `my_groups` excludes it; stats 200 · **Warden:** only own hostel; guardian phone of own resident; other-hostel complaint not listed; **cannot resolve own complaint in another hostel (403)**; start 200; **resolve without or blank notes 400; with notes 200 → 6, notes stored, sys_mod_count incremented, updated by warden**; W-3 own-hostel complaint = 1 · **Campus360 admin:** overview 200 with 26 tables; stats 200 with ≥ 2 complaints; queue `all`; W-3 non-confidential complaint elsewhere = 1 |

## 3. Manual browser tests 🧪
Use the fictional test personas (temporary users, deleted afterwards) or impersonation from the `admin` account.

| # | Persona | Steps | Expected |
|---|---|---|---|
| M1 | Any Campus360 user | Open Campus360 → Campus360 Portal | Portal loads in the ServiceNow session; no login prompt; navigation matches role |
| M2 | User without Campus360 role | Open `/x_774308_campus360_portal.do` | "Campus360 access not set up"; API calls return 403 |
| M3 | Student | Raise an IT issue (category with `requires_lab`) | Lab field appears; record created; number shown; appears in My requests |
| M4 | Student (resident) | Raise a hostel complaint | Hostel taken from own allocation (not selectable); created as `HCP…` |
| M5 | Student (non-resident) | Raise a hostel complaint | Refused with a clear message |
| M6 | Student | Open own request; add a comment and an attachment | Native form works; comment saved |
| M7 | Student | Change URL to `?view=queue` | "Not available for your role"; API also 403 |
| M8 | Student | Change URL to another student's record id | "Record not found or not visible" |
| M9 | Technician | Queue shows only own groups or assigned; Assign to me → Start → Hold (reason) → Resume → Resolve | State changes follow §2 of the workflow guide; invalid actions not offered |
| M10 | IT manager | Queue shows all; "Older than 3 days" count; Cancel issue requires a work note and confirmation | State 7; note saved |
| M11 | Warden | My hostel: residents of own hostel with guardian contact; Start → Hold → Resume → Resolve (notes) on a complaint | Other hostels not shown; resolve without notes disabled |
| M12 | Faculty | Classes → Take attendance → Mark all present → change one → Save; Save again | One mark per student; second save updates |
| M13 | Faculty (not instructor) | Open roster of another section via URL | No students or 403 |
| M14 | Registrar | Recommend without documents verified | Refused; with verification → state Pending HOD, reviewer stamped |
| M15 | Registrar | Reject without reason | Refused |
| M16 | HOD | Registrations visible; no review controls | Read-only |
| M17 | Leadership | Campus insights | Counts only; no personal fields anywhere |
| M18 | Platform admin with **no** Campus360 role | Open a student record in the native form and list; try a report on DOB | DOB, phone and address hidden or denied (D-2) |
| M19 | Student | Stats API `GET /api/now/stats/x_774308_campus360_it_issue?sysparm_count=true` | Count = own issues only (W-3) |
| M20 | Any | Narrow window (< 960 px) | Menu button opens the navigation drawer; no horizontal scroll |
| M21 | Any | Keyboard only | All navigation and actions reachable; focus visible |
| M22 | Registrar | History of a student DOB change; then leadership opens `sys_history_line` list | W-4 retest (option A); record the result |
| M23 | IT manager | Cancel an issue with a note, then open the record's **History** (admin: `sys_audit` filtered by document key) | State change 2→7 audited; work note in the activity stream |
| M24 | Warden | Resolve a complaint, then check its **History** | State 6 and `close_notes` audited, by the warden |
| M25 | Student | Stats API on `x_774308_campus360_hostel_cmpl` and `x_774308_campus360_maint_req` (`sysparm_count=true`) | Only own records counted |
| M26 | Leadership | Report on hostel complaints grouped by type | Other people's confidential complaints not counted |
| M27 | Technician **outside** the group who raised an issue | Native form: State field; list view: inline-edit State; `PATCH /api/now/table/x_774308_campus360_it_issue/<id>` `{"state":"7"}` | Field read-only on the form; list cell not editable; REST leaves state unchanged |
| M28 | Warden of **another** hostel who raised a complaint | Same three paths on `hostel_cmpl` | Same: no state / close-notes change |
| M29 | Technician **in** the group | Native form: resolve; then change Assignment group to another group | Resolve works. Record whether hand-off is allowed (see NATIVE_WORKFLOW_SECURITY_FIX §5). |
| M30 | Student in a **full** room | Portal dashboard → My hostel; raise a hostel complaint | Room shown; complaint created |
| M31 | Student | `GET /api/now/stats/x_774308_campus360_hostel_room?sysparm_count=true` | Available rooms + own room only |

## 4. Exit criteria
- All ATF steps pass (failOnServerError is off only for expected duplicate-key tests).
- M1–M21 and M23–M31 pass. M22 is recorded as evidence for W-4.
- Test lookups (oracles) in the ATF scripts use `GlideRecord.setWorkflow(false)` so the W-3 query rules don't hide fixture records from the lookup itself. Every **assertion** still runs with ACLs and rules active. Product code never uses `setWorkflow(false)` (build test).
- ATF history checks use the journal, `sys_mod_count` and `sys_updated_by`. They deliberately do not read `sys_audit` from the app scope, because that would create a new cross-scope privilege record (see W-1). `sys_audit` is checked manually in M23 and M24.
- No browser console errors. No 500 responses in System Logs from `x_774308_campus360` during testing.
