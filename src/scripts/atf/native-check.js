(function (outputs, steps, params, stepResult, assertEqual) {
    // Revision 3: native-form security + statistics, executed as the impersonated persona.
    //  - "ACL path"   = GlideRecordSecure (same ACL evaluation as forms, list editing and the REST Table API)
    //  - "script path"= plain GlideRecord with business rules ON (exercises the before-update guard)
    //  - "oracle"     = GlideRecord with setWorkflow(false), used ONLY to read the true stored state
    var P = 'x_774308_campus360_';
    var me = gs.getUserName();
    var log = [];
    function eq(name, shouldbe, value) { assertEqual({ name: me + ': ' + name, shouldbe: shouldbe, value: value }); log.push(name + '=' + value); }
    function oracle(table, sd) { var g = new GlideRecord(P + table); g.setWorkflow(false); g.addQuery('short_description', sd); g.query(); if (!g.next()) throw new Error('fixture missing ' + sd); return g; }
    function truth(table, sd, f) { return oracle(table, sd).getValue(f); }
    function idOf(table, sd) { return oracle(table, sd).getUniqueValue(); }
    function sec(table, sd) { var g = new GlideRecordSecure(P + table); return g.get(idOf(table, sd)) ? g : null; }
    // rev 3.1 (TEST-5): an EMPTY GlideElement is falsy, so test presence explicitly; journal fields need
    // property assignment (setValue is discarded; setJournalEntry is not allowed in this scope).
    function can(table, sd, f) { var g = sec(table, sd); if (!g) return 'invisible'; var el = g.getElement(f); return el !== null && el !== undefined && el.canWrite() === true; }
    function put(g, vals) { for (var k in vals) { if (k === 'work_notes' || k === 'comments') g[k] = vals[k]; else g.setValue(k, vals[k]); } }
    function viaAcl(table, sd, vals) { var g = sec(table, sd); if (!g) return 'invisible'; put(g, vals); g.update(); return 'tried'; }
    function viaScript(table, sd, vals) { var g = new GlideRecord(P + table); g.addQuery('short_description', sd); g.query(); if (!g.next()) return 'invisible'; put(g, vals); g.update(); return 'tried'; }
    function count(table, q) { var ga = new GlideAggregate(P + table); ga.addEncodedQuery(q); ga.addAggregate('COUNT'); ga.query(); return ga.next() ? parseInt(ga.getAggregate('COUNT'), 10) : 0; }
    var ROOMS = 'hostel.codeINC360N1,C360N2', SESS = 'course_section.course.code=C360N-C', TASKS = 'short_descriptionSTARTSWITHC360N';
    var I1 = 'C360N student issue', I2 = 'C360N technician-raised issue', C1 = 'C360N student complaint', C2 = 'C360N other-warden complaint';

    if (me === 'c360.test.studenta') { // ORIGINAL TICKET CREATOR
        eq('creator may write own issue record (ownership)', true, sec('it_issue', I1).canWrite());
        eq('creator cannot write issue state', false, can('it_issue', I1, 'state'));
        eq('creator cannot write resolution / close notes', false, can('it_issue', I1, 'resolution_code') || can('it_issue', I1, 'close_notes'));
        viaAcl('it_issue', I1, { state: '7' });
        eq('ACL path: creator cancel ignored', '1', truth('it_issue', I1, 'state'));
        viaScript('it_issue', I1, { state: '6', resolution_code: 'fixed', close_notes: 'self-resolved' });
        eq('script path: creator resolve aborted by guard', '1', truth('it_issue', I1, 'state'));
        viaAcl('it_issue', I1, { description: 'C360N edited by caller' });
        eq('creator can still edit description (ownership preserved)', 'C360N edited by caller', truth('it_issue', I1, 'description'));
        eq('creator cannot write complaint state', false, can('hostel_cmpl', C1, 'state'));
        viaScript('hostel_cmpl', C1, { state: '6', close_notes: 'self-closed' });
        eq('script path: creator complaint resolve aborted', '1', truth('hostel_cmpl', C1, 'state'));
        // Statistics + own FULL room
        var own = new GlideRecordSecure(P + 'hostel_room'); own.addQuery('room_number', 'N101'); own.query();
        eq('own FULL room readable (ACL + query rule)', true, own.next());
        var other = new GlideRecordSecure(P + 'hostel_room'); other.addQuery('room_number', 'N201'); other.query();
        eq('other hostel\'s full room not readable', false, other.next());
        eq('room count = available + own full room (other full room hidden)', 2, count('hostel_room', ROOMS));
        eq('class sessions: students see the timetable', 2, count('class_sess', SESS));
        eq('onboarding tasks: none', 0, count('onboard_tsk', TASKS));
        var self = require('x_774308_campus360/campus360/2.0.0/src/server/portal/self-service.ts');
        var res = { status: 0, body: null, setStatus: function (s) { this.status = s; }, setBody: function (b) { this.body = b; } };
        self.createRequest({ pathParams: {}, body: { data: { kind: 'hostel', complaint_type: 'water_supply', short_description: 'C360N full-room resident complaint' } } }, res);
        eq('portal: resident of a FULL room can raise a hostel complaint', 201, res.status);
    } else if (me === 'c360.test.studentb') {
        eq('room count = available rooms only', 1, count('hostel_room', ROOMS));
        var o = new GlideRecordSecure(P + 'hostel_room'); o.addQuery('room_number', 'N101'); o.query();
        eq('another student\'s full room not readable', false, o.next());
    } else if (me === 'c360.test.tech') { // TECHNICIAN OUTSIDE THE ASSIGNED GROUP (and creator of I2)
        eq('can write own-raised issue record (ownership)', true, sec('it_issue', I2).canWrite());
        eq('cannot write state of own-raised issue in another group', false, can('it_issue', I2, 'state'));
        eq('cannot move it into another group', false, can('it_issue', I2, 'assignment_group'));
        eq('cannot write work notes', false, can('it_issue', I2, 'work_notes'));
        viaAcl('it_issue', I2, { state: '7' });
        eq('ACL path: cancel of own-raised issue ignored', '1', truth('it_issue', I2, 'state'));
        viaScript('it_issue', I2, { state: '7' });
        eq('script path: cancel aborted by guard', '1', truth('it_issue', I2, 'state'));
        var grpBefore = truth('it_issue', I2, 'assignment_group');
        viaScript('it_issue', I2, { assignment_group: '' });
        eq('script path: reassignment aborted by guard', grpBefore, truth('it_issue', I2, 'assignment_group'));
        eq('student issue (other group, not caller) not writable', false, sec('it_issue', I1).canWrite());
        viaScript('it_issue', I1, { state: '2' });
        eq('script path: state change on other group\'s issue aborted', '1', truth('it_issue', I1, 'state'));
        eq('onboarding tasks of groups I am not in: 0', 0, count('onboard_tsk', TASKS));
        eq('class sessions: none (no read ACL)', 0, count('class_sess', SESS));
        eq('rooms: technicians see all', 3, count('hostel_room', ROOMS));
    } else if (me === 'c360.test.techgrp') { // TECHNICIAN ASSIGNED TO THE ISSUE'S GROUP
        eq('can write state (assigned group)', true, can('it_issue', I1, 'state'));
        eq('can write work notes (assigned group)', true, can('it_issue', I1, 'work_notes'));
        eq('cannot write escalation link (IT managers only)', false, can('it_issue', I1, 'escalated_incident'));
        var before = parseInt(truth('it_issue', I1, 'sys_mod_count'), 10);
        viaAcl('it_issue', I1, { state: '2', work_notes: 'C360N picked up by group' });
        eq('ACL path: start work', '2', truth('it_issue', I1, 'state'));
        viaAcl('it_issue', I1, { state: '6', resolution_code: 'fixed', close_notes: 'C360N fixed by group' });
        eq('ACL path: resolve', '6', truth('it_issue', I1, 'state'));
        eq('resolution stored', 'fixed', truth('it_issue', I1, 'resolution_code'));
        viaScript('it_issue', I1, { state: '2' });
        eq('script path: reopen allowed for assigned group', '2', truth('it_issue', I1, 'state'));
        eq('history: every change recorded (sys_mod_count +3)', before + 3, parseInt(truth('it_issue', I1, 'sys_mod_count'), 10));
        eq('history: updated by the technician', me, truth('it_issue', I1, 'sys_updated_by'));
        eq('history: work note journaled', true, String(oracle('it_issue', I1).work_notes.getJournalEntry(-1)).indexOf('C360N picked up by group') > -1);
        viaAcl('it_issue', I2, { state: '-5', on_hold_reason: 'awaiting_parts' });
        eq('can work the other technician\'s issue in my group', '-5', truth('it_issue', I2, 'state'));
        eq('onboarding tasks of my group: 1', 1, count('onboard_tsk', TASKS));
    } else if (me === 'c360.test.itmgr') { // AUTHORISED IT MANAGER (not in the Wi-Fi group)
        eq('can write state on any group\'s issue', true, can('it_issue', I2, 'state'));
        viaAcl('it_issue', I2, { state: '7', work_notes: 'C360N cancelled by IT manager' });
        eq('ACL path: cancel', '7', truth('it_issue', I2, 'state'));
        eq('may set escalation link while empty', true, can('it_issue', I1, 'escalated_incident'));
        eq('rooms: all (technician role)', 3, count('hostel_room', ROOMS));
        eq('onboarding tasks: none of my groups', 0, count('onboard_tsk', TASKS));
    } else if (me === 'c360.test.wardena') { // WARDEN OF THE COMPLAINT'S HOSTEL
        eq('can write complaint state (own hostel)', true, can('hostel_cmpl', C1, 'state'));
        var b2 = parseInt(truth('hostel_cmpl', C1, 'sys_mod_count'), 10);
        viaAcl('hostel_cmpl', C1, { state: '2' });
        viaAcl('hostel_cmpl', C1, { state: '6', close_notes: 'C360N tap replaced' });
        eq('ACL path: resolve own-hostel complaint', '6', truth('hostel_cmpl', C1, 'state'));
        eq('close notes stored', 'C360N tap replaced', truth('hostel_cmpl', C1, 'close_notes'));
        eq('history: sys_mod_count +2', b2 + 2, parseInt(truth('hostel_cmpl', C1, 'sys_mod_count'), 10));
        eq('history: updated by warden', me, truth('hostel_cmpl', C1, 'sys_updated_by'));
        viaScript('hostel_cmpl', C2, { state: '2' });
        eq('script path: may work a complaint raised by another warden in MY hostel', '2', truth('hostel_cmpl', C2, 'state'));
        eq('rooms of my hostel', 2, count('hostel_room', ROOMS));
        eq('class sessions: none', 0, count('class_sess', SESS));
    } else if (me === 'c360.test.wardenb') { // WARDEN OF ANOTHER HOSTEL (creator of C2 in H1)
        eq('reads own-raised complaint (caller)', true, sec('hostel_cmpl', C2) !== null);
        eq('cannot write its state (not my hostel)', false, can('hostel_cmpl', C2, 'state'));
        eq('cannot write close notes', false, can('hostel_cmpl', C2, 'close_notes'));
        viaAcl('hostel_cmpl', C2, { state: '6', close_notes: 'closing my own' });
        eq('ACL path: resolve ignored', '2', truth('hostel_cmpl', C2, 'state'));
        viaScript('hostel_cmpl', C2, { state: '6', close_notes: 'closing my own' });
        eq('script path: resolve aborted by guard', '2', truth('hostel_cmpl', C2, 'state'));
        eq('student complaint in other hostel not visible', true, sec('hostel_cmpl', C1) === null);
        eq('rooms of my hostel only', 1, count('hostel_room', ROOMS));
    } else if (me === 'c360.test.faculty') {
        eq('class sessions: only the section I teach', 1, count('class_sess', SESS));
        eq('rooms: none', 0, count('hostel_room', ROOMS));
        eq('onboarding tasks: none', 0, count('onboard_tsk', TASKS));
        eq('cannot work IT issues (not writable, or not even visible)', true, can('it_issue', I1, 'state') !== true);
    } else if (me === 'c360.test.admin') { // CAMPUS360 ADMINISTRATOR
        eq('can write complaint state anywhere', true, can('hostel_cmpl', C2, 'state'));
        viaAcl('hostel_cmpl', C2, { state: '6', close_notes: 'C360N resolved by admin' });
        eq('ACL path: admin resolves', '6', truth('hostel_cmpl', C2, 'state'));
        eq('can write issue state (IT manager role)', true, can('it_issue', I1, 'state'));
        eq('rooms: all', 3, count('hostel_room', ROOMS));
        eq('class sessions: all (registrar)', 2, count('class_sess', SESS));
        eq('onboarding tasks: all (faculty admin)', 2, count('onboard_tsk', TASKS));
        var ins = require('x_774308_campus360/campus360/2.0.0/src/server/portal/insights.ts');
        var r = { status: 0, body: null, setStatus: function (s) { this.status = s; }, setBody: function (b) { this.body = b; } };
        ins.getAdminOverview({ pathParams: {} }, r);
        eq('admin overview 200', 200, r.status);
    } else throw new Error('no native-security expectations for ' + me);
    stepResult.setOutputMessage(me + ': ' + log.join(', '));
})(outputs, steps, params, stepResult, assertEqual);
