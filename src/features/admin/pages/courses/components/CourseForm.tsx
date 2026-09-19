import { useState, useEffect } from 'react'
import {
  useCourse,
  useCreateCourse,
  useUpdateCourse,
} from '../../../../../hooks/useCourseQueries'

const inputStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: 5,
  border: '1px solid var(--line)',
  fontSize: 13,
  width: '100%',
  maxWidth: 360,
}

type Props = {
  mode: 'create' | 'edit'
  courseId?: string
  onClose: () => void
}

export default function CourseForm({ mode, courseId, onClose }: Props) {
  const existing = useCourse(mode === 'edit' ? courseId ?? null : null)
  const createMut = useCreateCourse()
  const updateMut = useUpdateCourse()

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creditHours, setCreditHours] = useState(3)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (mode === 'edit' && existing.data) {
      setCode(existing.data.code)
      setName(existing.data.name)
      setDescription(existing.data.description ?? '')
      setCreditHours(existing.data.creditHours)
    }
  }, [mode, existing.data])

  const pending = createMut.isPending || updateMut.isPending

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!code.trim() || !name.trim() || creditHours < 1) {
      setFormError('Code, name, and credit hours (min 1) are required')
      return
    }

    if (mode === 'create') {
      createMut.mutate(
        {
          code: code.trim(),
          name: name.trim(),
          description: description.trim() || undefined,
          creditHours,
        },
        {
          onSuccess: () => onClose(),
          onError: (err: any) => {
            setFormError(
              err?.response?.data?.message ?? err?.message ?? 'Create failed',
            )
          },
        },
      )
    } else if (courseId) {
      updateMut.mutate(
        {
          id: courseId,
          payload: {
            code: code.trim(),
            name: name.trim(),
            description: description.trim() || undefined,
            creditHours,
          },
        },
        {
          onSuccess: () => onClose(),
          onError: (err: any) => {
            setFormError(
              err?.response?.data?.message ?? err?.message ?? 'Update failed',
            )
          },
        },
      )
    }
  }

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="card-head">
        <h2>{mode === 'create' ? 'New course' : 'Edit course'}</h2>
        <button type="button" className="btn secondary" onClick={onClose}>
          Cancel
        </button>
      </div>
      <div className="card-body">
        {mode === 'edit' && existing.isLoading ? (
          <p style={{ color: 'var(--ink-faint)' }}>Loading…</p>
        ) : (
          <form onSubmit={submit}>
            {formError && (
              <p style={{ color: 'crimson', marginBottom: 12 }}>{formError}</p>
            )}
            <div className="profile-fields">
              <div className="profile-field">
                <div className="profile-field__label">Code</div>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="LAW-401"
                  required
                  style={inputStyle}
                />
              </div>
              <div className="profile-field">
                <div className="profile-field__label">Name</div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Constitutional Law"
                  required
                  style={inputStyle}
                />
              </div>
              <div className="profile-field">
                <div className="profile-field__label">Credit hours</div>
                <input
                  type="number"
                  min={1}
                  value={creditHours}
                  onChange={(e) => setCreditHours(Number(e.target.value))}
                  required
                  style={inputStyle}
                />
              </div>
              <div className="profile-field">
                <div className="profile-field__label">Description</div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  style={{ ...inputStyle, maxWidth: 480 }}
                />
              </div>
            </div>
            <button type="submit" className="btn" style={{ marginTop: 16 }} disabled={pending}>
              {pending ? 'Saving…' : mode === 'create' ? 'Create course' : 'Save'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}