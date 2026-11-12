// Campus360 security script include — thin bridge to the TypeScript module
// src/server/security/c360-security.ts (single source of truth for the logic).
//
// Use from non-module server code (business rules written as strings, flows, ATF, background
// scripts). ACLs do NOT use this class: they call the module directly through SDK-generated bridges.
//
// The require() path below is the exact path the SDK generates for module imports. It embeds the
// package version (package.json "version"); test/security/script-include-path.test.cjs fails the
// test run if the two ever drift apart.
//
// Glide APIs are not imported here: they are auto-available in script include context.
var C360Security = Class.create()
C360Security.prototype = {
    initialize: function () {
        this._mod = require('x_774308_campus360/campus360/2.0.0/src/server/security/c360-security.ts')
    },

    /** RL-02 — can the current user (faculty) read this student record? */
    canFacultyReadStudent: function (studentRecord) {
        return this._mod.canFacultyReadStudent(studentRecord) === true
    },

    /** RL-04 — can the current user (warden) read this student record? */
    canWardenReadStudent: function (studentRecord) {
        return this._mod.canWardenReadStudent(studentRecord) === true
    },

    /** RL-04g — can the current user (warden) read this student's guardian contact? */
    canWardenReadGuardian: function (studentRecord) {
        return this._mod.canWardenReadGuardian(studentRecord) === true
    },

    type: 'C360Security',
}
