import { useState } from 'react'
import { useCourses } from '../../../../../hooks/useCourseQueries'
import {
  useCreateEnrollment,
  useBulkEnroll,
} from '../../../../../hooks/useEnrollmentQueries'
import { useStudents } from '../../../hooks/useStudentQueries'

type Props = {
  onClose: () => void
}

type FormMode = 'single' | 'bulk'

export default function EnrollmentForm({ onClose }: Props) {
  const [mode, setMode] = useState<FormMode>('single')
  const [studentId, setStudentId] = useState('')
  const [courseId, setCourseId] = useState('')
  const [courseIds, setCourseIds] = useState<string[]>([])
  const [isExtra, setIsExtra] = useState(false)
  const [searchInput, setSearchInput] = useState('')

  const { data: studentsData } = useStudents({
    search: searchInput || undefined,
    status: 'active',
  })
  const { data: coursesData } = useCourses({ status: 'active' })

  const createMutation = useCreateEnrollment()
  const bulkMutation = useBulkEnroll()

  const students = studentsData?.data ?? []
  const courses = coursesData?.data ?? []

  // Find student's academic record ID
  const selectedStudent = students.find((s) => s.id === studentId)
  const studentAcademicRecordId = selectedStudent?.academicRecords?.[0]?.id

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!studentId || !studentAcademicRecordId) {
      alert('Please select a student')
      return
    }

    if (mode === 'single') {
      if (!courseId) {
        alert('Please select a course')
        return
      }

      await createMutation.mutateAsync({
        studentAcademicRecordId,
        courseId,
        isExtra,
      })
      onClose()
    } else {
      if (courseIds.length === 0) {
        alert('Please select at least one course')
        return
      }

      const result = await bulkMutation.mutateAsync({
        studentAcademicRecordId,
        courseIds,
        isExtra,
      })

      if (result.errors.length > 0) {
        const errorMsg = result.errors
          .map((e) => `Course ${e.courseId}: ${e.error}`)
          .join('\n')
        alert(`Some courses failed:\n${errorMsg}`)
      }
      if (result.success.length > 0) {
        onClose()
      }
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 600, maxHeight: '90vh', overflow: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
            New Enrollment
          </h2>
          <button
            type="button"
            className="btn secondary"
            onClick={onClose}
            style={{ padding: '4px 12px' }}
          >
            ✕
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className={`btn ${mode === 'single' ? '' : 'secondary'}`}
              onClick={() => setMode('single')}
            >
              Single Course
            </button>
            <button
              type="button"
              className={`btn ${mode === 'bulk' ? '' : 'secondary'}`}
              onClick={() => setMode('bulk')}
            >
              Multiple Courses
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 6,
              }}
            >
              Search Student
            </label>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or student number..."
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 5,
                border: '1px solid var(--line)',
                fontSize: 13,
                marginBottom: 8,
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 6,
              }}
            >
              Student <span style={{ color: 'var(--red)' }}>*</span>
            </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 5,
                border: '1px solid var(--line)',
                fontSize: 13,
              }}
            >
              <option value="">Select Student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.studentNumber} - {student.firstName}{' '}
                  {student.lastName}
                </option>
              ))}
            </select>
          </div>

          {mode === 'single' && (
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 500,
                  marginBottom: 6,
                }}
              >
                Course <span style={{ color: 'var(--red)' }}>*</span>
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 5,
                  border: '1px solid var(--line)',
                  fontSize: 13,
                }}
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name} ({c.creditHours} credits)
                  </option>
                ))}
              </select>
            </div>
          )}

          {mode === 'bulk' && (
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 500,
                  marginBottom: 6,
                }}
              >
                Courses <span style={{ color: 'var(--red)' }}>*</span>
              </label>
              <div
                style={{
                  maxHeight: 200,
                  overflow: 'auto',
                  border: '1px solid var(--line)',
                  borderRadius: 5,
                  padding: 8,
                }}
              >
                {courses.map((c) => (
                  <label
                    key={c.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '4px 0',
                      fontSize: 13,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={courseIds.includes(c.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCourseIds([...courseIds, c.id])
                        } else {
                          setCourseIds(courseIds.filter((id) => id !== c.id))
                        }
                      }}
                    />
                    {c.code} - {c.name} ({c.creditHours} credits)
                  </label>
                ))}
              </div>
              <p
                style={{
                  fontSize: 11,
                  color: 'var(--ink-faint)',
                  marginTop: 4,
                  marginBottom: 0,
                }}
              >
                {courseIds.length} selected
              </p>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
              }}
            >
              <input
                type="checkbox"
                checked={isExtra}
                onChange={(e) => setIsExtra(e.target.checked)}
              />
              Mark as Extra Course (beyond normal load)
            </label>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 8,
              justifyContent: 'flex-end',
              paddingTop: 16,
              borderTop: '1px solid var(--line)',
            }}
          >
            <button
              type="button"
              className="btn secondary"
              onClick={onClose}
              disabled={createMutation.isPending || bulkMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn"
              disabled={createMutation.isPending || bulkMutation.isPending}
            >
              {createMutation.isPending || bulkMutation.isPending
                ? 'Enrolling...'
                : 'Enroll Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
