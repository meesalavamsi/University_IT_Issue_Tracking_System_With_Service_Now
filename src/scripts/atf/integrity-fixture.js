(function (outputs, steps, params, stepResult, assertEqual) {
    // Runs IMPERSONATING "c360.test.admin" (x_774308_campus360.admin). Inserts via GlideRecordSecure.
    // ATF rolls back everything created during the test.
    var P = 'x_774308_campus360_';
    function userId(n) { var u = new GlideRecord('sys_user'); u.addQuery('user_name', n); u.query(); if (!u.next()) throw new Error('missing user ' + n); return u.getUniqueValue(); }
    function ins(table, v) {
        var g = new GlideRecordSecure(P + table); g.initialize();
        for (var k in v) g.setValue(k, v[k]);
        var id = g.insert(); if (!id) throw new Error('Fixture insert denied/failed on ' + table + ' ' + JSON.stringify(v));
        return id;
    }
    var d = ins('department', { code: 'C360I1', name: 'C360 Integrity Dept' });
    var p = ins('program', { code: 'C360I-P', name: 'Integrity Program', department: d, degree_level: 'ug', duration_years: 4, total_semesters: 8 });
    var t = ins('acad_term', { name: 'C360I Term', academic_year: '2097-98', term_type: 'odd', start_date: '2026-01-01', end_date: '2026-06-30' });
    var c = ins('course', { code: 'C360I-C', name: 'Integrity Course', department: d, credits: 3, course_type: 'theory' });
    var f = ins('faculty', { user: userId('c360.test.facteach'), employee_id: 'C360I-F1', department: d, designation: 'lecturer', employment_type: 'permanent', status: 'active' });
    var s = ins('course_sec', { course: c, term: t, section: 'I', faculty: f, max_students: 30, status: 'active' });
    ins('class_sess', { course_section: s, session_date: '2026-01-05', start_time: '1970-01-01 09:00:00', end_time: '1970-01-01 10:00:00', faculty: f, session_type: 'lecture' });
    var sA = ins('student', { user: userId('c360.test.studenta'), student_id: 'C360I-A', department: d, program: p });
    var sB = ins('student', { user: userId('c360.test.studentb'), student_id: 'C360I-B', department: d, program: p });
    ins('enrollment', { student: sA, course_section: s, status: 'enrolled' });
    ins('enrollment', { student: sB, course_section: s, status: 'enrolled' });

    var cat = new GlideRecord(P + 'issue_cat'); cat.get('code', 'software');
    ins('it_issue', { caller: userId('c360.test.studenta'), category: cat.getUniqueValue(), short_description: 'C360I escalation regression issue' });
    stepResult.setOutputMessage('Integrity fixture created (1 section, 1 session, 2 enrolled students, 1 IT issue)');
})(outputs, steps, params, stepResult, assertEqual);
