import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useCourses } from '../../../../../hooks/useCourseQueries'
import {
  useCreateEnrollment,
  useBulkEnroll,
} from '../../../../../hooks/useEnrollmentQueries'
import { useStudents } from '../../../hooks/useStudentQueries'
import { getAvailableAllocations } from '../../../../../api/enrollments'
import type { AvailableAllocation } from '../../../../../api/enrollments'

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
  const [allocationId, setAllocationId] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [courseSearchInput, setCourseSearchInput] = useState('')
  const [selectedStudentName, setSelectedStudentName] = useState('')
  const [selectedCourseName, setSelectedCourseName] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [showCourseDropdown, setShowCourseDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const courseDropdownRef = useRef<HTMLDivElement>(null)

  const { data: studentsData } = useStudents({
    search: searchInput || undefined,
    status: 'active',
  })
  const { data: coursesData } = useCourses({ 
    status: 'active',
    search: courseSearchInput || undefined 
  })

  // Fetch available allocations when course is selected and isExtra is true
  const { data: availableAllocations, isLoading: allocationsLoading } = useQuery({
    queryKey: ['availableAllocations', courseId],
    queryFn: () => getAvailableAllocations(courseId),
    enabled: !!courseId && isExtra && mode === 'single',
  })

  const createMutation = useCreateEnrollment()
  const bulkMutation = useBulkEnroll()

  const students = studentsData?.data ?? []
  const courses = coursesData?.data ?? []

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
      if (
        courseDropdownRef.current &&
        !courseDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCourseDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Find student's academic record ID
  const selectedStudent = students.find((s) => s.id === studentId)
  const studentAcademicRecordId = selectedStudent?.academicRecords?.[0]?.id

  const handleStudentSelect = (student: any) => {
    setStudentId(student.id)
    const regNumber = student.stdRegNumber || student.studentNumber || 'N/A'
    setSelectedStudentName(
      `${regNumber} - ${student.firstName} ${student.lastName}`,
    )
    setSearchInput('')
    setShowDropdown(false)
  }

  const handleCourseSelect = (course: any) => {
    setCourseId(course.id)
    setSelectedCourseName(
      `${course.code} - ${course.name} (${course.creditHours} credits)`,
    )
    setCourseSearchInput('')
    setShowCourseDropdown(false)
  }

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

      if (isExtra && !allocationId) {
        alert('Please select which class/teacher the student should attend')
        return
      }

      await createMutation.mutateAsync({
        studentAcademicRecordId,
        courseId,
        isExtra,
        allocationId: isExtra ? allocationId : undefined,
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
        style={{ 
          maxWidth: 600, 
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            flexShrink: 0,
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

        <div style={{ marginBottom: 16, flexShrink: 0 }}>
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

        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'visible', paddingRight: 4 }}>

        <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{ marginBottom: 20, position: 'relative', zIndex: 10 }}
            ref={dropdownRef}
          >
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

            {!studentId ? (
              <>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value)
                    setShowDropdown(true)
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search by name or student number..."
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 5,
                    border: '1px solid var(--line)',
                    fontSize: 13,
                  }}
                />
                {showDropdown && searchInput.trim().length >= 2 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      right: 0,
                      maxHeight: 200,
                      overflowY: 'auto',
                      backgroundColor: '#fff',
                      border: '1px solid var(--line)',
                      borderRadius: 5,
                      zIndex: 9999,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    {students.length === 0 ? (
                      <div
                        style={{
                          padding: '12px 10px',
                          fontSize: 13,
                          color: 'var(--ink-faint)',
                          textAlign: 'center',
                        }}
                      >
                        No students found
                      </div>
                    ) : (
                      students.map((student) => (
                        <div
                          key={student.id}
                          onClick={() => handleStudentSelect(student)}
                          style={{
                            padding: '10px 12px',
                            fontSize: 13,
                            cursor: 'pointer',
                            borderBottom: '1px solid var(--line)',
                            transition: 'background-color 0.15s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              'var(--bg-faint)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              'transparent'
                          }}
                        >
                          <div style={{ fontWeight: 500 }}>
                            {student.stdRegNumber || student.studentNumber || 'N/A'}
                          </div>
                          <div
                            style={{ color: 'var(--ink-faint)', fontSize: 12 }}
                          >
                            {student.firstName} {student.lastName}
                            {student.batch && ` • Batch ${student.batch.name}`}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 5,
                  border: '1px solid var(--line)',
                  backgroundColor: 'var(--bg-faint)',
                }}
              >
                <span style={{ fontSize: 13 }}>{selectedStudentName}</span>
                <button
                  type="button"
                  onClick={() => {
                    setStudentId('')
                    setSelectedStudentName('')
                    setSearchInput('')
                  }}
                  style={{
                    padding: '2px 8px',
                    fontSize: 12,
                    border: '1px solid var(--line)',
                    borderRadius: 3,
                    backgroundColor: 'var(--bg)',
                    cursor: 'pointer',
                  }}
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {mode === 'single' && (
            <div style={{ marginBottom: 16, position: 'relative', zIndex: 5 }} ref={courseDropdownRef}>
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

              {!courseId ? (
                <>
                  <input
                    type="text"
                    value={courseSearchInput}
                    onChange={(e) => {
                      setCourseSearchInput(e.target.value)
                      setShowCourseDropdown(true)
                    }}
                    onFocus={() => setShowCourseDropdown(true)}
                    placeholder="Search by course code or name..."
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 5,
                      border: '1px solid var(--line)',
                      fontSize: 13,
                    }}
                  />
                  {showCourseDropdown && courseSearchInput.trim().length >= 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        maxHeight: 200,
                        overflowY: 'auto',
                        backgroundColor: '#fff',
                        border: '1px solid var(--line)',
                        borderRadius: 5,
                        zIndex: 9999,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }}
                    >
                      {courses.length === 0 ? (
                        <div
                          style={{
                            padding: '12px 10px',
                            fontSize: 13,
                            color: 'var(--ink-faint)',
                            textAlign: 'center',
                          }}
                        >
                          No courses found
                        </div>
                      ) : (
                        courses.map((course) => (
                          <div
                            key={course.id}
                            onClick={() => handleCourseSelect(course)}
                            style={{
                              padding: '10px 12px',
                              fontSize: 13,
                              cursor: 'pointer',
                              borderBottom: '1px solid var(--line)',
                              transition: 'background-color 0.15s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--bg-faint)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                          >
                            <div style={{ fontWeight: 500 }}>
                              {course.code} - {course.name}
                            </div>
                            <div style={{ color: 'var(--ink-faint)', fontSize: 12 }}>
                              {course.creditHours} credit hours
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 5,
                    border: '1px solid var(--line)',
                    backgroundColor: 'var(--bg-faint)',
                  }}
                >
                  <span style={{ fontSize: 13 }}>{selectedCourseName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCourseId('')
                      setSelectedCourseName('')
                      setCourseSearchInput('')
                    }}
                    style={{
                      padding: '2px 8px',
                      fontSize: 12,
                      border: '1px solid var(--line)',
                      borderRadius: 3,
                      backgroundColor: 'var(--bg)',
                      cursor: 'pointer',
                    }}
                  >
                    Change
                  </button>
                </div>
              )}
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

          {mode === 'single' && isExtra && courseId && (
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 500,
                  marginBottom: 6,
                }}
              >
                Select Class/Teacher <span style={{ color: 'var(--red)' }}>*</span>
              </label>
              {allocationsLoading ? (
                <div style={{ padding: '8px 10px', fontSize: 13, color: 'var(--ink-faint)' }}>
                  Loading available classes...
                </div>
              ) : !availableAllocations || availableAllocations.length === 0 ? (
                <div
                  style={{
                    padding: '12px',
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: 5,
                    fontSize: 13,
                    color: '#856404',
                  }}
                >
                  ⚠️ No active classes found teaching this course. Please ensure the course has been allocated to a faculty and section first.
                </div>
              ) : (
                <div
                  style={{
                    border: '1px solid var(--line)',
                    borderRadius: 5,
                    maxHeight: 200,
                    overflowY: 'auto',
                  }}
                >
                  {availableAllocations.map((alloc) => {
                    const isStudentBatch =
                      selectedStudent?.batchId === alloc.section.batch.id
                    return (
                      <label
                        key={alloc.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          padding: '10px 12px',
                          borderBottom: '1px solid var(--line)',
                          cursor: 'pointer',
                          backgroundColor:
                            allocationId === alloc.id
                              ? 'var(--bg-faint)'
                              : 'transparent',
                          transition: 'background-color 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          if (allocationId !== alloc.id) {
                            e.currentTarget.style.backgroundColor =
                              'rgba(0,0,0,0.02)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (allocationId !== alloc.id) {
                            e.currentTarget.style.backgroundColor =
                              'transparent'
                          }
                        }}
                      >
                        <input
                          type="radio"
                          name="allocation"
                          value={alloc.id}
                          checked={allocationId === alloc.id}
                          onChange={() => setAllocationId(alloc.id)}
                          style={{ marginTop: 2 }}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              marginBottom: 4,
                            }}
                          >
                            Batch {alloc.section.batch.name} - Section{' '}
                            {alloc.section.name}
                            {isStudentBatch && (
                              <span
                                style={{
                                  marginLeft: 6,
                                  fontSize: 11,
                                  color: '#28a745',
                                  fontWeight: 600,
                                }}
                              >
                                (Student's Batch)
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: 'var(--ink-faint)',
                            }}
                          >
                            Semester {alloc.semesterNumber} •{' '}
                            {alloc.faculty.name} ({alloc.faculty.employeeNumber})
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
              <p
                style={{
                  fontSize: 11,
                  color: 'var(--ink-faint)',
                  marginTop: 6,
                  marginBottom: 0,
                }}
              >
                The student will attend classes with the selected section and be assessed by the selected teacher.
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
    </div>
  )
}
