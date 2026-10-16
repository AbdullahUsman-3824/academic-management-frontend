import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Gender } from "../../api/students";
import {
  useBatches,
  useEnrollmentSections,
  useAcademicSessionsList,
} from "../../hooks/useAcademicQueries";
import { useCreateStudent } from "../../hooks/useStudentQueries";
import { StudentForm } from "../../components/student/StudentForm";
import { extractErrorMessage, toNullable } from "../../helpers/student.helpers";
import { EMPTY_FORM } from "../../types/student.types";
import type { StudentFormValues } from "../../types/student.types";
import { adminPaths } from "../../data/navData";

function CreateStudentPage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<StudentFormValues>(EMPTY_FORM);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const { data: batchesData, isLoading: batchesLoading } = useBatches();
  const batches = batchesData ?? [];

  const { data: sectionsData, isLoading: sectionsLoading } =
    useEnrollmentSections(draft.batchId || null);
  const sections = sectionsData ?? [];

  const { data: academicSessionsData, isLoading: academicSessionsLoading } =
    useAcademicSessionsList(true);
  const academicSessions = academicSessionsData ?? [];

  const createMutation = useCreateStudent();

  useEffect(() => {
    if (!batchesLoading && batches.length > 0 && !draft.batchId) {
      setDraft((prev) => ({ ...prev, batchId: batches[0].id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchesLoading, batches, draft.batchId]);

  useEffect(() => {
    if (
      !academicSessionsLoading &&
      academicSessions.length > 0 &&
      !draft.academicSessionId
    ) {
      setDraft((prev) => ({
        ...prev,
        academicSessionId: academicSessions[0].id,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [academicSessionsLoading, academicSessions, draft.academicSessionId]);

  const handleFormChange = (field: keyof StudentFormValues, value: string) =>
    setDraft((prev) => {
      if (field === "batchId" && value !== prev.batchId) {
        return { ...prev, batchId: value, sectionId: "" };
      }
      return { ...prev, [field]: value };
    });

  const validateForm = (): { ok: true } | { ok: false; message: string } => {
    if (!draft.batchId.trim())
      return { ok: false, message: "Batch is required." };
    if (!draft.firstName.trim())
      return { ok: false, message: "First name is required." };
    if (!draft.stdRegNumber.trim())
      return { ok: false, message: "Registration number is required." };
    return { ok: true };
  };

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

  const enrollmentExtrasToDto = () => {
    const semesterNum = Math.min(
      8,
      Math.max(1, Number.parseInt(draft.semesterNumber, 10) || 1),
    );
    return {
      academicSessionId: toNullable(draft.academicSessionId) ?? undefined,
      semesterNumber: semesterNum,
      sectionId: toNullable(draft.sectionId),
    };
  };

  const handleCreate = () => {
    const v = validateForm();
    if (!v.ok) {
      setFeedback({ type: "error", message: v.message });
      return;
    }

    createMutation.mutate(
      {
        ...draftToDto(),
        ...enrollmentExtrasToDto(),
        batchId: draft.batchId,
        stdRegNumber: draft.stdRegNumber.trim(),
        firstName: draft.firstName.trim(),
      },
      {
        onSuccess: (created) => {
          navigate(adminPaths.studentView(created.id));
        },
        onError: (err) =>
          setFeedback({
            type: "error",
            message: extractErrorMessage(err, "Failed to enroll student."),
          }),
      },
    );
  };

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Register Student</h1>
          <div className="today">Enroll a new student.</div>
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
        mode="create"
        values={draft}
        batches={batches}
        batchesLoading={batchesLoading}
        sections={sections}
        sectionsLoading={sectionsLoading}
        academicSessions={academicSessions}
        academicSessionsLoading={academicSessionsLoading}
        onChange={handleFormChange}
        onCancel={() => navigate(adminPaths.students)}
        onSubmit={handleCreate}
        submitting={createMutation.isPending}
      />
    </>
  );
}

export default CreateStudentPage;