(function (outputs, steps, params, stepResult, assertEqual) {
    // Revision 3 fixture. Runs as "c360.test.admin" (Campus360 admin). ATF rolls everything back.
    // Master data via GlideRecordSecure; tickets with an explicit caller via GlideRecord (test setup only).
    var P = 'x_774308_campus360_';
    function uid(n) { var u = new GlideRecord('sys_user'); u.addQuery('user_name', n); u.query(); if (!u.next()) throw new Error('missing ' + n); return u.getUniqueValue(); }
    function ins(t, v) { var g = new GlideRecordSecure(P + t); g.initialize(); for (var k in v) g.setValue(k, v[k]); var id = g.insert(); if (!id) throw new Error('fixture insert failed ' + t + ' ' + JSON.stringify(v)); return id; }
    function raw(t, v) { var g = new GlideRecord(P + t); g.initialize(); for (var k in v) g.setValue(k, v[k]); var id = g.insert(); if (!id) throw new Error('fixture raw insert failed ' + t); return id; }
    function groupOf(code) { var c = new GlideRecord(P + 'issue_cat'); c.addQuery('code', code); c.query(); if (!c.next() || !c.getValue('assignment_group')) throw new Error('category/group missing ' + code); return { cat: c.getUniqueValue(), grp: c.getValue('assignment_group') }; }
    var wifi = groupOf('campus_wifi');   // C360 Network & Wi-Fi Team (the in-group technician's group)
    var desk = groupOf('hardware');      // C360 Desktop & Hardware Support
    var loc = new GlideRecord('cmn_location'); loc.setLimit(1); loc.query(); loc.next();

    // Academic structure: two sections, one taught by the ATF faculty user.
    var d = ins('department', { code: 'C360N1', name: 'C360 Native Test Dept' });
    var p = ins('program', { code: 'C360N-P', name: 'Native Program', department: d, degree_level: 'ug', duration_years: 4, total_semesters: 8 });
    var t = ins('acad_term', { name: 'C360N Term', academic_year: '2093-94', term_type: 'odd', start_date: '2026-01-01', end_date: '2026-06-30' });
    var c = ins('course', { code: 'C360N-C', name: 'Native Course', department: d, credits: 3, course_type: 'theory' });
    var fMine = ins('faculty', { user: uid('c360.test.faculty'), employee_id: 'C360N-F1', department: d, designation: 'lecturer', employment_type: 'permanent', status: 'active' });
    var fOther = ins('faculty', { user: uid('c360.test.itmgr'), employee_id: 'C360N-F2', department: d, designation: 'lecturer', employment_type: 'permanent', status: 'active' });
    var s1 = ins('course_sec', { course: c, term: t, section: 'N1', faculty: fMine, max_students: 30, status: 'active' });
    var s2 = ins('course_sec', { course: c, term: t, section: 'N2', faculty: fOther, max_students: 30, status: 'active' });
    ins('class_sess', { course_section: s1, session_date: '2026-01-06', start_time: '1970-01-01 09:00:00', end_time: '1970-01-01 10:00:00', faculty: fMine, session_type: 'lecture' });
    ins('class_sess', { course_section: s2, session_date: '2026-01-06', start_time: '1970-01-01 11:00:00', end_time: '1970-01-01 12:00:00', faculty: fOther, session_type: 'lecture' });

    // Hostels: H1 run by warden A, H2 by warden B. Student A lives in a FULL room in H1.
    var sA = ins('student', { user: uid('c360.test.studenta'), student_id: 'C360N-A', department: d, program: p });
    ins('student', { user: uid('c360.test.studentb'), student_id: 'C360N-B', department: d, program: p });
    var h1 = ins('hostel', { code: 'C360N1', name: 'Native Hostel One', hostel_type: 'co_ed', location: loc.getUniqueValue(), warden: uid('c360.test.wardena') });
    var h2 = ins('hostel', { code: 'C360N2', name: 'Native Hostel Two', hostel_type: 'co_ed', location: loc.getUniqueValue(), warden: uid('c360.test.wardenb') });
    var r1 = ins('hostel_room', { hostel: h1, room_number: 'N101', room_type: 'single', capacity: 1, status: 'full' });
    ins('hostel_room', { hostel: h1, room_number: 'N102', room_type: 'double', capacity: 2, status: 'available' });
    ins('hostel_room', { hostel: h2, room_number: 'N201', room_type: 'single', capacity: 1, status: 'full' });
    ins('room_alloc', { student: sA, hostel_room: r1, term: t, start_date: '2026-01-01', status: 'active' });

    // Tickets (all assigned to the Wi-Fi group).
    var a = uid('c360.test.studenta'), tech = uid('c360.test.tech'), wb = uid('c360.test.wardenb');
    raw('it_issue', { caller: a, opened_by: a, category: wifi.cat, assignment_group: wifi.grp, short_description: 'C360N student issue' });
    raw('it_issue', { caller: tech, opened_by: tech, category: wifi.cat, assignment_group: wifi.grp, short_description: 'C360N technician-raised issue' });
    raw('hostel_cmpl', { hostel: h1, hostel_room: r1, caller: a, opened_by: a, complaint_type: 'plumbing', short_description: 'C360N student complaint' });
    raw('hostel_cmpl', { hostel: h1, caller: wb, opened_by: wb, complaint_type: 'noise', short_description: 'C360N other-warden complaint' });

    // Onboarding tasks for two fulfilment groups.
    raw('onboard_tsk', { task_type: 'it_account', assignment_group: wifi.grp, short_description: 'C360N onboarding Wi-Fi task' });
    raw('onboard_tsk', { task_type: 'id_card', assignment_group: desk.grp, short_description: 'C360N onboarding desktop task' });
    stepResult.setOutputMessage('Native-security fixture created');
})(outputs, steps, params, stepResult, assertEqual);
