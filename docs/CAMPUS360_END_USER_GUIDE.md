# Campus360 User Guide

> For students, faculty, wardens, IT support, HODs, the registrar's office and university leadership. This guide describes the screens as built. No screenshots are included because the portal hasn't been deployed and photographed yet.

## 1. Opening Campus360
1. Log in to the university ServiceNow site with your normal account.
2. Open **Campus360 → Campus360 Portal** from the menu (it opens in a new tab), or go directly to `/x_774308_campus360_portal.do`.
3. The left menu shows only the screens for your role. On a phone or small window, tap **Menu** at the top.

If you see **"Campus360 access not set up"**, your account has no Campus360 role yet. Contact the Campus360 administrator.

## 2. Everyone: requests
### Raise a request (3 steps)
1. **Choose type:** IT issue, Hostel complaint (residents only) or Maintenance.
2. **Describe:**
   - **IT issue:** pick a category and optionally *What exactly?* (subcategory). If the category is lab-related, *Laboratory* becomes required. You can add *Room / spot* and *How urgent is it?*
   - **Hostel complaint:** pick the *Problem type*. Your hostel is taken automatically from your own room allocation.
   - **Maintenance:** pick the *Maintenance type* and either a *Laboratory* or a *Hostel*.
   - Always: a *Title* (at least 5 characters) and optional *Details*. Then select **Review**.
3. **Review & submit.** You'll get the request number (`ITI…` for IT issues, `HCP…` for hostel complaints, `MNT…` for maintenance) and can open it straight away.

### My requests
Lists every IT issue, hostel complaint and maintenance request you raised, with its state and last update. Select one to open its details.

### Request details
Shows a progress timeline (New → In Progress → Resolved → Closed, or On Hold / Cancelled) and the full ServiceNow form. Here you can add **comments** and **attachments**. Fields you're not allowed to change are read-only.

## 3. Students
- **Dashboard:** *My profile* (student ID, programme, department, semester/section, advisor, status), *My hostel* (room and bed if allocated), *My attendance* (percentage per enrolled section, highlighted below 75%), and your recent requests.
- **Hostel complaints:** only for your own hostel.
- Personal details (date of birth, phone, address) are visible to you and to the registrar's office only.

## 4. Faculty and HODs: Classes & attendance
1. Open **Classes & attendance** to see the sections you teach and sessions from the last 14 days.
2. Select **Take attendance** on a session.
3. Mark each student Present, Absent, Late, Excused, Medical or On duty. Use **All present** to speed this up, then change the exceptions. The page counts unsaved changes.
4. **Save.** Saving again updates the same marks; a student is never counted twice.

HODs also see **Registrations** (read-only) and **Campus insights**.

## 5. Wardens: My hostel
- Your hostels, with occupancy and rooms.
- Current residents, with guardian contact for **your** residents only.
- Open complaints, with the buttons valid for each one's state: **Start** (New), **Hold** (In Progress), **Resume** (On Hold), and **Resolve**, which asks for resolution notes. **Open** shows the full record, where you can add comments. You can act only on complaints of hostels where you are the warden or assistant warden.
- Wardens also see **Maintenance** and **Campus insights**.

## 6. IT support: IT work queue
- **Technicians** see open issues for their support groups or assigned to them. **IT managers** see all open issues.
- Counts of New / In progress / On hold, and **Older than 3 days**. Old items show their age in red. Filter by status or search by number, title or caller.
- Select an issue to **Assign to me**, **Start work**, **Put on hold** (choose a reason), **Resume**, **Resolve** (choose a resolution code and write notes), **Reopen**, **Cancel issue** (needs a work note of at least 5 characters and confirmation) or **Add work note**. Only actions valid for the current state are shown, and the server checks again. Technicians can work only issues assigned to one of their groups, even ones they raised themselves.

## 7. Facilities and lab administrators: Maintenance
Lists open maintenance requests you're permitted to see. **New work order** opens the request form, and each row opens the full record, where status changes are made.

## 8. Registrar's office: Registrations
Lists submitted and in-review registrations (and those pending HOD approval or approved). For a submitted or in-review registration:
- tick **Documents verified**;
- choose a **Recommendation**: recommend (moves to Pending HOD approval and needs documents verified), more information, or reject (needs a reason in *Verification notes*);
- select **Save review**. Your name and the time are recorded automatically.

HOD approval itself isn't available in the portal yet.

## 9. Leadership and managers: Campus insights
Counts and breakdowns of IT issues (by state, priority and category), complaints, maintenance, registrations and hostel occupancy, computed **only from records you are allowed to see**. No personal data appears.

## 10. Campus360 administrators: Administration
Row counts per Campus360 table, links to the native lists, and a list explorer. See the [Administrator Guide](CAMPUS360_ADMINISTRATOR_GUIDE.md).

## 11. Common questions
| Question | Answer |
|---|---|
| A screen says "Not available for your role" | The link isn't part of your role. Use the menu on the left. |
| A field is blank | You may not have permission to see it. This is deliberate for personal data. |
| "You are not allowed to change …" | Your role can't change that field or record in its current state. |
| My hostel complaint is refused | You need an active room allocation. Contact your warden. |
| Session expired | Reload the page; you'll be asked to log in again. |
