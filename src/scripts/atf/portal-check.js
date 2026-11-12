(function (outputs, steps, params, stepResult, assertEqual) {
    // Calls the REAL portal API handlers (server modules) as the impersonated persona.
    // Only the HTTP envelope is simulated; data access inside the handlers is GlideRecordSecure.
    // GlideAggregate checks prove the W-3 query rules (aggregates do not apply row ACLs by themselves).
    var base = 'x_774308_campus360/campus360/2.0.0/src/server/portal/';
    var self = require(base + 'self-service.ts');
    var ops = require(base + 'operations.ts');
    var ins = require(base + 'insights.ts');
    var brw = require(base + 'browse.ts');
    var P = 'x_774308_campus360_';
    var me = gs.getUserName();
    var log = [];
    function call(fn, pathParams, body) {
        var res = { status: 0, body: null, setStatus: function (s) { this.status = s; }, setBody: function (b) { this.body = b; } };
        fn({ pathParams: pathParams || {}, body: { data: body || null } }, res);
        return res;
    }
    function eq(name, shouldbe, value) { assertEqual({ name: me + ': ' + name, shouldbe: shouldbe, value: value }); log.push(name + '=' + value); }
    function agg(table, sd) { var ga = new GlideAggregate(P + table); ga.addQuery('short_description', sd); ga.addAggregate('COUNT'); ga.query(); return ga.next() ? parseInt(ga.getAggregate('COUNT'), 10) : 0; }
    // Test oracle only: setWorkflow(false) keeps W-3 query rules out of fixture lookups (assertions stay rule-enforced).
    function idOf(table, sd) { var g = new GlideRecord(P + table); g.setWorkflow(false); g.addQuery('short_description', sd); g.query(); return g.next() ? g.getUniqueValue() : ''; }
    function reread(table, id) { var g = new GlideRecordSecure(P + table); g.get(id); return g; }
    // Test oracle only (rev 3.1): the true stored value, independent of the persona's read ACLs.
    function stored(table, sd, f) { var g = new GlideRecord(P + table); g.setWorkflow(false); g.addQuery('short_description', sd); g.query(); return g.next() ? g.getValue(f) : 'missing'; }
    function journaled(id, text) { var g = new GlideRecord(P + 'it_issue'); g.setWorkflow(false); return g.get(id) && String(g.work_notes.getJournalEntry(-1)).indexOf(text) > -1; }
    var A_ISSUE = 'C360P Wi-Fi drops in room', A_CMPL = 'C360P no hot water', F_MAINT = 'C360P faculty projector fault';
    var W_ELSEWHERE = 'C360P warden-raised complaint elsewhere', T_OWN = 'C360P technician own issue other group';
    var cat = new GlideRecordSecure(P + 'issue_cat'); cat.addQuery('code', 'campus_wifi'); cat.query(); cat.next();

    if (me === 'c360.test.studenta') {
        var m = call(self.getMe);
        eq('me 200', 200, m.status);
        eq('persona student', true, m.body.data.personas.indexOf('student') > -1);
        eq('hostel resolved from own allocation', 'C360PH', m.body.data.hostel ? m.body.data.hostel.hostel.display.indexOf('Portal Test Hostel') > -1 ? 'C360PH' : 'other' : 'none');
        var it = call(self.createRequest, {}, { kind: 'it', category: cat.getUniqueValue(), short_description: A_ISSUE, urgency: '2' });
        eq('create IT issue 201', 201, it.status);
        var hc = call(self.createRequest, {}, { kind: 'hostel', complaint_type: 'water_supply', short_description: A_CMPL, hostel: '0000000000000000000000000000beef' });
        eq('create hostel complaint 201 (hostel forced to own allocation)', 201, hc.status);
        eq('complaint hostel is the resident hostel, not the spoofed value', 'Portal Test Hostel', reread('hostel_cmpl', hc.body.data.sys_id).getDisplayValue('hostel'));
        var mine = call(self.getMyRequests);
        eq('my requests lists both', 2, mine.body.data.filter(function (r) { return String(r.short_description.display).indexOf('C360P') === 0; }).length);
        eq('student refused IT queue', 403, call(ops.getQueue).status);
        eq('student refused hostel management', 403, call(ops.getHostel).status);
        eq('student refused statistics', 403, call(ins.getStats).status);
        eq('student refused admin overview', 403, call(ins.getAdminOverview).status);
        eq('student cannot work own issue (cancel)', 403, call(ops.issueAction, { id: it.body.data.sys_id }, { action: 'cancel', work_note: 'I want to cancel this' }).status);
        eq('W-3 own issue aggregate = 1', 1, agg('it_issue', A_ISSUE));
        eq('W-3 own complaint aggregate = 1', 1, agg('hostel_cmpl', A_CMPL));
        eq('W-3 others\' tickets aggregate = 0 (technician issue)', 0, agg('it_issue', T_OWN));
        eq('invalid category rejected 400', 400, call(self.createRequest, {}, { kind: 'it', category: 'not-a-sys-id', short_description: 'hello world' }).status);
        eq('records: student sees no navigator lists', 0, call(brw.getBrowseCatalog).body.data.length);
        eq('records: student refused IT list', 403, call(brw.getBrowseModule, { module: 'it-all' }).status);
        eq('records: unknown list 404', 404, call(brw.getBrowseModule, { module: 'sys_user' }).status);
    } else if (me === 'c360.test.faculty') {
        var hos = new GlideRecordSecure(P + 'hostel'); hos.addQuery('code', 'C360PH'); hos.query(); hos.next();
        var mr = call(self.createRequest, {}, { kind: 'maintenance', maintenance_type: 'electrical', hostel: hos.getUniqueValue(), short_description: F_MAINT });
        eq('faculty creates maintenance request 201', 201, mr.status);
        eq('GAP-4: requester\'s maintenance type stored', 'electrical', stored('maint_req', F_MAINT, 'maintenance_type'));
        eq('GAP-4: location stored', true, !!stored('maint_req', F_MAINT, 'location'));
        eq('GAP-4: hostel stored', hos.getUniqueValue(), stored('maint_req', F_MAINT, 'hostel'));
        eq('GAP-4: requested by the faculty member', gs.getUserID(), stored('maint_req', F_MAINT, 'caller'));
        eq('W-3 own maintenance aggregate = 1', 1, agg('maint_req', F_MAINT));
        eq('GAP-4: requester cannot edit the work order afterwards', false, reread('maint_req', mr.body.data.sys_id).canWrite());
        eq('W-3 student issue aggregate = 0', 0, agg('it_issue', A_ISSUE));
        eq('W-3 student complaint aggregate = 0', 0, agg('hostel_cmpl', A_CMPL));
        eq('faculty 404 on student issue', 404, call(self.getRecordSummary, { table: P + 'it_issue', id: idOf('it_issue', A_ISSUE) }).status);
        eq('faculty refused IT queue', 403, call(ops.getQueue).status);
        eq('faculty refused hostel management', 403, call(ops.getHostel).status);
        eq('faculty refused statistics', 403, call(ins.getStats).status);
        eq('faculty refused admin overview', 403, call(ins.getAdminOverview).status);
    } else if (me === 'c360.test.studentb') {
        eq('other student gets 404 on A\'s issue', 404, call(self.getRecordSummary, { table: P + 'it_issue', id: idOf('it_issue', A_ISSUE) }).status);
        eq('other student gets 404 on A\'s complaint', 404, call(self.getRecordSummary, { table: P + 'hostel_cmpl', id: idOf('hostel_cmpl', A_CMPL) }).status);
        eq('other student\'s list excludes A\'s issue', 0, call(self.getMyRequests).body.data.length);
        eq('W-3 A\'s issue aggregate = 0', 0, agg('it_issue', A_ISSUE));
        eq('W-3 A\'s complaint aggregate = 0', 0, agg('hostel_cmpl', A_CMPL));
        eq('W-3 faculty maintenance aggregate = 0', 0, agg('maint_req', F_MAINT));
        eq('non-resident cannot raise hostel complaint', 403, call(self.createRequest, {}, { kind: 'hostel', complaint_type: 'noise', short_description: 'C360P not a resident' }).status);
    } else if (me === 'c360.test.itmgr') {
        var q = call(ops.getQueue);
        eq('IT manager queue scope all', 'all', q.body.data.scope);
        var target = q.body.data.items.filter(function (i) { return i.short_description.display === A_ISSUE; })[0];
        eq('student issue visible in queue', true, !!target);
        var s = call(ops.issueAction, { id: target.sys_id }, { action: 'start', work_note: 'C360P picked up' });
        eq('start work 200', 200, s.status);
        eq('state now In Progress', '2', s.body.data.state.value);
        eq('DEF-2: start filled the empty assignee', gs.getUserID(), reread('it_issue', target.sys_id).getValue('assigned_to'));
        eq('DEF-3: start work note journaled', true, journaled(target.sys_id, 'C360P picked up'));
        eq('DEF-2: add note 200', 200, call(ops.issueAction, { id: target.sys_id }, { action: 'note', work_note: 'C360P manager note' }).status);
        eq('DEF-3: note journaled', true, journaled(target.sys_id, 'C360P manager note'));
        eq('DEF-2: assign to me 200', 200, call(ops.assignToMe, { id: target.sys_id }).status);
        eq('illegal transition rejected', 400, call(ops.issueAction, { id: target.sys_id }, { action: 'reopen' }).status);
        eq('cancel without work note rejected 400', 400, call(ops.issueAction, { id: target.sys_id }, { action: 'cancel' }).status);
        eq('state unchanged after rejected cancel', '2', reread('it_issue', target.sys_id).getValue('state'));
        var before = parseInt(reread('it_issue', target.sys_id).getValue('sys_mod_count'), 10);
        var c = call(ops.issueAction, { id: target.sys_id }, { action: 'cancel', work_note: 'C360P duplicate - cancelling' });
        eq('cancel with work note 200', 200, c.status);
        var after = reread('it_issue', target.sys_id);
        eq('state Cancelled (7)', '7', after.getValue('state'));
        eq('history: cancellation work note journaled', true, journaled(target.sys_id, 'C360P duplicate - cancelling'));
        eq('history: update went through the engine (sys_mod_count incremented)', true, parseInt(after.getValue('sys_mod_count'), 10) > before);
        eq('history: updated by the acting user', me, after.getValue('sys_updated_by'));
        eq('IT manager statistics 200', 200, call(ins.getStats).status);
    } else if (me === 'c360.test.tech') {
        var own = idOf('it_issue', T_OWN);
        eq('technician reads own issue', 200, call(self.getRecordSummary, { table: P + 'it_issue', id: own }).status);
        eq('technician NOT in assigned group cannot start own issue', 403, call(ops.issueAction, { id: own }, { action: 'start' }).status);
        eq('technician NOT in assigned group cannot cancel', 403, call(ops.issueAction, { id: own }, { action: 'cancel', work_note: 'cancel my own ticket' }).status);
        eq('technician NOT in assigned group cannot assign to self', 403, call(ops.assignToMe, { id: own }).status);
        eq('state unchanged (New)', '1', reread('it_issue', own).getValue('state'));
        var tq = call(ops.getQueue);
        eq('technician queue limited to own groups', 'my_groups', tq.body.data.scope);
        eq('technician queue excludes other groups', 0, tq.body.data.items.filter(function (i) { return i.short_description.display === T_OWN; }).length);
        eq('W-3 technicians are unrestricted for IT issues (approved)', 1, agg('it_issue', A_ISSUE));
        eq('technician statistics 200', 200, call(ins.getStats).status);
    } else if (me === 'c360.test.wardena') {
        var hv = call(ops.getHostel);
        eq('warden hostel 200', 200, hv.status);
        eq('only own hostel', 1, hv.body.data.hostels.length);
        var res = hv.body.data.residents[0];
        eq('resident guardian phone visible to own warden', '+19990000777', res && res.student && res.student.guardian_phone ? res.student.guardian_phone.value : 'hidden');
        eq('hostel view excludes other hostel complaints', 0, hv.body.data.complaints.filter(function (x) { return x.short_description.display === W_ELSEWHERE; }).length);
        var cmpl = hv.body.data.complaints.filter(function (x) { return x.short_description.display === A_CMPL; })[0];
        eq('resident complaint listed', true, !!cmpl);
        var elsewhere = idOf('hostel_cmpl', W_ELSEWHERE);
        eq('warden reads own complaint in other hostel (caller)', 200, call(self.getRecordSummary, { table: P + 'hostel_cmpl', id: elsewhere }).status);
        eq('warden cannot work complaint of a hostel they do not run', 403, call(ops.complaintAction, { id: elsewhere }, { action: 'resolve', close_notes: 'Resolving my own complaint' }).status);
        eq('other-hostel complaint state unchanged', '1', reread('hostel_cmpl', elsewhere).getValue('state'));
        eq('start 200', 200, call(ops.complaintAction, { id: cmpl.sys_id }, { action: 'start' }).status);
        eq('resolve without notes rejected 400', 400, call(ops.complaintAction, { id: cmpl.sys_id }, { action: 'resolve' }).status);
        eq('resolve with blank notes rejected 400', 400, call(ops.complaintAction, { id: cmpl.sys_id }, { action: 'resolve', close_notes: '   ' }).status);
        var before2 = parseInt(reread('hostel_cmpl', cmpl.sys_id).getValue('sys_mod_count'), 10);
        eq('resolve with notes 200', 200, call(ops.complaintAction, { id: cmpl.sys_id }, { action: 'resolve', close_notes: 'C360P boiler repaired' }).status);
        var done = reread('hostel_cmpl', cmpl.sys_id);
        eq('state Resolved (6)', '6', done.getValue('state'));
        eq('resolution notes stored', 'C360P boiler repaired', done.getValue('close_notes'));
        eq('history: sys_mod_count incremented', true, parseInt(done.getValue('sys_mod_count'), 10) > before2);
        eq('history: updated by the warden', me, done.getValue('sys_updated_by'));
        eq('W-3 warden sees own-hostel complaint in aggregates', 1, agg('hostel_cmpl', A_CMPL));
        eq('W-3 warden does not count student IT issue (no hostel on it)', 0, agg('it_issue', A_ISSUE));
        var wcat = call(brw.getBrowseCatalog).body.data;
        eq('records: warden sees the Hostel section only', 'Hostel', wcat.map(function (m) { return m.group; }).filter(function (g, i, a) { return a.indexOf(g) === i; }).join(','));
        var wh = call(brw.getBrowseModule, { module: 'hos-hostels' });
        eq('records: hostels list 200', 200, wh.status);
        eq('records: hostels list has columns', true, wh.body.data.columns.length >= 5);
        eq('records: warden sees own hostel in list', true, wh.body.data.items.some(function (r) { return r.code && r.code.value === 'C360PH'; }));
        eq('records: warden refused students list', 403, call(brw.getBrowseModule, { module: 'stu-students' }).status);
    } else if (me === 'c360.test.admin') {
        var ov = call(ins.getAdminOverview);
        eq('admin overview 200', 200, ov.status);
        eq('admin overview covers 26 tables', 26, ov.body.data.tables.length);
        var st = call(ins.getStats);
        eq('admin statistics 200', 200, st.status);
        eq('admin statistics include both test complaints', true, st.body.data.complaints.total >= 2);
        eq('admin queue scope all', 'all', call(ops.getQueue).body.data.scope);
        eq('W-3 admin (leadership) sees non-confidential complaints', 1, agg('hostel_cmpl', W_ELSEWHERE));
        eq('records: admin sees all 40 navigator entries', 40, call(brw.getBrowseCatalog).body.data.length);
        var ai = call(brw.getBrowseModule, { module: 'it-all' });
        eq('records: admin IT issues list 200', 200, ai.status);
        eq('records: admin list includes the student issue', true, ai.body.data.items.some(function (r) { return r.short_description && r.short_description.value === A_ISSUE; }));
        eq('records: filtered list (Resolved) excludes open issues', false, call(brw.getBrowseModule, { module: 'it-resolved' }).body.data.items.some(function (r) { return r.short_description && r.short_description.value === A_ISSUE; }));
        eq('records: platform tables are not listed by the portal', 400, call(brw.getBrowseModule, { module: 'admin-groups' }).status);
    } else throw new Error('no portal expectations for ' + me);
    stepResult.setOutputMessage(me + ': ' + log.join(', '));
})(outputs, steps, params, stepResult, assertEqual);
