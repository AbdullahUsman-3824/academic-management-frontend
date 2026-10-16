import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useStudent,
  useUpdateStudentStatus,
} from "../../hooks/useStudentQueries";
import type { StudentStatus } from "../../hooks/useStudentQueries";
import { StudentDetails } from "../../components/student/StudentDetails";
import { extractErrorMessage, getDisplayName, toLabel } from "../../helpers/student.helpers";
import { STATUS_CLASS } from "../../types/student.types";
import { adminPaths } from "../../data/navData";

function ViewStudentPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: student, isLoading } = useStudent(id ?? null);
  const statusMutation = useUpdateStudentStatus();

  const [statusDraft, setStatusDraft] = useState<StudentStatus>("active");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (student) setStatusDraft(student.status);
  }, [student]);

  const handleStatusUpdate = () => {
    if (!id) return;
    statusMutation.mutate(
      { id, dto: { status: statusDraft } },
      {
        onSuccess: () =>
          setFeedback({
            type: "success",
            message: "Student status updated successfully.",
          }),
        onError: (err) =>
          setFeedback({
            type: "error",
            message: extractErrorMessage(err, "Failed to update status."),
          }),
      },
    );
  };

  if (isLoading) {
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
      <div className="topbar" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            className="btn secondary"
            onClick={() => navigate(adminPaths.students)}
          >
            ← Back
          </button>
          <div>
            <h1 style={{ marginBottom: 2 }}>{getDisplayName(student)}</h1>
            <div className="today">
              {student.stdRegNumber} · {student.batch.name}
            </div>
          </div>
        </div>
        <div className="inline-actions">
          <button
            type="button"
            className="btn secondary"
            onClick={() => navigate(adminPaths.studentEdit(student.id))}
          >
            Edit Profile
          </button>
          <span className={`status ${STATUS_CLASS[student.status]}`}>
            {toLabel(student.status)}
          </span>
        </div>
      </div>

      {feedback && (
        <div
          className={`notice ${feedback.type === "error" ? "error" : "success"}`}
          style={{ marginBottom: 16 }}
        >
          {feedback.message}
        </div>
      )}

      <StudentDetails student={student} />

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-head">
          <h2>Update Status</h2>
        </div>
        <div className="card-body">
          <div className="toolbar-grid">
            <label className="field-label narrow">
              New Status
              <select
                className="field-control"
                value={statusDraft}
                onChange={(e) =>
                  setStatusDraft(e.target.value as StudentStatus)
                }
                disabled={statusMutation.isPending}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
              </select>
            </label>
          </div>
          <div className="action-row" style={{ marginTop: 12 }}>
            <button
              type="button"
              className="btn"
              onClick={handleStatusUpdate}
              disabled={
                statusMutation.isPending || statusDraft === student.status
              }
            >
              {statusMutation.isPending ? "Applying…" : "Apply Status"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ViewStudentPage;