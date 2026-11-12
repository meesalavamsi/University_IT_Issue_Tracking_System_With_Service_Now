# Campus360: Deployment Plan, Parts 2 + 3 → dev382380

> **Status:** awaiting your approval. Nothing has been deployed.
> **Target:** `https://dev382380.service-now.com` (credential alias `dev`, user `admin`) · Australia Patch 7
> **Package:** `campus360` 2.0.0 · scope `x_774308_campus360` (scopeId `0fa4e9c7e087434bb52c03096bab3ae9`)

## 1. What will be installed

| Component | Count | Notes |
|---|---|---|
| Scoped application record | 1 | Created on first install (the scope doesn't exist yet) |
| Tables (6 based on `task`) | 26 | 299 custom fields; 24 unique and 37 non-unique indexes |
| Roles / role containment links | 13 / 18 | `x_774308_campus360.*` |
| Groups / group role grants | 9 / 11 | `C360 …` groups, created as Campus360 records |
| System properties | 10 | Includes `security.debug=false` and `demo.enabled=false` |
| ACLs | 390 | 220 field-level, 39 deny, 81 condition-based, 4 scripted (Part 3) |
| Script include / server modules | 1 / 3 | `C360Security`; `access-rules`, `glide-access-data`, `c360-security` |
| Forms / list layouts | 26 / 26 | Default view |
| Navigator menu / modules | 1 / 48 | "Campus360" |
| Configuration records | 42 | 8 issue categories, 24 subcategories, 10 onboarding templates |
| ATF test | 1 (36 steps) | Inactive until ATF is enabled; creates no data at install time |
| **Demo data** | **0** | The deploy script uses `--demoData=false` (the CLI default is `true`) |
| Changes to global/platform tables | **0** | Verified by build validation |

## 2. Pre-deployment checks (run immediately before install)

| # | Check | Command | Expected |
|---|---|---|---|
| 1 | Clean build | `npm run build` | Build completed successfully |
| 2 | Keys stable | `npx now-sdk build --frozenKeys` | Build completed successfully |
| 3 | Local tests | `npm test` | 92/92 pass |
| 4 | Credentials | `npx now-sdk auth --list` | `dev` → dev382380 |
| 5 | Scope still free | `query sys_scope -q "scope=x_774308_campus360"` | 0 records |
| 6 | PDI awake | Log in at the PDI URL | Instance responds (PDIs hibernate) |

## 3. Deployment step (requires your approval)

```
npm run deploy        # = now-sdk install --demoData=false   (alias dev is the default)
```
- Installs the scoped app from `dist/app` (asynchronous install, about 2–10 minutes).
- **Not** used: `--reinstall` (it would uninstall first; not needed on a first install).
- Afterwards: `npx now-sdk install --info` reports the install result.

## 4. Post-deployment verification (read-only, I run these)

| # | Verification | Expected |
|---|---|---|
| V1 | `sys_app` / `sys_scope` for `x_774308_campus360` | 1 record, version 2.0.0 |
| V2 | `sys_db_object` name starts with `x_774308_campus360_` | 26 |
| V3 | `sys_index` on stu_attend, fac_attend, enrollment, student, … | 24 unique indexes present |
| V4 | `sys_user_role` name starts with `x_774308_campus360.` | 13 |
| V5 | `sys_security_acl` name starts with `x_774308_campus360_` | 390 |
| V6 | `sys_script_include` C360Security; `sys_module` ×3 | Present, active |
| V7 | `sys_app_module` for the Campus360 menu | 48 |
| V8 | Demo records (`sys_user` user_name starts with `c360.`) | 0 |
| V9 | `ws_access` on 8 personal-data tables | false |

## 5. Optional post-deployment steps (each needs separate approval)

| # | Step | Instance change | Why |
|---|---|---|---|
| O1 | Give your `admin` user `x_774308_campus360.admin` | 1 user-role record | Without it the Campus360 menu is hidden, and personal fields stay hidden from you by design (security audit F1) |
| O2 | Set `sn_atf.runner.enabled = true` | 1 system property | ATF execution is disabled on the PDI by default |
| O3 | Run the regression suite: `npx now-sdk cicd test run --test-name "C360 Security - Student profile access regression (Part 3)"` | Temporary users and records, **rolled back by ATF** | Live proof of RL-02/RL-04/RL-04g, admin, restricted fields and REST |
| O4 | Manual runtime checks RT-3 (report), RT-4 (export), RT-5 (REST 403), RT-6 (history), RT-7 (list edit) | None (read-only) | Paths ATF can't fully cover |
| O5 | Set `sn_atf.runner.enabled` back to `false` | 1 property | Restore the original setting |

## 6. Rollback

| Situation | Action |
|---|---|
| Install fails partway | Re-run `npm run deploy`. The install is idempotent: the same sys_ids update in place. |
| Remove completely | System Applications → My Company Applications → Campus360 → **Uninstall**. This removes all app metadata and app-table data. Safe now, because no business data exists yet. |
| Undo optional steps | Remove the user role from O1; set the ATF property back (O5). ATF data is rolled back automatically. |

## 7. Risks

| Risk | Mitigation |
|---|---|
| PDI hibernated or slow | Wake it first; asynchronous install with polling |
| The CLI installs demo data by default | `deploy` script pinned to `--demoData=false`; there's no demo payload anyway (0 `unload.demo` files) |
| A unique index fails to create | V3 verifies; none expected on empty tables |
| Platform admin can't see personal fields after install | Intended (F1); O1 grants the app admin role |
| Audit-history residual risk (RT-6) | Verified in O4; your decision afterwards |
