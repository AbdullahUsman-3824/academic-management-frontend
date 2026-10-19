import { useFacultyProfile } from '../hooks/useFacultyQueries'

type FieldGroup = {
  heading: string
  fields: { label: string; value: string }[]
}

function ProfilePage() {
  const { data: faculty, isLoading } = useFacultyProfile()

  if (isLoading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-faint)' }}>
        Loading profile...
      </div>
    )
  }

  if (!faculty) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-faint)' }}>
        Faculty profile not found
      </div>
    )
  }

  const getFullName = () => {
    return `${faculty.firstName || ''} ${faculty.middleName || ''} ${faculty.lastName || ''}`.trim() || 'N/A'
  }

  const getInitials = () => {
    const first = faculty.firstName?.[0] || ''
    const last = faculty.lastName?.[0] || ''
    return (first + last).toUpperCase() || 'F'
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const fieldGroups: FieldGroup[] = [
    {
      heading: 'Personal Information',
      fields: [
        { label: 'Full Name', value: getFullName() },
        { label: 'Employee Number', value: faculty.employeeNumber || 'N/A' },
        { label: 'Email', value: faculty.email || 'N/A' },
        { label: 'Phone', value: faculty.phone || 'N/A' },
      ],
    },
    {
      heading: 'Professional Information',
      fields: [
        { label: 'Designation', value: faculty.designation || 'N/A' },
        { label: 'Qualification', value: faculty.qualification || 'N/A' },
        { label: 'Joining Date', value: formatDate(faculty.joiningDate) },
        { label: 'Status', value: faculty.status || 'N/A' },
      ],
    },
    {
      heading: 'Account Information',
      fields: [
        { label: 'Username', value: faculty.user.username || 'N/A' },
      ],
    },
  ]

  return (
    <>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            className="avatar"
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: 'var(--green-900)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {getInitials()}
          </div>
          <div>
            <h1 style={{ marginBottom: 2 }}>{getFullName()}</h1>
            <div className="today">
              {faculty.employeeNumber} · {faculty.designation || 'Faculty'}
            </div>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        {fieldGroups.map((group) => (
          <div className="card" key={group.heading}>
            <div className="card-head">
              <h2>{group.heading}</h2>
            </div>
            <div className="profile-fields">
              {group.fields.map((field) => (
                <div className="profile-field" key={field.label}>
                  <div className="profile-field__label">{field.label}</div>
                  <div className="profile-field__value">{field.value}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="profile-note">
        To update your information, please contact the Administrator's Office.
      </p>
    </>
  )
}

export default ProfilePage
