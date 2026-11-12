(function (outputs, steps, params, stepResult, assertEqual) {
    // REST exposure check: personal-data tables must have web-service (Table API) access disabled.
    // ACLs additionally apply to every REST call; this asserts the table-level switch is OFF.
    var tables = ['student', 'faculty', 'enrollment', 'stu_attend', 'fac_attend', 'room_alloc', 'student_reg', 'fac_onboard'];
    var out = [];
    for (var i = 0; i < tables.length; i++) {
        var name = 'x_774308_campus360_' + tables[i];
        var t = new GlideRecord('sys_db_object');
        t.addQuery('name', name);
        t.query();
        var found = t.next();
        assertEqual({ name: name + ' exists', shouldbe: true, value: found });
        var ws = found ? String(t.getValue('ws_access')) : 'missing';
        assertEqual({ name: name + ' ws_access', shouldbe: 'false', value: ws === '0' ? 'false' : ws });
        out.push(tables[i] + ':ws_access=' + ws);
    }
    stepResult.setOutputMessage(out.join(', '));
})(outputs, steps, params, stepResult, assertEqual);
