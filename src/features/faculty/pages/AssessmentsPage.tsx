import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  useAllocationDetails,
  useAllocationAssessments,
  useAssessmentCategories,
  useCreateAssessment,
  useDeleteAssessment,
} from '../hooks/useFacultyQueries'
import type { CreateAssessmentDto } from '../api/faculty'

export default function AssessmentsPage() {
  const { allocationId } = useParams<{ allocationId: string }>()
  const navigate = useNavigate()
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const { data: allocation, isLoading: loadingAllocation } = useAllocationDetails(allocationId || null)
  const { data: assessments, isLoading: loadingAssessments } = useAllocationAssessments(allocationId || null)
  const { data: categories } = useAssessmentCategories()

  const createMutation = useCreateAssessment()
  const deleteMutation = useDeleteAssessment()

  const isLoading = loadingAllocation || loadingAssessments

  if (isLoading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-faint)' }}>
        Loading assessments...
      </div>
    )
  }

  if (!allocation) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-faint)' }}>
        Course not found
      </div>
    )
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const dto: CreateAssessmentDto = {
      courseAllocationId: allocationId!,
      assessmentCategoryId: formData.get('categoryId') as string,
      title: formData.get('title') as string,
      totalMarks: Number(formData.get('totalMarks')),
      assessmentDate: formData.get('assessmentDate') as string || undefined,
    }

    try {
      await createMutation.mutateAsync(dto)
      setShowCreateDialog(false)
    } catch (error) {
      console.error('Failed to create assessment:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assessment?')) return

    try {
      await deleteMutation.mutateAsync(id)
    } catch (error) {
      console.error('Failed to delete assessment:', error)
    }
  }

  const handleViewMarks = (assessmentId: string) => {
    navigate(`/assessments/${assessmentId}/marks`)
  }

  return (
    <>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" className="btn secondary" onClick={() => navigate('/courses')}>
            ← Back
          </button>
          <div>
            <h1 style={{ marginBottom: 2 }}>{allocation.course.name} - Assessments</h1>
            <div className="today">
              {allocation.course.code} · {allocation.section.name}
            </div>
          </div>
        </div>
        <button type="button" className="btn primary" onClick={() => setShowCreateDialog(true)}>
          + Create Assessment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="flex" style={{ gap: 16, marginBottom: 24 }}>
        <div className="card stat">
          <div className="stat-label">Total Assessments</div>
          <div className="stat-value">{assessments?.length || 0}</div>
        </div>
        <div className="card stat">
          <div className="stat-label">Draft</div>
          <div className="stat-value">
            {assessments?.filter((a) => a.status === 'draft').length || 0}
          </div>
        </div>
        <div className="card stat">
          <div className="stat-label">Submitted</div>
          <div className="stat-value">
            {assessments?.filter((a) => a.status === 'submitted').length || 0}
          </div>
        </div>
      </div>

      {/* Assessments Table */}
      <div className="card">
        <div className="card-head">
          <h2>Assessments</h2>
        </div>

        {!assessments || assessments.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--ink-faint)' }}>
            No assessments created yet.
            <br />
            <button
              type="button"
              className="btn primary"
              onClick={() => setShowCreateDialog(true)}
              style={{ marginTop: 16 }}
            >
              Create Your First Assessment
            </button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Total Marks</th>
                <th>Date</th>
                <th>Status</th>
                <th>Marks Entered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((assessment) => (
                <tr key={assessment.id}>
                  <td>{assessment.title}</td>
                  <td>
                    <span className="badge">
                      {assessment.assessmentCategory.name}
                    </span>
                  </td>
                  <td>{assessment.totalMarks}</td>
                  <td>
                    {assessment.assessmentDate
                      ? new Date(assessment.assessmentDate).toLocaleDateString()
                      : '-'}
                  </td>
                  <td>
                    <span className={`badge ${assessment.status === 'submitted' ? 'success' : ''}`}>
                      {assessment.status}
                    </span>
                  </td>
                  <td>{assessment._count?.studentMarks || 0} students</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        className="btn small secondary"
                        onClick={() => handleViewMarks(assessment.id)}
                      >
                        Enter Marks
                      </button>
                      {assessment.status === 'draft' && (
                        <button
                          type="button"
                          className="btn small danger"
                          onClick={() => handleDelete(assessment.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Assessment Dialog */}
      {showCreateDialog && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowCreateDialog(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: 8,
              width: '100%',
              maxWidth: 500,
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--line)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Create Assessment</h2>
              <button
                type="button"
                onClick={() => setShowCreateDialog(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 28,
                  cursor: 'pointer',
                  padding: 0,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ink-faint)',
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ padding: 24 }}>
              <div style={{ marginBottom: 20 }}>
                <label
                  htmlFor="categoryId"
                  style={{
                    display: 'block',
                    marginBottom: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'var(--ink)',
                  }}
                >
                  Assessment Category <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <select
                  name="categoryId"
                  id="categoryId"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--line)',
                    borderRadius: 5,
                    fontSize: 14,
                  }}
                >
                  <option value="">Select category</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.weightage}%)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label
                  htmlFor="title"
                  style={{
                    display: 'block',
                    marginBottom: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'var(--ink)',
                  }}
                >
                  Title <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  placeholder="e.g., Quiz 1, Mid-term Exam"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--line)',
                    borderRadius: 5,
                    fontSize: 14,
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label
                  htmlFor="totalMarks"
                  style={{
                    display: 'block',
                    marginBottom: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'var(--ink)',
                  }}
                >
                  Total Marks <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <input
                  type="number"
                  name="totalMarks"
                  id="totalMarks"
                  min="0"
                  step="0.01"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--line)',
                    borderRadius: 5,
                    fontSize: 14,
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label
                  htmlFor="assessmentDate"
                  style={{
                    display: 'block',
                    marginBottom: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'var(--ink)',
                  }}
                >
                  Assessment Date
                </label>
                <input
                  type="date"
                  name="assessmentDate"
                  id="assessmentDate"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--line)',
                    borderRadius: 5,
                    fontSize: 14,
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  justifyContent: 'flex-end',
                  paddingTop: 16,
                  borderTop: '1px solid var(--line)',
                }}
              >
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn primary"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Assessment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
