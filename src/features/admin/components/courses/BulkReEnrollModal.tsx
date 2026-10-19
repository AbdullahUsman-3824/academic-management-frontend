import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useBulkReEnroll } from "../../hooks/useEnrollmentQueries";
import { useBatches } from "../../hooks/useAcademicQueries";
import type { BulkReEnrollResult } from "../../../../api/enrollments";

type Props = {
  onClose: () => void;
};

export default function BulkReEnrollModal({ onClose }: Props) {
  const [batchFilter, setBatchFilter] = useState<string>("");
  const [dryRun, setDryRun] = useState(true);
  const [result, setResult] = useState<BulkReEnrollResult | null>(null);

  const { data: batches } = useBatches();

  const bulkReEnrollMutation = useBulkReEnroll();

  const handlePreview = async () => {
    setResult(null);
    const data = await bulkReEnrollMutation.mutateAsync({
      batchId: batchFilter || undefined,
      dryRun: true,
    });
    setResult(data);
  };

  const handleExecute = async () => {
    if (
      !confirm(
        "Are you sure you want to enroll students in their batch courses? This cannot be undone.",
      )
    ) {
      return;
    }

    setResult(null);
    const data = await bulkReEnrollMutation.mutateAsync({
      batchId: batchFilter || undefined,
      dryRun: false,
    });
    setResult(data);
  };

  const isLoading = bulkReEnrollMutation.isPending;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 800, maxHeight: "90vh", overflow: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            paddingBottom: 16,
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
              Bulk Re-enrollment
            </h2>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 13,
                color: "var(--ink-faint)",
              }}
            >
              Automatically enroll students with missing course enrollments
            </p>
          </div>
          <button
            type="button"
            className="btn secondary"
            onClick={onClose}
            style={{ padding: "4px 12px" }}
          >
            ✕
          </button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 6,
            }}
          >
            Filter by Batch (Optional)
          </label>
          <select
            value={batchFilter}
            onChange={(e) => {
              setBatchFilter(e.target.value);
              setResult(null);
            }}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 5,
              border: "1px solid var(--line)",
              fontSize: 13,
            }}
          >
            <option value="">All Batches</option>
            {batches?.map((batch) => (
              <option key={batch.id} value={batch.id}>
                Batch {batch.name}
              </option>
            ))}
          </select>
          <p
            style={{
              fontSize: 11,
              color: "var(--ink-faint)",
              marginTop: 4,
              marginBottom: 0,
            }}
          >
            Leave empty to process all active batches
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            paddingBottom: 16,
            borderBottom: "1px solid var(--line)",
          }}
        >
          <button
            type="button"
            className="btn secondary"
            onClick={handlePreview}
            disabled={isLoading}
            style={{ flex: 1 }}
          >
            {isLoading && dryRun ? "⏳ Previewing..." : "🔍 Preview"}
          </button>
          <button
            type="button"
            className="btn"
            onClick={handleExecute}
            disabled={isLoading || !result}
            style={{ flex: 1 }}
          >
            {isLoading && !dryRun ? "⏳ Enrolling..." : "✓ Execute Enrollment"}
          </button>
        </div>

        {result && (
          <div style={{ marginTop: 20 }}>
            <div
              style={{
                padding: 16,
                backgroundColor: result.dryRun ? "#fff3cd" : "#d4edda",
                border: `1px solid ${result.dryRun ? "#ffc107" : "#28a745"}`,
                borderRadius: 5,
                marginBottom: 16,
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: result.dryRun ? "#856404" : "#155724",
                }}
              >
                {result.dryRun
                  ? "📋 Preview Results"
                  : "✅ Enrollment Complete"}
              </h3>
              <div
                style={{
                  fontSize: 13,
                  color: result.dryRun ? "#856404" : "#155724",
                }}
              >
                <p style={{ margin: "4px 0" }}>
                  <strong>Students Found:</strong>{" "}
                  {result.summary.totalStudentsFound}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Students to Process:</strong>{" "}
                  {result.summary.studentsProcessed}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Students Skipped:</strong>{" "}
                  {result.summary.studentsSkipped}{" "}
                  <span style={{ fontSize: 11 }}>
                    (already have enrollments)
                  </span>
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>
                    Total Enrollments {result.dryRun ? "to Create" : "Created"}:
                  </strong>{" "}
                  {result.summary.totalEnrollmentsCreated}
                </p>
                {result.summary.totalErrors > 0 && (
                  <p style={{ margin: "4px 0", color: "#d00" }}>
                    <strong>Errors:</strong> {result.summary.totalErrors}
                  </p>
                )}
              </div>
            </div>

            {result.students.length > 0 && (
              <div>
                <h4
                  style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600 }}
                >
                  Student Details ({result.students.length})
                </h4>
                <div style={{ maxHeight: 400, overflow: "auto" }}>
                  {result.students.map((student) => (
                    <div
                      key={student.recordId}
                      style={{
                        padding: 12,
                        marginBottom: 8,
                        border: "1px solid var(--line)",
                        borderRadius: 5,
                        backgroundColor: "var(--bg)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                          marginBottom: 8,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>
                            {student.studentName}
                          </div>
                          <div
                            style={{ fontSize: 12, color: "var(--ink-faint)" }}
                          >
                            {student.studentNumber} • Semester{" "}
                            {student.semesterNumber}
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            padding: "4px 8px",
                            borderRadius: 4,
                            backgroundColor:
                              student.enrollmentsCreated > 0
                                ? "#d4edda"
                                : "#f8f9fa",
                            color:
                              student.enrollmentsCreated > 0
                                ? "#155724"
                                : "#6c757d",
                          }}
                        >
                          {student.enrollmentsCreated} courses
                        </div>
                      </div>
                      {student.coursesEnrolled.length > 0 && (
                        <div
                          style={{ fontSize: 12, color: "var(--ink-faint)" }}
                        >
                          {student.coursesEnrolled.map((c, i) => (
                            <span key={i}>
                              {c.courseCode}
                              {i < student.coursesEnrolled.length - 1
                                ? ", "
                                : ""}
                            </span>
                          ))}
                        </div>
                      )}
                      {student.errors.length > 0 && (
                        <div
                          style={{
                            marginTop: 8,
                            padding: 8,
                            backgroundColor: "#f8d7da",
                            borderRadius: 4,
                            fontSize: 12,
                            color: "#721c24",
                          }}
                        >
                          <strong>Errors:</strong>{" "}
                          {student.errors.map((e) => e.error).join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.errors.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4
                  style={{
                    margin: "0 0 8px",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#d00",
                  }}
                >
                  Global Errors ({result.errors.length})
                </h4>
                {result.errors.map((err, i) => (
                  <div
                    key={i}
                    style={{
                      padding: 8,
                      marginBottom: 4,
                      backgroundColor: "#f8d7da",
                      border: "1px solid #f5c6cb",
                      borderRadius: 4,
                      fontSize: 12,
                      color: "#721c24",
                    }}
                  >
                    Student {err.studentId}: {err.error}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!result && !isLoading && (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "var(--ink-faint)",
              fontSize: 13,
            }}
          >
            Click "Preview" to see which students will be enrolled
          </div>
        )}

        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: "1px solid var(--line)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            className="btn secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
