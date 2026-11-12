(function (outputs, steps, params, stepResult, assertEqual) {
    // Runs as "c360.test.admin" (Campus360 admin). ATF rolls everything back.
    // Reference/master data via GlideRecordSecure; the two edge-case tickets below need an explicit
    // caller, so they are inserted with GlideRecord in this (Campus360-scoped) test fixture only.
    var P = 'x_774308_campus360_';
    function uid(n) { var u = new GlideRecord('sys_user'); u.addQuery('user_name', n); u.query(); if (!u.next()) throw new Error('missing ' + n); return u.getUniqueValue(); }
    function ins(t, v) { var g = new GlideRecordSecure(P + t); g.initialize(); for (var k in v) g.setValue(k, v[k]); var id = g.insert(); if (!id) throw new Error('fixture insert failed ' + t); return id; }
    function raw(t, v) { var g = new GlideRecord(P + t); g.initialize(); for (var k in v) g.setValue(k, v[k]); var id = g.insert(); if (!id) throw new Error('fixture raw insert failed ' + t); return id; }
    var loc = new GlideRecord('cmn_location'); loc.setLimit(1); loc.query(); loc.next();
    var d = ins('department', { code: 'C360P1', name: 'C360 Portal Test Dept' });
    var p = ins('program', { code: 'C360P-P', name: 'Portal Program', department: d, degree_level: 'ug', duration_years: 4, total_semesters: 8 });
    var t = ins('acad_term', { name: 'C360P Term', academic_year: '2095-96', term_type: 'odd', start_date: '2026-01-01', end_date: '2026-06-30' });
    var sA = ins('student', { user: uid('c360.test.studenta'), student_id: 'C360P-A', department: d, program: p, guardian_name: 'Portal Guardian', guardian_phone: '+19990000777' });
    ins('student', { user: uid('c360.test.studentb'), student_id: 'C360P-B', department: d, program: p });
    var h = ins('hostel', { code: 'C360PH', name: 'Portal Test Hostel', hostel_type: 'co_ed', location: loc.getUniqueValue(), warden: uid('c360.test.wardena') });
    var r = ins('hostel_room', { hostel: h, room_number: 'P1', room_type: 'double', capacity: 2, status: 'available' });
    ins('room_alloc', { student: sA, hostel_room: r, term: t, start_date: '2026-01-01', status: 'active' });

    // Edge case 1: a hostel the warden does NOT run, with a complaint the warden raised (caller = warden).
    var h2 = ins('hostel', { code: 'C360PH2', name: 'Portal Other Hostel', hostel_type: 'co_ed', location: loc.getUniqueValue() });
    raw('hostel_cmpl', { hostel: h2, caller: uid('c360.test.wardena'), opened_by: uid('c360.test.wardena'), complaint_type: 'noise', short_description: 'C360P warden-raised complaint elsewhere' });

    // Edge case 2: an IT issue raised by a technician, assigned to a group the technician is NOT in.
    // Group taken from the category (C360 Network & Wi-Fi Team); the ATF technician belongs to no group.
    var cat = new GlideRecord(P + 'issue_cat'); cat.addQuery('code', 'campus_wifi'); cat.query();
    if (!cat.next() || !cat.getValue('assignment_group')) throw new Error('campus_wifi category or its group missing');
    raw('it_issue', { caller: uid('c360.test.tech'), opened_by: uid('c360.test.tech'), category: cat.getUniqueValue(), assignment_group: cat.getValue('assignment_group'), short_description: 'C360P technician own issue other group' });
    stepResult.setOutputMessage('Portal fixture created');
})(outputs, steps, params, stepResult, assertEqual);
