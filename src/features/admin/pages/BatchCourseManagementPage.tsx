import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBatches, useSections } from "../hooks/useAcademicQueries";
import { batchCoursesAPI } from "../../../api/batchCourses";
import { LoadingSpinner } from "../components/LoadingSpinner";

const SEMESTER_LEVELS = [
  { value: 1, label: "Semester 1" },
  { value: 2, label: "Semester 2" },
  { value: 3, label: "Semester 3" },
  { value: 4, label: "Semester 4" },
  { value: 5, label: "Semester 5" },
  { value: 6, label: "Semester 6" },
  { value: 7, label: "Semester 7" },
  { value: 8, label: "Semester 8" },
  { value: 9, label: "Semester 9" },
  { value: 10, label: "Semester 10" },
];

export default function BatchCourseManagementPage() {
  const queryClient = useQueryClient();
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("all"); // 'all' or specific section ID
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  // Fetch batches
  const { data: batches, isLoading: batchesLoading } = useBatches();

  // Fetch sections for selected batch
  const { data: sections, error: sectionsError } = useSections(
    selectedBatchId || null,
  );

  // Fetch assigned courses for selected batch/semester/section
  const {
    data: assignments,
    isLoading: assignmentsLoading,
    error: assignmentsError,
    refetch,
  } = useQuery({
    queryKey: [
      "batch-courses",
      selectedBatchId,
      selectedSemester,
      selectedSectionId,
    ],
    queryFn: () =>
      batchCoursesAPI.getAssignments({
        batchId: selectedBatchId,
        semesterNumber: selectedSemester,
        sectionId: selectedSectionId === "all" ? undefined : selectedSectionId,
      }),
    enabled: !!selectedBatchId,
  });

  // Fetch template preview
  const { data: templatePreview, isLoading: previewLoading } = useQuery({
    queryKey: [
      "template-preview",
      selectedBatchId,
      selectedSemester,
      selectedSectionId,
    ],
    queryFn: () =>
      batchCoursesAPI.previewTemplateCopy({
        batchId: selectedBatchId,
        semesterNumber: selectedSemester,
        sectionId: selectedSectionId === "all" ? undefined : selectedSectionId,
      }),
    enabled: previewDialogOpen && !!selectedBatchId,
  });

  // Copy from template mutation
  const copyFromTemplateMutation = useMutation({
    mutationFn: batchCoursesAPI.copyFromTemplate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["batch-courses"] });
      alert(data.message);
      setPreviewDialogOpen(false);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to copy from template");
    },
  });

  // Remove assignment mutation
  const removeAssignmentMutation = useMutation({
    mutationFn: batchCoursesAPI.removeAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batch-courses"] });
      alert("Course removed successfully!");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to remove course");
    },
  });

  const handleBatchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBatchId(e.target.value);
    setSelectedSectionId("all"); // Reset to "All Sections"
  };

  const handleSectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSectionId(e.target.value);
  };

  const handleSemesterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSemester(Number(e.target.value));
  };

  const handleRemoveAssignment = (assignmentId: string) => {
    if (
      window.confirm("Are you sure you want to remove this course assignment?")
    ) {
      removeAssignmentMutation.mutate(assignmentId);
    }
  };

  const handleCopyFromTemplate = () => {
    if (!selectedBatchId) return;

    if (
      window.confirm(
        `Copy ${templatePreview?.summary.newCourses || 0} new courses from template to ${selectedBatch?.name}, ${sectionLabel}, Semester ${selectedSemester}?`,
      )
    ) {
      copyFromTemplateMutation.mutate({
        batchId: selectedBatchId,
        semesterNumber: selectedSemester,
        sectionId: selectedSectionId === "all" ? undefined : selectedSectionId,
      });
    }
  };

  const selectedBatch = batches?.find((b) => b.id === selectedBatchId);
  const selectedSection = sections?.find((s) => s.id === selectedSectionId);
  const sectionLabel =
    selectedSectionId === "all"
      ? "All Sections"
      : `Section ${selectedSection?.name || ""}`;
  const isLoading = batchesLoading;

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Batch Course Management</h1>
          <div className="today">
            Assign courses to each batch at specific semester levels. Students
            will be automatically enrolled during progression.
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        className="card-head"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, color: "var(--ink-faint)" }}>
              Batch
            </label>
            <select
              value={selectedBatchId}
              onChange={handleBatchChange}
              style={{
                padding: "6px 10px",
                borderRadius: 5,
                border: "1px solid var(--line)",
                fontSize: 13,
                minWidth: 150,
              }}
            >
              <option value="">Select Batch</option>
              {batches?.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  Batch {batch.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, color: "var(--ink-faint)" }}>
              Section
            </label>
            <select
              value={selectedSectionId}
              onChange={handleSectionChange}
              disabled={!selectedBatchId}
              style={{
                padding: "6px 10px",
                borderRadius: 5,
                border: "1px solid var(--line)",
                fontSize: 13,
                minWidth: 150,
              }}
            >
              <option value="all">All Sections</option>
              {sections?.map((section) => (
                <option key={section.id} value={section.id}>
                  Section {section.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, color: "var(--ink-faint)" }}>
              Curriculum for Semester
            </label>
            <select
              value={selectedSemester}
              onChange={handleSemesterChange}
              disabled={!selectedBatchId}
              style={{
                padding: "6px 10px",
                borderRadius: 5,
                border: "1px solid var(--line)",
                fontSize: 13,
                minWidth: 150,
              }}
            >
              {SEMESTER_LEVELS.map((sem) => (
                <option key={sem.value} value={sem.value}>
                  {sem.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="btn secondary"
            onClick={() => setPreviewDialogOpen(true)}
            disabled={!selectedBatchId}
            style={{ marginTop: 18 }}
          >
            📋 Copy from Template
          </button>

          {selectedBatchId && (
            <button
              type="button"
              className="btn secondary"
              onClick={() => refetch()}
              style={{ marginTop: 18 }}
            >
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Assigned Courses Table */}
      {selectedBatchId && (
        <>
          <div
            className="card-head"
            style={{ borderTop: "none", borderBottom: "1px solid var(--line)" }}
          >
            <span className="meta">
              {selectedBatch?.name}, {sectionLabel}, Semester {selectedSemester}{" "}
              · {assignments?.length || 0} courses assigned
            </span>
          </div>

          {assignmentsError && (
            <div
              className="card-body"
              style={{
                padding: 16,
                backgroundColor: "#fee",
                border: "1px solid #f88",
              }}
            >
              <p style={{ color: "#d00", margin: 0 }}>
                <strong>Error loading assignments:</strong>{" "}
                {(assignmentsError as any)?.response?.data?.message ||
                  (assignmentsError as Error).message ||
                  "Unknown error"}
              </p>
            </div>
          )}

          {sectionsError && (
            <div
              className="card-body"
              style={{
                padding: 16,
                backgroundColor: "#fee",
                border: "1px solid #f88",
              }}
            >
              <p style={{ color: "#d00", margin: 0 }}>
                <strong>Error loading sections:</strong>{" "}
                {(sectionsError as any)?.response?.data?.message ||
                  (sectionsError as Error).message ||
                  "Unknown error"}
              </p>
            </div>
          )}

          {assignmentsLoading ? (
            <LoadingSpinner label="Loading assignments…" />
          ) : assignments?.length === 0 ? (
            <div
              className="card-body"
              style={{ textAlign: "center", padding: 32 }}
            >
              <p style={{ color: "var(--ink-faint)", fontStyle: "italic" }}>
                No courses assigned yet. Click "Copy from Template" to add
                courses to this batch/semester.
              </p>
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th className="col-hide-sm">Credit Hours</th>
                    <th>Type</th>
                    <th className="col-hide-sm">Display Order</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {assignments?.map((assignment) => (
                    <tr key={assignment.id}>
                      <td>
                        <div className="subj-title">
                          {assignment.course?.code}
                        </div>
                      </td>
                      <td>
                        <div className="subj-title">
                          {assignment.course?.name}
                        </div>
                      </td>
                      <td className="subj-sub col-hide-sm">
                        {assignment.course?.creditHours}
                      </td>
                      <td>
                        <span
                          className={`status ${assignment.isCompulsory ? "active" : ""}`}
                        >
                          {assignment.isCompulsory ? "Compulsory" : "Elective"}
                        </span>
                      </td>
                      <td className="subj-sub col-hide-sm">
                        {assignment.displayOrder}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn secondary"
                          style={{ padding: "4px 10px", fontSize: 12 }}
                          onClick={() => handleRemoveAssignment(assignment.id)}
                          disabled={removeAssignmentMutation.isPending}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Template Preview Dialog */}
      {previewDialogOpen && (
        <div
          className="modal-overlay"
          onClick={() => setPreviewDialogOpen(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 800 }}
          >
            <div className="modal-header">
              <h2>Copy from Semester Template</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setPreviewDialogOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <p className="meta" style={{ marginBottom: 16 }}>
                Preview courses from Semester {selectedSemester} template that
                will be copied to <strong>{selectedBatch?.name}</strong>
                {selectedSectionId !== "all" && (
                  <>
                    {" "}
                    → <strong>{sectionLabel}</strong>
                  </>
                )}
              </p>

              {previewLoading ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <LoadingSpinner label="Loading preview..." />
                </div>
              ) : templatePreview ? (
                <>
                  {/* Summary */}
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      padding: 16,
                      background: "var(--ink-faintest)",
                      borderRadius: 5,
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>
                        In Semester {selectedSemester} Template
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 600 }}>
                        {templatePreview.summary.totalCourses}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>
                        New Courses
                      </div>
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 600,
                          color: "var(--green)",
                        }}
                      >
                        {templatePreview.summary.newCourses}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>
                        Already Assigned
                      </div>
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 600,
                          color: "var(--ink-faint)",
                        }}
                      >
                        {templatePreview.summary.existingCourses}
                      </div>
                    </div>
                  </div>

                  {/* Always show course table */}
                  {templatePreview.preview.length === 0 ? (
                    <p
                      style={{
                        textAlign: "center",
                        color: "var(--ink-faint)",
                        padding: 20,
                        fontStyle: "italic",
                      }}
                    >
                      No courses found in Semester {selectedSemester} template.
                    </p>
                  ) : (
                    <>
                      {templatePreview.summary.newCourses === 0 && (
                        <p
                          style={{
                            textAlign: "center",
                            color: "var(--ink-faint)",
                            padding: 12,
                            fontStyle: "italic",
                            background: "var(--ink-faintest)",
                            borderRadius: 5,
                            marginBottom: 16,
                          }}
                        >
                          All courses from Semester {selectedSemester} template
                          are already assigned to this batch/section.
                        </p>
                      )}
                      <div
                        style={{
                          maxHeight: 400,
                          overflowY: "auto",
                          border: "1px solid var(--line)",
                          borderRadius: 5,
                        }}
                      >
                        <table style={{ width: "100%" }}>
                          <thead>
                            <tr>
                              <th
                                style={{
                                  padding: "8px 12px",
                                  textAlign: "left",
                                  borderBottom: "1px solid var(--line)",
                                }}
                              >
                                Code
                              </th>
                              <th
                                style={{
                                  padding: "8px 12px",
                                  textAlign: "left",
                                  borderBottom: "1px solid var(--line)",
                                }}
                              >
                                Course Name
                              </th>
                              <th
                                style={{
                                  padding: "8px 12px",
                                  textAlign: "left",
                                  borderBottom: "1px solid var(--line)",
                                }}
                              >
                                Credits
                              </th>
                              <th
                                style={{
                                  padding: "8px 12px",
                                  textAlign: "left",
                                  borderBottom: "1px solid var(--line)",
                                }}
                              >
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {templatePreview.preview.map((item, idx) => (
                              <tr
                                key={idx}
                                style={{
                                  background: item.alreadyAssigned
                                    ? "var(--ink-faintest)"
                                    : "transparent",
                                  opacity: item.alreadyAssigned ? 0.6 : 1,
                                }}
                              >
                                <td
                                  style={{
                                    padding: "8px 12px",
                                    borderBottom: "1px solid var(--line)",
                                  }}
                                >
                                  <span className="subj-title">
                                    {item.courseCode}
                                  </span>
                                </td>
                                <td
                                  style={{
                                    padding: "8px 12px",
                                    borderBottom: "1px solid var(--line)",
                                  }}
                                >
                                  <span className="subj-title">
                                    {item.courseName}
                                  </span>
                                </td>
                                <td
                                  style={{
                                    padding: "8px 12px",
                                    borderBottom: "1px solid var(--line)",
                                  }}
                                >
                                  <span className="subj-sub">
                                    {item.creditHours}
                                  </span>
                                </td>
                                <td
                                  style={{
                                    padding: "8px 12px",
                                    borderBottom: "1px solid var(--line)",
                                  }}
                                >
                                  {item.alreadyAssigned ? (
                                    <span
                                      style={{
                                        fontSize: 12,
                                        color: "var(--ink-faint)",
                                      }}
                                    >
                                      Already assigned
                                    </span>
                                  ) : (
                                    <span
                                      style={{
                                        fontSize: 12,
                                        color: "var(--green)",
                                        fontWeight: 500,
                                      }}
                                    >
                                      ✓ Will copy
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </>
              ) : null}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn secondary"
                onClick={() => setPreviewDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                onClick={handleCopyFromTemplate}
                disabled={
                  previewLoading ||
                  !templatePreview ||
                  templatePreview.summary.newCourses === 0 ||
                  copyFromTemplateMutation.isPending
                }
              >
                {copyFromTemplateMutation.isPending
                  ? "Copying..."
                  : `Copy ${templatePreview?.summary.newCourses || 0} Courses`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
