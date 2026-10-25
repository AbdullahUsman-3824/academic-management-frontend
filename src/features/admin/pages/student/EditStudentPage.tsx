import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBatches } from "../../hooks/useAcademicQueries";
import { useStudent, useUpdateStudent } from "../../hooks/useStudentQueries";
import { StudentForm } from "../../components/student/StudentForm";
import {
  extractErrorMessage,
  toNullable,
  toStudentFormValues,
} from "../../helpers/student.helpers";
import { EMPTY_FORM } from "../../types/student.types";
import type { StudentFormValues } from "../../types/student.types";
import type { Gender } from "../../../../types/student.types";
import { adminPaths } from "../../data/navData";

function EditStudentPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: student, isLoading } = useStudent(id ?? null);
  const { data: batchesData, isLoading: batchesLoading } = useBatches();
  const batches = batchesData ?? [];
  const [initialized, setInitialized] = useState(false);

  const updateMutation = useUpdateStudent();

  const [draft, setDraft] = useState<StudentFormValues>(EMPTY_FORM);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    // initialise once, when BOTH student and batches have loaded,
    // so a background refetch never wipes the user's edits
    if (student && batchesData && !initialized) {
      setDraft(toStudentFormValues(student, batchesData));
      setInitialized(true);
    }
  }, [student, batchesData, initialized]);

  const handleFormChange = (field: keyof StudentFormValues, value: string) =>
    setDraft((prev) => ({ ...prev, [field]: value }));

  const draftToDto = () => ({
    batchId: draft.batchId || undefined,
    firstName: draft.firstName.trim() || undefined,
    middleName: toNullable(draft.middleName),
    lastName: toNullable(draft.lastName),
    email: toNullable(draft.email),
    dateOfBirth: toNullable(draft.dateOfBirth),
    gender: (toNullable(draft.gender) as Gender | null) ?? null,
    cnic: toNullable(draft.cnic),
    profileImageUrl: toNullable(draft.profileImageUrl),
    phone: toNullable(draft.phone),
    address: toNullable(draft.address),
    city: toNullable(draft.city),
    guardianName: toNullable(draft.guardianName),
    guardianRelation: toNullable(draft.guardianRelation),
    guardianPhone: toNullable(draft.guardianPhone),
    guardianCnic: toNullable(draft.guardianCnic),
    admissionDate: toNullable(draft.admissionDate),
  });

  const handleUpdate = () => {
    if (!id) return;
    if (!draft.batchId.trim()) {
      setFeedback({ type: "error", message: "Batch is required." });
      return;
    }
    if (!draft.firstName.trim()) {
      setFeedback({ type: "error", message: "First name is required." });
      return;
    }

    updateMutation.mutate(
      { id, dto: draftToDto() },
      {
        onSuccess: () => navigate(adminPaths.studentView(id)),
        onError: (err) =>
          setFeedback({
            type: "error",
            message: extractErrorMessage(err, "Failed to update student."),
          }),
      },
    );
  };

  if (isLoading || batchesLoading) {
    return (
      <div className="card">
        <div className="card-body">
          <p className="meta">Loading student…</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="card">
        <div className="card-body">
          <p className="empty-note">Student not found.</p>
          <button
            type="button"
            className="btn secondary"
            onClick={() => navigate(adminPaths.students)}
          >
            Back to list
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Update Student Profile</h1>
          <div className="today">
            {student.stdRegNumber} · {student.batchName ?? "No batch"}
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`notice ${feedback.type === "error" ? "error" : "success"}`}
        >
          {feedback.message}
        </div>
      )}

      <StudentForm
        mode="edit"
        values={draft}
        batches={batches}
        batchesLoading={batchesLoading}
        sections={[]}
        sectionsLoading={false}
        academicSessions={[]}
        academicSessionsLoading={false}
        onChange={handleFormChange}
        onCancel={() => navigate(adminPaths.studentView(id ?? ""))}
        onSubmit={handleUpdate}
        submitting={updateMutation.isPending}
      />
    </>
  );
}

export default EditStudentPage;
