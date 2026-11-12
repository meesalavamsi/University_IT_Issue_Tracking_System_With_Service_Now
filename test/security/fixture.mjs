// In-memory model of the Part 3 test scenario. Mirrors the semantics of the production
// GlideRecord queries in src/server/security/glide-access-data.ts:
//   faculty:     user=<u> ^ status=active
//   enrollment:  student=<s> ^ status=enrolled ^ section.status IN (planned,active)
//                ^ (section.faculty=<f> OR section.co_instructors CONTAINS <f>)
//   room_alloc:  student=<s> ^ status IN (...) ^ hostel.active=true
//                ^ (hostel.warden=<u> OR hostel.assistant_warden=<u>)
// The same scenario is used by the on-instance ATF suite (src/fluent/tests/security.test.now.ts).

const id = (n) => n.toString(16).padStart(32, '0')

export const U = {
    studentA: id(0xa1), studentB: id(0xa2), studentC: id(0xa3), studentD: id(0xa4), studentE: id(0xa5),
    facTeach: id(0xb1), facCo: id(0xb2), facOther: id(0xb3), facAdvisor: id(0xb4), facResigned: id(0xb5),
    hod: id(0xb6), wardenA: id(0xc1), wardenB: id(0xc2), asstWardenA: id(0xc3), wardenClosed: id(0xc4),
    noProfile: id(0xd1),
}
export const S = { A: id(0x1a), B: id(0x1b), C: id(0x1c), D: id(0x1d), E: id(0x1e) }

const faculty = [
    { id: id(0xf1), user: U.facTeach, status: 'active' },
    { id: id(0xf2), user: U.facCo, status: 'active' },
    { id: id(0xf3), user: U.facOther, status: 'active' },
    { id: id(0xf4), user: U.facAdvisor, status: 'active' },
    { id: id(0xf5), user: U.facResigned, status: 'resigned' },
    { id: id(0xf6), user: U.hod, status: 'active' },
]
const F = Object.fromEntries(faculty.map((f) => [f.user, f.id]))

const sections = [
    { id: id(0x51), faculty: F[U.facTeach], co: [F[U.facCo]], status: 'active' },
    { id: id(0x52), faculty: F[U.facOther], co: [], status: 'active' },
    { id: id(0x53), faculty: F[U.facTeach], co: [], status: 'completed' },
    { id: id(0x54), faculty: F[U.facResigned], co: [], status: 'active' },
]
const enrollments = [
    { student: S.A, section: id(0x51), status: 'enrolled' },   // A in facTeach's active section
    { student: S.D, section: id(0x51), status: 'dropped' },    // D dropped facTeach's section
    { student: S.E, section: id(0x53), status: 'enrolled' },   // E only in facTeach's COMPLETED section
    { student: S.C, section: id(0x52), status: 'enrolled' },   // C in facOther's section
    { student: S.B, section: id(0x54), status: 'enrolled' },   // B in resigned faculty's section
]
const hostels = [
    { id: id(0x71), warden: U.wardenA, asst: U.asstWardenA, active: true },
    { id: id(0x72), warden: U.wardenB, asst: null, active: true },
    { id: id(0x73), warden: U.wardenClosed, asst: null, active: false },
]
const allocations = [
    { student: S.A, hostel: id(0x71), status: 'active' },
    { student: S.B, hostel: id(0x71), status: 'requested' },
    { student: S.D, hostel: id(0x71), status: 'vacated' },
    { student: S.C, hostel: id(0x72), status: 'active' },
    { student: S.E, hostel: id(0x73), status: 'active' },
]

export function makeDataSource() {
    const calls = []
    return {
        calls,
        getActiveFacultyId(userId) {
            calls.push(['faculty', userId])
            const f = faculty.find((x) => x.user === userId && x.status === 'active')
            return f ? f.id : null
        },
        isEnrolledInFacultySection(studentId, facultyId) {
            calls.push(['enrollment', studentId, facultyId])
            return enrollments.some((e) => {
                if (e.student !== studentId || e.status !== 'enrolled') return false
                const s = sections.find((x) => x.id === e.section)
                return !!s && ['planned', 'active'].includes(s.status) && (s.faculty === facultyId || s.co.includes(facultyId))
            })
        },
        hasAllocationUnderWarden(studentId, userId, statuses) {
            calls.push(['allocation', studentId, userId, statuses.join(',')])
            return allocations.some((a) => {
                if (a.student !== studentId || !statuses.includes(a.status)) return false
                const h = hostels.find((x) => x.id === a.hostel)
                return !!h && h.active && (h.warden === userId || h.asst === userId)
            })
        },
    }
}
