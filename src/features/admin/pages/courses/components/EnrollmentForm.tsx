import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useCourses } from '../../../../../hooks/useCourseQueries'
import {
  useCreateEnrollment,
  useBulkEnroll,
} from '../../../../../hooks/useEnrollmentQueries'
import { academicsApi } from '../../../../../api/academics'
import { getStudents } from '../../../api/students'
import { getAvailableAllocations } from '../../../../../api/enrollments'
import type { AvailableAllocation } from '../../../../../api/enrollments'

type Props = {
  onClose: () => void
}

type FormMode = 'single' | 'bulk'

interface StudentWithRecords {
  id: string
  stdRegNumber: string
  firstName: string
  lastName: string
  middleName?: string | null
  batchId?: string
  batch?: { id: string; name: string }
  academicRecords?: Array<{ id: string }>
}

export default function EnrollmentForm({ onClose }: Props) {
  const [mode, setMode] = useState<FormMode>('single')
  const [batchId, setBatchId] = useState('')
  const [regNumberSearch, setRegNumberSearch] = useState('')
  const [searchResults, setSearchResults] = useState<StudentWithRecords[]>([])
  const [selectedStudent, setSelectedStudent] = useState<StudentWithRecords | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  
  const [courseId, setCourseId] = useState('')
  const [courseIds, setCourseIds] = useState<string[]>([])
  const [courseSearchInput, setCourseSearchInput] = useState('')
  const [selectedCourseName, setSelectedCourseName] = useState('')
  
  const [isExtra, setIsExtra] = useState(false)
  const [allocationId, setAllocationId] = useState('')

  // Fetch batches
  const { data: batches } = useQuery({
    queryKey: ['batches'],
    queryFn: academicsApi.getBatches,
  })

  // Fetch courses
  const { data: coursesData } = useCourses({ 
    status: 'active',
    search: courseSearchInput || undefined 
  })
  const courses = coursesData?.data ?? []

  // Fetch available allocations when course is selected and isExtra is true
  const { data: availableAllocations, isLoading: allocationsLoading } = useQuery({
    queryKey: ['availableAllocations', courseId],
    queryFn: () => getAvailableAllocations(courseId),
    enabled: !!courseId && isExtra && mode === 'single',
  })

  const createMutation = useCreateEnrollment()
  const bulkMutation = useBulkEnroll()

  // Search for students
  const handleStudentSearch = async () => {
    if (!batchId || !regNumberSearch.trim()) {
      alert('Please select batch and enter registration number')
      return
    }

    setIsSearching(true)
    try {
      const response = await getStudents({
        batchId,
        search: regNumberSearch.trim(),
        status: 'active',
      })
      
      // Map the response to include academicRecords (we'll need to fetch them separately or assume they exist)
      const studentsWithRecords: StudentWithRecords[] = response.data.map(student => ({
        ...student,
        batchId: student.batch.id,
        // We'll assume the backend includes academicRecords, or we can fetch them separately
        // For now, let's add a placeholder that we'll handle in submission
      }))
      
      setSearchResults(studentsWithRecords)
    } catch (error) {
      console.error('Failed to search students:', error)
      alert('Failed to search students')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectStudent = (student: StudentWithRecords) => {
    setSelectedStudent(student)
    setSearchResults([])
    setRegNumberSearch('')
  }

  const handleClearStudent = () => {
    setSelectedStudent(null)
    setSearchResults([])
    setRegNumberSearch('')
  }

  const handleCourseSelect = (course: any) => {
    setCourseId(course.id)
    setSelectedCourseName(
      `${course.code} - ${course.name} (${course.creditHours} credits)`,
    )
    setCourseSearchInput('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedStudent) {
      alert('Please search and select a student')
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

      try {
        await createMutation.mutateAsync({
          studentId: selectedStudent.id,
          courseId,
          isExtra,
          allocationId: isExtra ? allocationId : undefined,
        })
        onClose()
      } catch (error: any) {
        // Handle specific error cases
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to enroll student'
        
        if (error?.response?.status === 409) {
          alert('This student is already enrolled in this course.')
        } else if (error?.response?.status === 400) {
          alert(errorMessage)
        } else {
          alert(`Failed to enroll student: ${errorMessage}`)
        }
      }
    } else {
      if (courseIds.length === 0) {
        alert('Please select at least one course')
        return
      }

      try {
        const result = await bulkMutation.mutateAsync({
          studentId: selectedStudent.id,
          courseIds,
          isExtra,
        })

        if (result.errors.length > 0) {
          const errorMsg = result.errors
            .map((e) => `${e.courseId}: ${e.error}`)
            .join('\n')
          
          if (result.success.length > 0) {
            alert(
              `Partially completed:\n\n` +
              `✓ ${result.success.length} course(s) enrolled successfully\n` +
              `✗ ${result.errors.length} course(s) failed:\n\n${errorMsg}`
            )
          } else {
            alert(`All enrollments failed:\n\n${errorMsg}`)
          }
        }
        
        if (result.success.length > 0) {
          onClose()
        }
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to enroll student'
        alert(`Failed to enroll student: ${errorMessage}`)
      }
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ 
          maxWidth: 650, 
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
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

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
          <form onSubmit={handleSubmit}>
            {/* Student Search Section */}
            <div style={{ marginBottom: 20 }}>
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

              {!selectedStudent ? (
                <>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <select
                      value={batchId}
                      onChange={(e) => setBatchId(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        borderRadius: 5,
                        border: '1px solid var(--line)',
                        fontSize: 13,
                      }}
                    >
                      <option value="">Select Batch</option>
                      {batches?.map((batch) => (
                        <option key={batch.id} value={batch.id}>
                          Batch {batch.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      value={regNumberSearch}
                      onChange={(e) => setRegNumberSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleStudentSearch()
                        }
                      }}
                      placeholder="Enter registration number or name..."
                      disabled={!batchId || isSearching}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        borderRadius: 5,
                        border: '1px solid var(--line)',
                        fontSize: 13,
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleStudentSearch}
                      disabled={!batchId || !regNumberSearch.trim() || isSearching}
                      className="btn"
                      style={{ padding: '8px 16px' }}
                    >
                      {isSearching ? 'Searching...' : 'Search'}
                    </button>
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div
                      style={{
                        marginTop: 8,
                        border: '1px solid var(--line)',
                        borderRadius: 5,
                        maxHeight: 200,
                        overflowY: 'auto',
                      }}
                    >
                      {searchResults.map((student) => (
                        <div
                          key={student.id}
                          onClick={() => handleSelectStudent(student)}
                          style={{
                            padding: '10px 12px',
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
                          <div style={{ fontWeight: 500, fontSize: 13 }}>
                            {student.stdRegNumber}
                          </div>
                          <div style={{ color: 'var(--ink-faint)', fontSize: 12 }}>
                            {student.firstName} {student.middleName || ''} {student.lastName}
                            {student.batch && ` • Batch ${student.batch.name}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!isSearching && searchResults.length === 0 && regNumberSearch && batchId && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: '12px',
                        fontSize: 12,
                        color: 'var(--ink-faint)',
                        fontStyle: 'italic',
                        textAlign: 'center',
                        border: '1px solid var(--line)',
                        borderRadius: 5,
                      }}
                    >
                      Click Search to find students
                    </div>
                  )}
                </>
              ) : (
                <div
                  style={{
                    padding: '12px',
                    borderRadius: 5,
                    border: '1px solid var(--line)',
                    backgroundColor: 'var(--bg-faint)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>
                        {selectedStudent.stdRegNumber}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--ink-faint)' }}>
                        {selectedStudent.firstName} {selectedStudent.middleName || ''} {selectedStudent.lastName}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 2 }}>
                        Batch {selectedStudent.batch?.name}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearStudent}
                      className="btn secondary"
                      style={{ padding: '4px 10px', fontSize: 12 }}
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Course Selection */}
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

                {!courseId ? (
                  <>
                    <input
                      type="text"
                      value={courseSearchInput}
                      onChange={(e) => setCourseSearchInput(e.target.value)}
                      placeholder="Search by course code or name..."
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 5,
                        border: '1px solid var(--line)',
                        fontSize: 13,
                      }}
                    />
                    {courseSearchInput.trim().length >= 1 && (
                      <div
                        style={{
                          marginTop: 8,
                          border: '1px solid var(--line)',
                          borderRadius: 5,
                          maxHeight: 200,
                          overflowY: 'auto',
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
                      className="btn secondary"
                      style={{ padding: '2px 8px', fontSize: 12 }}
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
                    ⚠️ No active classes found teaching this course.
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
                    {availableAllocations.map((alloc) => (
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
                          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                            Batch {alloc.section.batch.name} - Section {alloc.section.name}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--ink-faint)' }}>
                            Semester {alloc.semesterNumber} • {alloc.faculty.name}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

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
