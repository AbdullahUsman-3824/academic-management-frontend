import { student } from '../data/mockStudent'

type FieldGroup = {
  heading: string
  fields: { label: string; value: string }[]
}

const fieldGroups: FieldGroup[] = [
  {
    heading: 'Personal Information',
    fields: [
      { label: 'Full Name',       value: student.name },
      { label: "Father's Name",   value: student.fatherName },
      { label: 'Date of Birth',   value: student.dateOfBirth },
      { label: 'CNIC',            value: student.cnic },
      { label: 'Gender',          value: student.gender },
      { label: 'Nationality',     value: student.nationality },
      { label: 'Religion',        value: student.religion },
    ],
  },
  {
    heading: 'Contact Information',
    fields: [
      { label: 'Email',           value: student.email },
      { label: 'Phone',           value: student.phone },
      { label: 'Address',         value: student.address },
    ],
  },
  {
    heading: 'Academic Enrollment',
    fields: [
      { label: 'Registration No.', value: student.regNo },
      { label: 'Degree',           value: student.degree },
      { label: 'Department',       value: student.department },
      { label: 'Program',          value: student.program },
      { label: 'Section',          value: student.section },
      { label: 'Shift',            value: student.shift },
      { label: 'Admission Date',   value: student.admissionDate },
      { label: 'Enrollment',       value: student.enrollmentStatus },
    ],
  },
  {
    heading: 'Guardian / Emergency Contact',
    fields: [
      { label: 'Name',       value: student.guardianName },
      { label: 'Relation',   value: student.guardianRelation },
      { label: 'Phone',      value: student.guardianPhone },
    ],
  },
]

function ProfilePage() {
  return (
    <>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="avatar" style={{
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
          }}>
            {student.initials}
          </div>
          <div>
            <h1 style={{ marginBottom: 2 }}>{student.name}</h1>
            <div className="today">{student.regNo} · {student.program} · {student.section}</div>
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
        To update your personal or contact information, contact the Registrar's Office.
      </p>
    </>
  )
}

export default ProfilePage
