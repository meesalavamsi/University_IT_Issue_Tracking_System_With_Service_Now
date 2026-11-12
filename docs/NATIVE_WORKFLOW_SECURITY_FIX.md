# Native-Form Workflow Security (revision 3)

> **Status:** implemented and validated locally · **not yet deployed** · 2026-11-11 · **Decision:** approved by the owner ("Standard ServiceNow form security — APPROVED")

## 1. Problem
The React portal enforced assignment-group and hostel boundaries in its own server code. The **platform layer** didn't, so standard forms, list editing and the REST Table API still allowed unauthorised status changes.

| Table | Record-write ACLs (unchanged) | Workflow field ACLs (before) | Gap |
|---|---|---|---|
| `it_issue` | it_manager (all) · technician **if `assignment_group` is one of my groups** · **caller / opened_by** (ownership) | `state`, `resolution_code`, `close_notes`, `work_notes`, `assignment_group`, … → **role `technician` only, no condition** | A technician who **raised** an issue assigned to another group passed the caller record ACL and the role-only field ACL, so they could cancel, resolve or reassign it |
| `hostel_cmpl` | warden **of the hostel** · Campus360 admin · **caller / opened_by** | `state`, `close_notes`, `work_notes`, … → **role `warden` only, no condition** | A warden who **raised** a complaint in another hostel could resolve it |

ServiceNow requires **both** the record ACL and the field ACL to pass. The ownership record ACL is legitimate (callers edit their description and add comments); the defect was the unconditional field ACLs.

## 2. Changes
### 2.1 Field ACLs (forms, list editing, REST Table API, GlideRecordSecure, portal)
| Table | Fields | Technician / warden ACL (existing `$id`, updated in place) | New ACL |
|---|---|---|---|
| `it_issue` | `state`, `on_hold_reason`, `resolution_code`, `close_notes`, `work_notes`, `assignment_group`, `assigned_to`, `priority`, `impact`, `urgency`, `caller`, `category` (12) | role `technician` **+ condition `assignment_group` is one of my groups** | `…-write-mgr`: role `it_manager` (⊂ Campus360 admin), unconditional (12 new) |
| `hostel_cmpl` | `state`, `close_notes`, `work_notes`, `assignment_group`, `assigned_to`, `priority` (6 write) + `work_notes` read | role `warden` **+ condition `hostel.warden = me OR hostel.assistant_warden = me`** | `…-admin`: role Campus360 `admin`, unconditional (7 new) |

Unchanged:
- Caller record-write ACLs, and the `short_description` / `description` / `comments` field ACLs, so ownership editing is preserved.
- Create ACLs, so reporters still set category, caller, impact and urgency when raising an issue.
- The IT-manager-only, write-once `escalated_incident` ACL (admin override off).
- Admin override stays as before on these operational ACLs.

### 2.2 Before-update guard business rules (scripted and other server-side paths)
ACLs aren't evaluated for scripts using plain `GlideRecord`, imports or integrations. Two guards close that path:

| Business rule | Table | Blocks a change to … unless the user … |
|---|---|---|
| C360 IT Issue - workflow changes need group authority | `it_issue` (before update, order 50) | the 12 fields above · is IT manager / Campus360 admin, **or** a technician who is a member of the issue's assignment group **before** the update |
| C360 Hostel Complaint - workflow changes need hostel authority | `hostel_cmpl` (before update, order 50) | the 6 fields above · is Campus360 admin, **or** a warden who is warden / assistant warden of the complaint's hostel **before** the update |

How the guards behave:
- Authority is judged on the **previous** values, so a user can't gain it by moving a ticket into their own group or hostel in the same update.
- Raising a ticket never confers authority.
- The guards only call `setAbortAction(true)` and show a message. They never write data, so audit history, journals and valid transitions are untouched.
- User `system` (scheduled jobs) is exempt.

