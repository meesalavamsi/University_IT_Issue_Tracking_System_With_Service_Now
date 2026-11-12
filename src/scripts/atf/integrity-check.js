(function (outputs, steps, params, stepResult, assertEqual) {
    // Runs as the IMPERSONATED persona; all assertions use GlideRecordSecure (ACLs enforced).
    // Plain GlideRecord is used only to resolve fixture sys_ids by their codes. setWorkflow(false) keeps the
    // W-3 before-query rules out of these TEST ORACLE lookups (the assertions themselves stay ACL/rule-enforced).
    var P = 'x_774308_campus360_';
    var me = gs.getUserName();
    var log = [];
    function id(table, field, value) { var g = new GlideRecord(P + table); g.setWorkflow(false); g.addQuery(field, value); g.query(); if (!g.next()) throw new Error('fixture missing ' + table + '.' + field + '=' + value); return g.getUniqueValue(); }
    function secIns(table, v) { var g = new GlideRecordSecure(P + table); g.initialize(); for (var k in v) g.setValue(k, v[k]); return g.insert() || ''; }
    function canWrite(gr, field) { if (!new GlideRecord(gr.getTableName()).isValidField(field)) throw new Error('Test error: unknown field ' + field); if (!gr.isValidField(field)) return false; var el = gr.getElement(field); return el !== null && el !== undefined && el.canWrite() === true; }
    function eq(name, shouldbe, value) { assertEqual({ name: me + ': ' + name, shouldbe: shouldbe, value: value }); log.push(name + '=' + value); }

    var sess = id('class_sess', 'course_section.section', 'I');
    var sA = id('student', 'student_id', 'C360I-A');
    var sB = id('student', 'student_id', 'C360I-B');
    var fac = id('faculty', 'employee_id', 'C360I-F1');
    var issue = id('it_issue', 'short_description', 'C360I escalation regression issue');

    if (me === 'c360.test.facteach') {
        // Prove permission first, then prove the duplicate is rejected by the unique index.
        var a1 = secIns('stu_attend', { class_session: sess, student: sA, status: 'present' });
        eq('instructor can mark attendance (first insert)', true, a1 !== '');
        var a2 = secIns('stu_attend', { class_session: sess, student: sA, status: 'absent' });
        eq('duplicate student attendance rejected', true, a2 === '');
        var cnt = new GlideAggregate(P + 'stu_attend'); cnt.addQuery('class_session', sess); cnt.addQuery('student', sA); cnt.addAggregate('COUNT'); cnt.query(); cnt.next();
        eq('exactly one attendance row for session+student', '1', String(cnt.getAggregate('COUNT')));

        var f1 = secIns('fac_attend', { faculty: fac, attendance_date: '2026-01-05', status: 'present' });
        eq('faculty can record own attendance (first insert)', true, f1 !== '');
        var f2 = secIns('fac_attend', { faculty: fac, attendance_date: '2026-01-05', status: 'absent' });
        eq('duplicate faculty attendance (same date) rejected', true, f2 === '');

        var del = new GlideRecordSecure(P + 'stu_attend'); del.get(a1);
        eq('instructor cannot delete attendance', false, del.canDelete());
        eq('deleteRecord() refused', false, del.deleteRecord());

        var u = new GlideRecordSecure(P + 'stu_attend'); u.get(a1);
        u.setValue('status', 'late'); u.setValue('remarks', 'C360I correction');
        eq('instructor can correct status (update succeeds)', true, !!u.update());
        var chk = new GlideRecord(P + 'stu_attend'); chk.get(a1);
        eq('correction persisted (history kept on same record)', 'late', chk.getValue('status'));
        var sf = new GlideRecordSecure(P + 'stu_attend'); sf.get(a1);
        eq('student field not editable after creation by instructor', false, canWrite(sf, 'student'));
        eq('system field "locked" not editable by instructor', false, canWrite(sf, 'locked'));
        outputs.table = P + 'stu_attend';
        outputs.record_id = a1;
    } else if (me === 'c360.test.registrar') {
        var r = new GlideRecord(P + 'stu_attend'); r.addQuery('class_session', sess); r.query(); r.next();
        var rs = new GlideRecordSecure(P + 'stu_attend'); rs.get(r.getUniqueValue());
        eq('registrar can read attendance', true, rs.isValidRecord());
        eq('registrar cannot delete attendance', false, rs.canDelete());
    } else if (me === 'c360.test.admin') {
        var r2 = new GlideRecord(P + 'stu_attend'); r2.addQuery('class_session', sess); r2.query(); r2.next();
        var as = new GlideRecordSecure(P + 'stu_attend'); as.get(r2.getUniqueValue());
        eq('Campus360 admin cannot delete attendance', false, as.canDelete());
        var fa = new GlideRecord(P + 'fac_attend'); fa.addQuery('faculty', fac); fa.query(); fa.next();
        var fs = new GlideRecordSecure(P + 'fac_attend'); fs.get(fa.getUniqueValue());
        eq('Campus360 admin cannot delete faculty attendance', false, fs.canDelete());
        var it = new GlideRecordSecure(P + 'issue_cat'); it.addQuery('active', true); it.query();
        eq('Campus360 admin reads configuration (8 categories)', 8, it.getRowCount());
    } else if (me === 'c360.test.tech') {
        var ti = new GlideRecordSecure(P + 'it_issue'); ti.get(issue);
        eq('technician (not IT manager) cannot write escalated_incident', false, ti.isValidRecord() ? canWrite(ti, 'escalated_incident') : false);
    } else if (me === 'c360.test.itmgr') {
        var inc = new GlideRecord('incident'); inc.setLimit(2); inc.query();
        var incs = []; while (inc.next()) incs.push(inc.getUniqueValue());
        eq('two incidents available for the test', 2, incs.length);
        var m1 = new GlideRecordSecure(P + 'it_issue'); m1.get(issue);
        eq('IT manager can set escalated_incident while empty', true, canWrite(m1, 'escalated_incident'));
        m1.setValue('escalated_incident', incs[0]); m1.update();
        var m2 = new GlideRecordSecure(P + 'it_issue'); m2.get(issue);
        eq('first escalation stored', incs[0], m2.getValue('escalated_incident'));
        eq('escalation link no longer writable once set', false, canWrite(m2, 'escalated_incident'));
        m2.setValue('escalated_incident', incs[1]); m2.update();
        var m3 = new GlideRecord(P + 'it_issue'); m3.get(issue);
        eq('duplicate escalation blocked (value unchanged)', incs[0], m3.getValue('escalated_incident'));
    } else if (me === 'c360.test.studentb') {
        // W-3: aggregate counts must match readable rows (issue belongs to student A).
        var ga = new GlideAggregate(P + 'it_issue'); ga.addQuery('short_description', 'C360I escalation regression issue'); ga.addAggregate('COUNT'); ga.query(); ga.next();
        eq('aggregate count of another student\'s issue is 0', '0', String(ga.getAggregate('COUNT')));
        var gs2 = new GlideRecordSecure(P + 'it_issue'); gs2.addQuery('short_description', 'C360I escalation regression issue'); gs2.query();
        eq('readable rows of another student\'s issue is 0', 0, gs2.getRowCount());
    } else if (me === 'c360.test.studenta') {
        var gaa = new GlideAggregate(P + 'it_issue'); gaa.addQuery('short_description', 'C360I escalation regression issue'); gaa.addAggregate('COUNT'); gaa.query(); gaa.next();
        eq('caller aggregate count of own issue is 1', '1', String(gaa.getAggregate('COUNT')));
    } else {
        throw new Error('No integrity expectations for ' + me);
    }
    stepResult.setOutputMessage(me + ': ' + log.join(', '));
})(outputs, steps, params, stepResult, assertEqual);
