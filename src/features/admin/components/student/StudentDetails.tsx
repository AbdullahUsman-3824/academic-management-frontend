import type { Student } from "../../api/students";
import { STATUS_CLASS } from "../../types/student.types";
import { toLabel } from "../../helpers/student.helpers";

interface StudentDetailsProps {
  student: Student;
}

export function StudentDetails({ student }: StudentDetailsProps) {
  return (
    <div className="profile-grid">
      <div className="card">
        <div className="card-head">
          <h2>Personal Information</h2>
        </div>
        <div className="profile-fields">
          {(
            [
              ["First Name", student.firstName],
              ["Middle Name", student.middleName ?? "—"],
              ["Last Name", student.lastName ?? "—"],
              ["Email", student.email ?? "—"],
              ["Phone", student.phone ?? "—"],
              ["Date of Birth", student.dateOfBirth ?? "—"],
              ["Gender", student.gender ?? "—"],
              ["CNIC", student.cnic ?? "—"],
              ["Profile Image URL", student.profileImageUrl ?? "—"],
            ] as [string, string][]
          ).map(([label, value]) => (
            <div className="profile-field" key={label}>
              <div className="profile-field__label">{label}</div>
              <div className="profile-field__value">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Enrollment Information</h2>
        </div>
        <div className="profile-fields">
          {(
            [
              ["Student ID", student.id],
              ["User ID", student.userId],
              ["Username", student.username],
              ["Registration Number", student.stdRegNumber],
              ["Batch", `${student.batch.name} (${student.batch.id})`],
              ["Admission Date", student.admissionDate],
              ["Status", toLabel(student.status)],
              ["Created At", student.createdAt],
              ["Updated At", student.updatedAt],
            ] as [string, string][]
          ).map(([label, value]) => (
            <div className="profile-field" key={label}>
              <div className="profile-field__label">{label}</div>
              <div className="profile-field__value">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Guardian Information</h2>
        </div>
        <div className="profile-fields">
          {(
            [
              ["Guardian Name", student.guardianName ?? "—"],
              ["Relation", student.guardianRelation ?? "—"],
              ["Guardian Phone", student.guardianPhone ?? "—"],
              ["Guardian CNIC", student.guardianCnic ?? "—"],
              ["Address", student.address ?? "—"],
              ["City", student.city ?? "—"],
            ] as [string, string][]
          ).map(([label, value]) => (
            <div className="profile-field" key={label}>
              <div className="profile-field__label">{label}</div>
              <div className="profile-field__value">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