Source:
- `src/server/issue/workflow-authority.ts` (pure, unit-tested)
- `src/server/issue/workflow-guard.ts`
- `src/fluent/logic/workflow-guard.now.ts`
- ACLs in `src/fluent/security/it-issue.acl.now.ts` and `hostel.acl.now.ts`

### 2.3 No additional platform privileges
- No new roles or role containment, and no group-role changes.
- No global or platform ACLs, and no global tables touched.
- New ACLs only re-grant access the IT manager / Campus360 admin roles already had through role containment (`it_manager ⊂ technician`, `admin ⊂ warden`).

## 3. Resulting authority
| Persona | IT issue: own group | IT issue: other group, raised by self | Complaint: own hostel | Complaint: other hostel, raised by self |
|---|---|---|---|---|
| Technician in the assigned group | ✅ all workflow actions | – | – | – |
| Technician outside the assigned group | ❌ | ❌ workflow · ✅ description / comments | – | – |
| Warden of the complaint's hostel | – | – | ✅ start / hold / resolve / notes | – |
| Warden of another hostel | – | – | – | ❌ workflow · ✅ description / comments |
| Original ticket creator (student, faculty, …) | ❌ workflow · ✅ description / comments | – | ❌ workflow · ✅ description / comments | – |
| IT manager | ✅ any issue | ✅ | – | – |
| Campus360 administrator | ✅ any issue | ✅ | ✅ any complaint | ✅ |

## 4. Tests
| Level | What | Result |
|---|---|---|
| Unit | `workflow-authority.test.mjs`: 17 tests (all 7 personas, allowed and denied, system context, protected field sets, ownership fields not guarded) | ✅ |
| Build output | Per field: exactly one technician ACL **with** the group condition and one unconditional IT-manager ACL; no caller path; the same for complaints (warden-hostel condition and admin); work-notes read; ownership ACLs kept; escalation unchanged; guards are update-only and call the module; guards never write data; own-room ACL | ✅ (25 tests) |
| Full suite | `npm test` | ✅ **241 / 241** |
| On instance (after deploy) | ATF **"C360 Security - Native workflow boundaries and statistics (rev 3)"**, with real personas created by ATF (the in-group technician is a real member of *C360 Network & Wi-Fi Team*). Each check runs on the **ACL path** (`GlideRecordSecure`, the same evaluation as forms, list editing and the REST Table API) and on the **script path** (plain `GlideRecord`, the guard), then reads the true stored value. | ⏳ |
| Manual | M27–M30 in the UI test plan (native form, list edit, REST PATCH) | ⏳ |

The ATF covers these allowed and denied cases:
- **creator**: cannot cancel or resolve (ACL and script); can edit the description
- **technician outside the group**: cannot change state, reassign or add work notes on their own-raised issue (ACL and script)
- **technician in the group**: start, resolve and reopen allowed; `sys_mod_count` +3; updated by them; work note journaled; can't set the escalation link
- **IT manager**: cancels any issue; may set the escalation link
- **warden of the hostel**: resolves the complaint (history recorded) and works a complaint raised by another warden in their own hostel
- **warden of another hostel**: cannot resolve their own-raised complaint (ACL and script)
- **Campus360 admin**: resolves any complaint

## 5. Limitations and notes
- **Platform admin** (`admin` role) still passes these operational ACLs (admin override on) and the guard (`gs.hasRole`). This matches the rest of the operational ACL design. Personal data is the area where admins are excluded (D-2).
- A technician can't **hand off** an issue by moving it to another group if the field-ACL condition is evaluated against the new value; the guard itself allows it (it judges previous values). If ATF or manual test M29 shows the form blocks hand-off, hand-offs go through IT managers, as with triage of unassigned issues. Recorded as an item to confirm on the instance.
- Unassigned issues (no group) can be worked only by IT managers, which is consistent with RL-06.
- Background scripts run by a platform admin, and `setWorkflow(false)` updates, bypass business rules. That is the platform-administrator boundary documented in D-2 §6.
