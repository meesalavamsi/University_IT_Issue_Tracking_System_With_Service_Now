(function (outputs, steps, params, stepResult, assertEqual) {
    // Runs as the IMPERSONATED test persona. Access is asserted ONLY through GlideRecordSecure
    // (which enforces row + field ACLs exactly as UI lists, forms, reports, exports and REST do).
    // The plain GlideRecord lookup below only resolves a test student's sys_id from its code;
    // it is never used to assert access.
    var T = 'x_774308_campus360_student';

    // Expected results per persona. rows: student code -> readable?  fields: 'CODE.field' -> readable?
    var EXPECT = {
        'c360.test.studenta': { rows: { 'C360T-A': true, 'C360T-B': false, 'C360T-C': false }, fields: { 'C360T-A.date_of_birth': true, 'C360T-A.guardian_phone': true } },
        'c360.test.facteach': { rows: { 'C360T-A': true, 'C360T-B': false, 'C360T-C': false, 'C360T-D': false }, fields: { 'C360T-A.date_of_birth': false, 'C360T-A.personal_phone': false, 'C360T-A.guardian_phone': false } },
        'c360.test.facother': { rows: { 'C360T-A': false, 'C360T-C': true }, fields: { 'C360T-C.date_of_birth': false } },
        'c360.test.facadvisor': { rows: { 'C360T-B': true, 'C360T-A': false }, fields: { 'C360T-B.guardian_phone': false } },
        'c360.test.hod': { rows: { 'C360T-A': true, 'C360T-D': true, 'C360T-C': false }, fields: { 'C360T-A.date_of_birth': false, 'C360T-A.guardian_phone': false } },
        'c360.test.wardena': { rows: { 'C360T-A': true, 'C360T-C': false, 'C360T-D': false }, fields: { 'C360T-A.guardian_phone': true, 'C360T-A.guardian_name': true, 'C360T-A.guardian_relation': false, 'C360T-A.date_of_birth': false, 'C360T-A.personal_phone': false } },
        'c360.test.wardenb': { rows: { 'C360T-C': true, 'C360T-A': false }, fields: { 'C360T-C.guardian_phone': true, 'C360T-C.date_of_birth': false } },
        'c360.test.admin': { rows: { 'C360T-A': true, 'C360T-B': true, 'C360T-C': true, 'C360T-D': true }, fields: { 'C360T-A.date_of_birth': true, 'C360T-A.guardian_phone': true } },
        'c360.test.leadership': { rows: { 'C360T-A': true, 'C360T-C': true }, fields: { 'C360T-A.date_of_birth': false, 'C360T-A.guardian_phone': false, 'C360T-A.personal_phone': false } },
        'c360.test.platadmin': { rows: { 'C360T-A': true }, fields: { 'C360T-A.date_of_birth': false, 'C360T-A.guardian_phone': false, 'C360T-A.home_address': false } },
    };

    var me = gs.getUserName();
    var exp = EXPECT[me];
    if (!exp) throw new Error('No expectations defined for impersonated user ' + me);

    function sysIdOf(code) {
        var g = new GlideRecord(T);
        g.addQuery('student_id', code);
        g.query();
        if (!g.next()) throw new Error('Test student missing: ' + code);
        return g.getUniqueValue();
    }
    function canReadRow(code) {
        var s = new GlideRecordSecure(T);
        return s.get(sysIdOf(code)) === true;
    }
    function canReadField(code, field) {
        var s = new GlideRecordSecure(T);
        if (!s.get(sysIdOf(code))) return false;
        // Schema check with a plain GlideRecord guards against typos passing as "not readable".
        if (!new GlideRecord(T).isValidField(field)) throw new Error('Test error: unknown field ' + field);
        // GlideRecordSecure hides a field the user may not read entirely: isValidField() is false and
        // getElement() returns null (observed on dev382380). Any of these means "not readable".
        if (!s.isValidField(field)) return false;
        var el = s.getElement(field);
        return el !== null && el !== undefined && el.canRead() === true;
    }

    var summary = [];
    for (var code in exp.rows) {
        var r = canReadRow(code);
        assertEqual({ name: me + ' read row ' + code, shouldbe: exp.rows[code], value: r });
        summary.push(code + '=' + r);
    }
    for (var key in exp.fields) {
        var parts = key.split('.');
        var f = canReadField(parts[0], parts[1]);
        assertEqual({ name: me + ' read field ' + key, shouldbe: exp.fields[key], value: f });
        summary.push(key + '=' + f);
    }
    stepResult.setOutputMessage(me + ': ' + summary.join(', '));
})(outputs, steps, params, stepResult, assertEqual);
