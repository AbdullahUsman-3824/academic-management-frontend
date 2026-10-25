import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  useAssessmentDetails,
  useBulkMarkEntry,
  useSubmitAssessment,
} from '../hooks/useFacultyQueries'

export default function MarksEntryPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>()
  const navigate = useNavigate()
  const [searchStudent, setSearchStudent] = useState('')
  const [editingMarks, setEditingMarks] = useState<Record<string, number>>({})
  const [editingRemarks, setEditingRemarks] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)

  const { data: assessmentData, isLoading } = useAssessmentDetails(assessmentId || null)
  const bulkMarkMutation = useBulkMarkEntry()
  const submitAssessmentMutation = useSubmitAssessment()

  useEffect(() => {
    if (assessmentData) {
      // Initialize editing state with existing marks
      const marks: Record<string, number> = {}
      const remarks: Record<string, string> = {}
      assessmentData.students.forEach((s) => {
        if (s.mark) {
          marks[s.studentId] = Number(s.mark.marksObtained)
          if (s.mark.remarks) {
            remarks[s.studentId] = s.mark.remarks
          }
        }
      })
      setEditingMarks(marks)
      setEditingRemarks(remarks)
    }
  }, [assessmentData])

  if (isLoading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-faint)' }}>
        Loading assessment...
      </div>
    )
  }

  if (!assessmentData) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-faint)' }}>
        Assessment not found
      </div>
    )
  }

  const { assessment, students, statistics } = assessmentData

  const filteredStudents = students.filter((s) => {
    const searchLower = searchStudent.toLowerCase()
    return (
      s.name.toLowerCase().includes(searchLower) ||
      s.rollNumber.toLowerCase().includes(searchLower)
    )
  })

  const handleMarkChange = (studentId: string, value: string) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= Number(assessment.totalMarks)) {
      setEditingMarks((prev) => ({ ...prev, [studentId]: numValue }))
      setHasChanges(true)
    } else if (value === '') {
      setEditingMarks((prev) => {
        const updated = { ...prev }
        delete updated[studentId]
        return updated
      })
      setHasChanges(true)
    }
  }

  const handleRemarkChange = (studentId: string, value: string) => {
    setEditingRemarks((prev) => ({ ...prev, [studentId]: value }))
    setHasChanges(true)
  }

  const handleSaveAll = async () => {
    const marks = Object.entries(editingMarks)
      .filter(([_, marksObtained]) => marksObtained !== undefined)
      .map(([studentId, marksObtained]) => ({
        studentId,
        marksObtained,
        remarks: editingRemarks[studentId] || undefined,
      }))

    if (marks.length === 0) {
      alert('No marks to save')
      return
    }

    try {
      await bulkMarkMutation.mutateAsync({
        assessmentId: assessmentId!,
        marks,
      })
      setHasChanges(false)
      alert(`Successfully saved marks for ${marks.length} student(s)`)
    } catch (error) {
      console.error('Failed to save marks:', error)
      alert('Failed to save marks')
    }
  }

  const handleSubmitAssessment = async () => {
    if (statistics.pending > 0) {
      if (
        !confirm(
          `There are ${statistics.pending} students without marks. Are you sure you want to submit this assessment?`
        )
      ) {
        return
      }
    } else {
      if (!confirm('Submit this assessment? You will not be able to edit it afterwards.')) {
        return
      }
    }

    try {
      await submitAssessmentMutation.mutateAsync(assessmentId!)
      alert('Assessment submitted successfully!')
      navigate(-1)
    } catch (error) {
      console.error('Failed to submit assessment:', error)
      alert('Failed to submit assessment')
    }
  }

  const isSubmitted = assessment.status === 'submitted'

  return (
    <>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" className="btn secondary" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <div>
            <h1 style={{ marginBottom: 2 }}>{assessment.title}</h1>
            <div className="today">
              {assessment.courseAllocation.course.code} · {assessment.courseAllocation.section.name}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {!isSubmitted && hasChanges && (
            <button
              type="button"
              className="btn primary"
              onClick={handleSaveAll}
              disabled={bulkMarkMutation.isPending}
            >
              {bulkMarkMutation.isPending ? 'Saving...' : '💾 Save All Changes'}
            </button>
          )}
          {!isSubmitted && (
            <button
              type="button"
              className="btn success"
              onClick={handleSubmitAssessment}
              disabled={submitAssessmentMutation.isPending}
            >
              {submitAssessmentMutation.isPending ? 'Submitting...' : 'Submit Assessment'}
            </button>
          )}
        </div>
      </div>

      {/* Assessment Info */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="profile-fields">
          <div className="profile-field">
            <div className="profile-field__label">Category</div>
            <div className="profile-field__value">
              <span className="badge">{assessment.assessmentCategory.name}</span>
            </div>
          </div>
          <div className="profile-field">
            <div className="profile-field__label">Total Marks</div>
            <div className="profile-field__value">{assessment.totalMarks}</div>
          </div>
          <div className="profile-field">
            <div className="profile-field__label">Date</div>
            <div className="profile-field__value">
              {assessment.assessmentDate
                ? new Date(assessment.assessmentDate).toLocaleDateString()
                : 'Not set'}
            </div>
          </div>
          <div className="profile-field">
            <div className="profile-field__label">Status</div>
            <div className="profile-field__value">
              <span className={`badge ${isSubmitted ? 'success' : ''}`}>{assessment.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="flex" style={{ gap: 16, marginBottom: 24 }}>
        <div className="card stat">
          <div className="stat-label">Total Students</div>
          <div className="stat-value">{statistics.totalStudents}</div>
        </div>
        <div className="card stat">
          <div className="stat-label">Marks Entered</div>
          <div className="stat-value">{statistics.marksEntered}</div>
        </div>
        <div className="card stat">
          <div className="stat-label">Pending</div>
          <div className="stat-value">{statistics.pending}</div>
        </div>
        <div className="card stat">
          <div className="stat-label">Average Marks</div>
          <div className="stat-value">
            {statistics.averageMarks > 0 ? statistics.averageMarks.toFixed(2) : '-'}
          </div>
        </div>
      </div>

      {/* Marks Entry Table */}
      <div className="card">
        <div className="card-head">
          <h2>Student Marks</h2>
          <input
            type="search"
            placeholder="Search students..."
            value={searchStudent}
            onChange={(e) => setSearchStudent(e.target.value)}
            style={{ width: 300 }}
          />
        </div>

        {filteredStudents.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--ink-faint)' }}>
            No students found
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Section</th>
                <th style={{ minWidth: 150 }}>Marks Obtained</th>
                <th style={{ minWidth: 200 }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.studentId}>
                  <td>{student.rollNumber}</td>
                  <td>{student.name}</td>
                  <td>{student.section}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max={assessment.totalMarks}
                      step="0.01"
                      value={editingMarks[student.studentId] ?? ''}
                      onChange={(e) => handleMarkChange(student.studentId, e.target.value)}
                      disabled={isSubmitted}
                      placeholder={`0 - ${assessment.totalMarks}`}
                      style={{ width: '100%', maxWidth: 120 }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editingRemarks[student.studentId] ?? ''}
                      onChange={(e) => handleRemarkChange(student.studentId, e.target.value)}
                      disabled={isSubmitted}
                      placeholder="Optional remarks"
                      style={{ width: '100%' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Save All Button at Bottom */}
        {!isSubmitted && hasChanges && (
          <div
            style={{
              padding: 20,
              borderTop: '1px solid var(--line)',
              display: 'flex',
              justifyContent: 'flex-end',
              backgroundColor: 'var(--paper)',
            }}
          >
            <button
              type="button"
              className="btn primary large"
              onClick={handleSaveAll}
              disabled={bulkMarkMutation.isPending}
              style={{ minWidth: 200 }}
            >
              {bulkMarkMutation.isPending ? 'Saving...' : '💾 Save All Changes'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
