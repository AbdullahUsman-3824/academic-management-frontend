import { useStudentProfile } from "../hooks/useStudentQueries";
import {
  capitalize,
  formatDate,
  formatDateTime,
  getErrorMessage,
  getInitials,
} from "../utils";

type FieldGroup = {
  heading: string;
  fields: { label: string; value: string }[];
};

const dash = (v?: string | number | null) =>
  v === null || v === undefined || v === "" ? "—" : String(v);

function ProfilePage() {
  const { data: p, isLoading, isError, error } = useStudentProfile();

  if (isLoading) {
    return (
      <div className="topbar">
        <div className="today">Loading profile…</div>
      </div>
    );
  }

  if (isError || !p) {
    return (
      <div className="topbar">
        <div className="today">
          {getErrorMessage(error, "Failed to load profile.")}
        </div>
      </div>
    );
  }

  const fieldGroups: FieldGroup[] = [
    {
      heading: "Personal Information",
      fields: [
        { label: "Full Name", value: dash(p.fullName) },
        { label: "Date of Birth", value: formatDate(p.dateOfBirth) },
        { label: "CNIC", value: dash(p.cnic) },
        { label: "Gender", value: capitalize(p.gender) },
      ],
    },
    {
      heading: "Contact Information",
      fields: [
        { label: "Email", value: dash(p.email) },
        { label: "Phone", value: dash(p.phone) },
        { label: "Address", value: dash(p.address) },
        { label: "City", value: dash(p.city) },
      ],
    },
    {
      heading: "Academic Enrollment",
      fields: [
        { label: "Registration No.", value: dash(p.stdRegNumber) },
        { label: "Batch", value: dash(p.batchName) },
        {
          label: "Semester",
          value: p.currentSemester != null ? `Semester ${p.currentSemester}` : "—",
        },
        { label: "Section", value: dash(p.currentSection) },
        { label: "Academic Session", value: dash(p.currentAcademicSession) },
        { label: "Admission Date", value: formatDate(p.admissionDate) },
        { label: "Enrollment", value: capitalize(p.status) },
      ],
    },
    {
      heading: "Guardian / Emergency Contact",
      fields: [
        { label: "Name", value: dash(p.guardianName) },
        { label: "Relation", value: dash(p.guardianRelation) },
        { label: "Phone", value: dash(p.guardianPhone) },
        { label: "CNIC", value: dash(p.guardianCnic) },
      ],
    },
    {
      heading: "Account",
      fields: [
        { label: "Username", value: dash(p.username) },
        { label: "Account Status", value: capitalize(p.accountStatus) },
        { label: "Last Login", value: formatDateTime(p.lastLoginAt) },
      ],
    },
  ];

  return (
    <>
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {p.profileImageUrl ? (
            <img
              src={p.profileImageUrl}
              alt={p.fullName}
              style={{
                width: 54,
                height: 54,
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              className="avatar"
              style={{
                width: 54,
                height: 54,
                borderRadius: "50%",
                background: "var(--green-900)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {getInitials(p.fullName)}
            </div>
          )}
          <div>
            <h1 style={{ marginBottom: 2 }}>{p.fullName}</h1>
            <div className="today">
              {p.stdRegNumber}
              {p.batchName ? ` · ${p.batchName}` : ""}
              {p.currentSection ? ` · Section ${p.currentSection}` : ""}
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
        To update your personal or contact information, contact the Registrar's
        Office.
      </p>
    </>
  );
}

export default ProfilePage;