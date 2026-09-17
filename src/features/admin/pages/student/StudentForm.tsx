import type { StudentFormProps } from "./student.types";

export function StudentForm({
  mode,
  values,
  batches,
  batchesLoading,
  onChange,
  onCancel,
  onSubmit,
  submitting,
}: StudentFormProps) {
  const regReadOnly = mode === "edit";

  return (
    <div className="card">
      <div className="card-head" style={{ borderBottom: "1px solid var(--line)" }}>
        <h2>{mode === "create" ? "Register Student" : "Update Student Profile"}</h2>
      </div>

      <div className="card-body">
        <div className="form-grid two-col">

          <label className="field-label">
            Batch <span aria-hidden="true">*</span>
            <select
              className="field-control"
              value={values.batchId}
              onChange={(e) => onChange("batchId", e.target.value)}
              disabled={batchesLoading}
            >
              <option value="">{batchesLoading ? "Loading batches…" : "Select batch"}</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>{batch.name}</option>
              ))}
            </select>
          </label>

          <label className="field-label">
            Registration Number <span aria-hidden="true">*</span>
            <input
              className="field-control"
              type="text"
              value={values.stdRegNumber}
              onChange={(e) => onChange("stdRegNumber", e.target.value)}
              disabled={regReadOnly}
              readOnly={regReadOnly}
            />
          </label>

          <label className="field-label">
            First Name <span aria-hidden="true">*</span>
            <input
              className="field-control"
              type="text"
              value={values.firstName}
              onChange={(e) => onChange("firstName", e.target.value)}
            />
          </label>

          <label className="field-label">
            Middle Name
            <input
              className="field-control"
              type="text"
              value={values.middleName}
              onChange={(e) => onChange("middleName", e.target.value)}
            />
          </label>

          <label className="field-label">
            Last Name
            <input
              className="field-control"
              type="text"
              value={values.lastName}
              onChange={(e) => onChange("lastName", e.target.value)}
            />
          </label>

          <label className="field-label">
            Email
            <input
              className="field-control"
              type="email"
              value={values.email}
              onChange={(e) => onChange("email", e.target.value)}
            />
          </label>

          <label className="field-label">
            Date of Birth
            <input
              className="field-control"
              type="date"
              value={values.dateOfBirth}
              onChange={(e) => onChange("dateOfBirth", e.target.value)}
            />
          </label>

          <label className="field-label">
            Gender
            <select
              className="field-control"
              value={values.gender}
              onChange={(e) => onChange("gender", e.target.value)}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className="field-label">
            CNIC
            <input
              className="field-control"
              type="text"
              placeholder="35202-1234567-1"
              value={values.cnic}
              onChange={(e) => onChange("cnic", e.target.value)}
            />
          </label>

          <label className="field-label">
            Profile Image URL
            <input
              className="field-control"
              type="url"
              value={values.profileImageUrl}
              onChange={(e) => onChange("profileImageUrl", e.target.value)}
            />
          </label>

          <label className="field-label">
            Phone
            <input
              className="field-control"
              type="text"
              value={values.phone}
              onChange={(e) => onChange("phone", e.target.value)}
            />
          </label>

          <label className="field-label">
            City
            <input
              className="field-control"
              type="text"
              value={values.city}
              onChange={(e) => onChange("city", e.target.value)}
            />
          </label>

          <label className="field-label span-2">
            Address
            <input
              className="field-control"
              type="text"
              value={values.address}
              onChange={(e) => onChange("address", e.target.value)}
            />
          </label>

          <label className="field-label">
            Guardian Name
            <input
              className="field-control"
              type="text"
              value={values.guardianName}
              onChange={(e) => onChange("guardianName", e.target.value)}
            />
          </label>

          <label className="field-label">
            Guardian Relation
            <input
              className="field-control"
              type="text"
              value={values.guardianRelation}
              onChange={(e) => onChange("guardianRelation", e.target.value)}
            />
          </label>

          <label className="field-label">
            Guardian Phone
            <input
              className="field-control"
              type="text"
              value={values.guardianPhone}
              onChange={(e) => onChange("guardianPhone", e.target.value)}
            />
          </label>

          <label className="field-label">
            Guardian CNIC
            <input
              className="field-control"
              type="text"
              value={values.guardianCnic}
              onChange={(e) => onChange("guardianCnic", e.target.value)}
            />
          </label>

          <label className="field-label">
            Admission Date
            <input
              className="field-control"
              type="date"
              value={values.admissionDate}
              onChange={(e) => onChange("admissionDate", e.target.value)}
            />
          </label>

        </div>

        <div className="action-row" style={{ marginTop: 18 }}>
          <button
            type="button"
            className="btn"
            onClick={onSubmit}
            disabled={submitting}
          >
            {submitting
              ? mode === "create" ? "Saving…" : "Updating…"
              : mode === "create" ? "Save Student" : "Update Student"}
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
