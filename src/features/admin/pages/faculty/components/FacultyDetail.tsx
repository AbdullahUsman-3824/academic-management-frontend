import { useFacultyById, useFacultyTeachingLoad } from '../../../../../hooks/useFacultyQueries';

type Props = {
  id: string;
  onClose: () => void;
  onEdit: () => void;
};

export default function FacultyDetail({ id, onClose, onEdit }: Props) {
  const { data: faculty, isLoading } = useFacultyById(id);
  const { data: teachingLoad } = useFacultyTeachingLoad(id);

  if (isLoading) {
    return (
      <div className="side-panel">
        <div className="side-panel-header">
          <h2>Faculty Details</h2>
          <button type="button" className="btn secondary" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="side-panel-body">
          <p style={{ color: 'var(--ink-faint)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!faculty) {
    return null;
  }

  return (
    <div className="side-panel">
      <div className="side-panel-header">
        <h2>Faculty Details</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn secondary" onClick={onEdit}>
            Edit
          </button>
          <button type="button" className="btn secondary" onClick={onClose}>
            ✕
          </button>
        </div>
      </div>

      <div className="side-panel-body">
        {/* Basic Information */}
        <section style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
            Basic Information
          </h3>

          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Employee Number</div>
              <div className="detail-value">{faculty.employeeNumber}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Full Name</div>
              <div className="detail-value">
                {faculty.firstName} {faculty.middleName} {faculty.lastName}
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Email</div>
              <div className="detail-value">{faculty.email || '—'}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Phone</div>
              <div className="detail-value">{faculty.phone || '—'}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">CNIC</div>
              <div className="detail-value">{faculty.cnic || '—'}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Date of Birth</div>
              <div className="detail-value">
                {faculty.dateOfBirth
                  ? new Date(faculty.dateOfBirth).toLocaleDateString()
                  : '—'}
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Gender</div>
              <div className="detail-value">
                {faculty.gender
                  ? faculty.gender.charAt(0).toUpperCase() + faculty.gender.slice(1)
                  : '—'}
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Status</div>
              <div className="detail-value">
                <span
                  className={`status ${faculty.status === 'active' ? 'active' : 'inactive'}`}
                >
                  {faculty.status}
                </span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Address</div>
              <div className="detail-value">{faculty.address || '—'}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">City</div>
              <div className="detail-value">{faculty.city || '—'}</div>
            </div>
          </div>
        </section>

        {/* Professional Information */}
        <section style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
            Professional Information
          </h3>

          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Designation</div>
              <div className="detail-value">{faculty.designation || '—'}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Qualification</div>
              <div className="detail-value">{faculty.qualification || '—'}</div>
            </div>

            <div className="detail-item">
              <div className="detail-label">Joining Date</div>
              <div className="detail-value">
                {faculty.joiningDate
                  ? new Date(faculty.joiningDate).toLocaleDateString()
                  : '—'}
              </div>
            </div>
          </div>
        </section>

        {/* Teaching Load */}
        {teachingLoad && (
          <section style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
              Current Teaching Load
            </h3>

            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Total Courses</div>
                <div className="detail-value">{teachingLoad.totalCourses}</div>
              </div>

              <div className="detail-item">
                <div className="detail-label">Total Credit Hours</div>
                <div className="detail-value">{teachingLoad.totalCreditHours}</div>
              </div>
            </div>

            {teachingLoad.allocations.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--ink-faint)' }}>
                  Courses Assigned:
                </div>
                <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13 }}>
                  {teachingLoad.allocations.map((alloc: any) => (
                    <li key={alloc.id} style={{ marginBottom: 4 }}>
                      {alloc.course.code} - {alloc.course.name} ({alloc.section.name})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Account Information */}
        {faculty.user && (
          <section style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
              Account Information
            </h3>

            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Username</div>
                <div className="detail-value">{faculty.user.username}</div>
              </div>
            </div>
          </section>
        )}

        {/* System Information */}
        <section>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
            System Information
          </h3>

          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Created At</div>
              <div className="detail-value">
                {new Date(faculty.createdAt).toLocaleString()}
              </div>
            </div>

            {faculty.updatedAt && (
              <div className="detail-item">
                <div className="detail-label">Last Updated</div>
                <div className="detail-value">
                  {new Date(faculty.updatedAt).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
