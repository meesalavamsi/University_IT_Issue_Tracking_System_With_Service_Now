(function (outputs, steps, params, stepResult, assertEqual) {
    // Runs IMPERSONATING the dedicated test user "c360.test.admin" (x_774308_campus360.admin).
    // All Campus360 inserts use GlideRecordSecure, so the fixture itself is subject to the app's ACLs.
    // ATF rolls back every record created during the test.
    var P = 'x_774308_campus360_';

    function userId(userName) {
        var u = new GlideRecord('sys_user');
        u.addQuery('user_name', userName);
        u.query();
        if (!u.next()) throw new Error('Fixture: test user not found: ' + userName);
        return u.getUniqueValue();
    }
    function ins(table, values) {
        var gr = new GlideRecordSecure(P + table);
        gr.initialize();
        for (var k in values) gr.setValue(k, values[k]);
        var id = gr.insert();
        if (!id) throw new Error('Fixture: insert denied/failed on ' + table + ' ' + JSON.stringify(values));
        return id;
    }
    function upd(table, id, values) {
        var gr = new GlideRecordSecure(P + table);
        if (!gr.get(id)) throw new Error('Fixture: cannot read ' + table + ' ' + id);
        for (var k in values) gr.setValue(k, values[k]);
        if (!gr.update()) throw new Error('Fixture: update denied on ' + table);
    }

    // Platform location reference (read-only lookup of an existing platform record).
    var loc = new GlideRecord('cmn_location');
    loc.setLimit(1);
    loc.query();
    if (!loc.next()) throw new Error('Fixture: no cmn_location record exists on this instance');
    var locId = loc.getUniqueValue();

    var d1 = ins('department', { code: 'C360T1', name: 'C360 Test Dept One' });
    var d2 = ins('department', { code: 'C360T2', name: 'C360 Test Dept Two' });
    var p1 = ins('program', { code: 'C360T-P1', name: 'Test Program 1', department: d1, degree_level: 'ug', duration_years: 4, total_semesters: 8 });
    var p2 = ins('program', { code: 'C360T-P2', name: 'Test Program 2', department: d2, degree_level: 'ug', duration_years: 4, total_semesters: 8 });
    var term = ins('acad_term', { name: 'C360T Term', academic_year: '2099-00', term_type: 'odd', start_date: '2099-01-01', end_date: '2099-06-30' });

    var fTeach = ins('faculty', { user: userId('c360.test.facteach'), employee_id: 'C360T-F1', department: d1, designation: 'asst_professor', employment_type: 'permanent', status: 'active' });
    var fOther = ins('faculty', { user: userId('c360.test.facother'), employee_id: 'C360T-F2', department: d2, designation: 'asst_professor', employment_type: 'permanent', status: 'active' });
    var fAdv = ins('faculty', { user: userId('c360.test.facadvisor'), employee_id: 'C360T-F3', department: d2, designation: 'professor', employment_type: 'permanent', status: 'active' });
    var fHod = ins('faculty', { user: userId('c360.test.hod'), employee_id: 'C360T-F4', department: d1, designation: 'professor', employment_type: 'permanent', status: 'active' });
    upd('department', d1, { hod: fHod });

    var base = { date_of_birth: '2005-05-05', personal_phone: '+10000000000', guardian_name: 'Test Guardian', guardian_relation: 'guardian', guardian_phone: '+19999999999', status: 'active' };
    function student(code, user, dept, prog, extra) {
        var v = { student_id: code, user: userId(user), department: dept, program: prog };
        for (var k in base) v[k] = base[k];
        for (var e in (extra || {})) v[e] = extra[e];
        return ins('student', v);
    }
    var sA = student('C360T-A', 'c360.test.studenta', d1, p1);
    student('C360T-B', 'c360.test.studentb', d2, p2, { advisor: fAdv });
    var sC = student('C360T-C', 'c360.test.studentc', d2, p2);
    var sD = student('C360T-D', 'c360.test.studentd', d1, p1);

    var course = ins('course', { code: 'C360T-C1', name: 'Test Course', department: d1, credits: 3, course_type: 'theory' });
    var sec1 = ins('course_sec', { course: course, term: term, section: 'A', faculty: fTeach, max_students: 60, status: 'active' });
    var sec2 = ins('course_sec', { course: course, term: term, section: 'B', faculty: fOther, max_students: 60, status: 'active' });
    ins('enrollment', { student: sA, course_section: sec1, status: 'enrolled' });
    ins('enrollment', { student: sD, course_section: sec1, status: 'dropped' });
    ins('enrollment', { student: sC, course_section: sec2, status: 'enrolled' });

    var h1 = ins('hostel', { code: 'C360TH1', name: 'Test Hostel One', hostel_type: 'co_ed', location: locId, warden: userId('c360.test.wardena') });
    var h2 = ins('hostel', { code: 'C360TH2', name: 'Test Hostel Two', hostel_type: 'co_ed', location: locId, warden: userId('c360.test.wardenb') });
    var r1 = ins('hostel_room', { hostel: h1, room_number: '101', room_type: 'double', capacity: 2, status: 'available' });
    var r2 = ins('hostel_room', { hostel: h2, room_number: '201', room_type: 'double', capacity: 2, status: 'available' });
    ins('room_alloc', { student: sA, hostel_room: r1, term: term, start_date: '2099-01-01', status: 'active' });
    ins('room_alloc', { student: sC, hostel_room: r2, term: term, start_date: '2099-01-01', status: 'active' });

    stepResult.setOutputMessage('Fixture created: 2 departments, 4 faculty, 4 students, 2 sections, 3 enrollments, 2 hostels, 2 allocations');
})(outputs, steps, params, stepResult, assertEqual);
