import { useCourse } from '../../../../../hooks/useCourseQueries'

type Props = {
  id: string
  onClose: () => void
  onEdit: () => void
}

export default function CourseDetail({ id, onClose, onEdit }: Props) {
  const { data: course, isLoading } = useCourse(id)

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="card-head">
        <h2>Course details</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn secondary" onClick={onEdit}>
            Edit
          </button>
          <button type="button" className="btn secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      <div className="card-body">
        {isLoading || !course ? (
          <p style={{ color: 'var(--ink-faint)' }}>Loading…</p>
        ) : (
          <div className="profile-fields">
            {[
              { label: 'Code', value: course.code },
              { label: 'Name', value: course.name },
              { label: 'Credit hours', value: String(course.creditHours) },
              { label: 'Status', value: course.status },
              {
                label: 'Description',
                value: course.description || '—',
              },
            ].map((f) => (
              <div className="profile-field" key={f.label}>
                <div className="profile-field__label">{f.label}</div>
                <div className="profile-field__value">{f.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}