import type { StudentDetail } from "../../api/students";
import {
  capitalize,
  formatDate,
  formatDateTime,
  toLabel,
} from "../../helpers/student.helpers";

interface StudentDetailsProps {
  student: StudentDetail;
}

type Row = [label: string, value: string];

function Section({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <div className="card">
      <div className="card-head">
        <h2>{title}</h2>
      </div>
      <div className="profile-fields">
        {rows.map(([label, value]) => (
          <div className="profile-field" key={label}>
            <div className="profile-field__label">{label}</div>
            <div className="profile-field__value">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StudentDetails({ student }: StudentDetailsProps) {
  const s = student;
  return (
    <div className="profile-grid">
      <Section
        title="Personal Information"
        rows={[
          ["Full Name", s.fullName],
          ["Email", s.email ?? "—"],
          ["Phone", s.phone ?? "—"],
          ["Date of Birth", formatDate(s.dateOfBirth)],
          ["Gender", capitalize(s.gender)],
          ["CNIC", s.cnic ?? "—"],
          ["Profile Image URL", s.profileImageUrl ?? "—"],
        ]}
      />

      <Section
        title="Enrollment Information"
        rows={[
          ["Registration Number", s.stdRegNumber],
          ["Batch", s.batchName ?? "—"],
          ["Current Semester", s.currentSemester?.toString() ?? "—"],
          ["Current Section", s.currentSection ?? "—"],
          ["Academic Session", s.currentAcademicSession ?? "—"],
          ["Admission Date", formatDate(s.admissionDate)],
          ["Status", toLabel(s.status)],
        ]}
      />

      <Section
        title="Account Information"
        rows={[
          ["Username", s.username],
          ["Account Status", capitalize(s.accountStatus)],
          ["Last Login", formatDateTime(s.lastLoginAt)],
          ["Created At", formatDateTime(s.createdAt)],
          ["Updated At", formatDateTime(s.updatedAt)],
        ]}
      />

      <Section
        title="Guardian Information"
        rows={[
          ["Guardian Name", s.guardianName ?? "—"],
          ["Relation", s.guardianRelation ?? "—"],
          ["Guardian Phone", s.guardianPhone ?? "—"],
          ["Guardian CNIC", s.guardianCnic ?? "—"],
          ["Address", s.address ?? "—"],
          ["City", s.city ?? "—"],
        ]}
      />
    </div>
  );
}