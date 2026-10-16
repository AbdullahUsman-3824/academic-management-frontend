import { useState } from 'react'
import { useCourses } from '../../../../../hooks/useCourseQueries'
import {
  useCreateAllocation,
  useBulkCreateAllocations,
} from '../../../../../hooks/useAllocationQueries'
import { useSemesters } from '../../../../../hooks/useSemesterCourseQueries'
import { useBatches, useEnrollmentSections, useAcademicSessionsList } from '../../../hooks/useAcademicQueries'
import { useFaculty } from '../../../../../hooks/useFacultyQueries'

type Props = {
  onClose: () => void
}

type FormMode = 'single' | 'bulk'

export default function AllocationForm({ onClose }: Props) {
  const [mode, setMode] = useState<FormMode>('single')
  const [facultyId, setFacultyId] = useState('')
  const [courseId, setCourseId] = useState('')
  const [courseIds, setCourseIds] = useState<string[]>([])
  const [sectionId, setSectionId] = useState('')
  const [semesterId, setSemesterId] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [batchId, setBatchId] = useState('')

  const { data: coursesData } = useCourses({ status: 'active' })
  const { data: semesters } = useSemesters()
  const { data: batches } = useBatches('active')
  const { data: sections } = useEnrollmentSections(batchId || null)
  const { data: sessions } = useAcademicSessionsList()
  const { data: facultyData } = useFaculty({ status: 'active' })

  const createMutation = useCreateAllocation()
  const bulkMutation = useBulkCreateAllocations()

  const courses = coursesData?.data ?? []
  const faculty = facultyData?.data ?? []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!facultyId) {
      alert('Please select a faculty member')
      return
    }

    if (mode === 'single') {
      if (!courseId || !sectionId || !semesterId) {
        alert('Please fill all required fields')
        return
      }

      await createMutation.mutateAsync({
        facultyId,
        courseId,
        sectionId,
        semesterId,
        academicSessionId: sessionId || undefined,
      })
      onClose()
    } else {
      if (courseIds.length === 0 || !sectionId || !semesterId) {
        alert('Please select courses and fill all required fields')
        return
      }

      await bulkMutation.mutateAsync({
        facultyId,
        courseIds,
        sectionId,
        semesterId,
        academicSessionId: sessionId || undefined,
      })
      onClose()
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
            New Allocation
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
              Faculty Member <span style={{ color: 'var(--red)' }}>*</span>
            </label>
            <select
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 5,
                border: '1px solid var(--line)',
                fontSize: 13,
              }}
            >
              <option value="">Select Faculty</option>
              {faculty.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.employeeNumber} - {f.firstName} {f.lastName} {f.designation ? `(${f.designation})` : ''}
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
                    {c.code} - {c.name}
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
                    {c.code} - {c.name}
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
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 6,
              }}
            >
              Batch <span style={{ color: 'var(--red)' }}>*</span>
            </label>
            <select
              value={batchId}
              onChange={(e) => {
                setBatchId(e.target.value)
                setSectionId('')
              }}
              required
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 5,
                border: '1px solid var(--line)',
                fontSize: 13,
              }}
            >
              <option value="">Select Batch</option>
              {batches?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
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
              Section <span style={{ color: 'var(--red)' }}>*</span>
            </label>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              required
              disabled={!batchId}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 5,
                border: '1px solid var(--line)',
                fontSize: 13,
              }}
            >
              <option value="">Select Section</option>
              {sections?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
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
              Semester <span style={{ color: 'var(--red)' }}>*</span>
            </label>
            <select
              value={semesterId}
              onChange={(e) => setSemesterId(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 5,
                border: '1px solid var(--line)',
                fontSize: 13,
              }}
            >
              <option value="">Select Semester</option>
              {semesters?.map((sem) => (
                <option key={sem.id} value={sem.id}>
                  {sem.displayName}
                </option>
              ))}
            </select>
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
              Academic Session (Optional)
            </label>
            <select
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 5,
                border: '1px solid var(--line)',
                fontSize: 13,
              }}
            >
              <option value="">Use Current Session</option>
              {sessions?.map((sess) => (
                <option key={sess.id} value={sess.id}>
                  {sess.name}
                </option>
              ))}
            </select>
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
                ? 'Creating...'
                : 'Create Allocation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
