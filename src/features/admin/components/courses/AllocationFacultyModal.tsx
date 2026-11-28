import { useState } from "react";
import CloseRounded from "@mui/icons-material/CloseRounded";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import {
  useAllocationFacultyOptions,
  useCreateAllocation,
  useUpdateAllocation,
} from "../../hooks/useCourseQueries";
import type {
  AllocationFacultyOption,
  CurrentSectionAllocationsResponse,
} from "../../types/course.types";

type AllocationCourse =
  CurrentSectionAllocationsResponse["courses"][number];

type Props = {
  course: AllocationCourse;
  sectionId: string;
  group: CurrentSectionAllocationsResponse["group"];
  onClose: () => void;
};

export default function AllocationFacultyModal({
  course,
  sectionId,
  group,
  onClose,
}: Props) {
  const [facultyId, setFacultyId] = useState(
    course.allocation?.facultyId ?? "",
  );
  const [requestError, setRequestError] = useState<string | null>(null);
  const facultyQuery = useAllocationFacultyOptions();
  const createAllocation = useCreateAllocation();
  const updateAllocation = useUpdateAllocation();
  const isPending =
    createAllocation.isPending || updateAllocation.isPending;

  const facultyOptions = facultyQuery.data ?? [];
  const currentFacultyId = course.allocation?.facultyId;
  const currentFacultyUnavailable =
    currentFacultyId !== undefined &&
    !facultyOptions.some((faculty) => faculty.id === currentFacultyId);
  const unavailableCurrentFaculty: AllocationFacultyOption | undefined =
    currentFacultyId && currentFacultyUnavailable
      ? {
          id: currentFacultyId,
          name: course.allocation?.facultyName ?? "Currently assigned faculty",
          employeeNumber: "",
          designation: null,
          workload: 0,
          maxWorkload: 0,
          atCapacity: true,
        }
      : undefined;
  const options = unavailableCurrentFaculty
    ? [
        unavailableCurrentFaculty,
        ...facultyOptions,
      ]
    : facultyOptions;
  const selectedFaculty = options.find(
    (faculty) => faculty.id === facultyId,
  );
  const isCurrentFaculty = facultyId === currentFacultyId;
  const isFacultyAtCapacity =
    selectedFaculty?.atCapacity && !isCurrentFaculty;
  const allocationContext = `${course.code} - ${course.name} (${group.batch}, semester ${group.semester}, section ${group.section})`;

  const submitAllocation = async () => {
    if (!selectedFaculty || isCurrentFaculty || isFacultyAtCapacity) return;
    setRequestError(null);
    try {
      if (course.allocation) {
        await updateAllocation.mutateAsync({
          id: course.allocation.id,
          sectionId,
          payload: { facultyId },
        });
      } else {
        await createAllocation.mutateAsync({
          batchCourseAssignmentId: course.batchCourseAssignmentId,
          facultyId,
          sectionId,
        });
      }
      onClose();
    } catch (error) {
      setRequestError(
        error instanceof Error
          ? error.message
          : "Unable to update the allocation.",
      );
    }
  };

  return (
    <Dialog
      open
      disablePortal
      onClose={() => {
        if (!isPending) onClose();
      }}
      fullWidth
      maxWidth="sm"
      aria-labelledby="allocation-faculty-modal-title"
      slotProps={{
        paper: {
          sx: {
            border: "1px solid var(--line)",
            borderRadius: 2,
            boxShadow: "0 18px 56px rgba(20, 42, 30, 0.2)",
            backgroundColor: "var(--card)",
            backgroundImage: "none",
            color: "var(--ink)",
            fontFamily: "inherit",
          },
        },
        backdrop: {
          sx: { backgroundColor: "rgba(18, 33, 26, 0.45)" },
        },
      }}
    >
      <DialogTitle
        id="allocation-faculty-modal-title"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          px: 2.5,
          py: 2,
          color: "var(--green-900)",
          fontSize: 18,
          fontWeight: 700,
          borderBottom: "1px solid var(--line)",
        }}
      >
        {course.allocation ? "Change Faculty" : "Allocate Faculty"}
        <IconButton
          aria-label="Close"
          onClick={onClose}
          disabled={isPending}
          size="small"
          sx={{
            color: "var(--ink-soft)",
            "&:hover": {
              color: "var(--green-900)",
              backgroundColor: "var(--green-100)",
            },
          }}
        >
          <CloseRounded />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2.5, borderColor: "var(--line)" }}>
        <div className="card" style={{ background: "var(--paper)" }}>
          <div className="card-body">
            <div className="meta">Course and section</div>
            <div className="subj-title" style={{ marginTop: 4 }}>
              {allocationContext}
            </div>
            {course.allocation && (
              <div className="meta" style={{ marginTop: 8 }}>
                Currently assigned to: {course.allocation.facultyName}
              </div>
            )}
          </div>
        </div>

        <label
          htmlFor="allocation-faculty-select"
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 700,
            color: "var(--ink-soft)",
            margin: "18px 0 6px",
          }}
        >
          Faculty
        </label>
        <select
          id="allocation-faculty-select"
          value={facultyId}
          onChange={(event) => {
            setFacultyId(event.target.value);
            setRequestError(null);
          }}
          disabled={facultyQuery.isLoading || facultyQuery.isError || isPending}
          style={selectStyle}
        >
          <option value="" disabled>
            {facultyQuery.isLoading
              ? "Loading faculty..."
              : "Select faculty"}
          </option>
          {options.map((faculty) => (
            <option
              key={faculty.id}
              value={faculty.id}
              disabled={
                faculty.atCapacity && faculty.id !== currentFacultyId
              }
            >
              {facultyLabel(faculty)}
              {faculty.atCapacity && faculty.id !== currentFacultyId
                ? " - At capacity"
                : ""}
            </option>
          ))}
        </select>

        {facultyQuery.isError && (
          <div role="alert" style={errorStyle}>
            <p>
              {facultyQuery.error instanceof Error
                ? facultyQuery.error.message
                : "Unable to load faculty options."}
            </p>
            <button
              type="button"
              className="btn secondary"
              onClick={() => facultyQuery.refetch()}
            >
              Retry
            </button>
          </div>
        )}
        {!facultyQuery.isLoading &&
          !facultyQuery.isError &&
          facultyOptions.length === 0 && (
            <p className="meta">No active faculty are available.</p>
          )}

        {selectedFaculty && !isCurrentFaculty && (
          <p className="meta" style={{ margin: "14px 0 0" }}>
            {course.allocation
              ? `Confirm replacing ${course.allocation.facultyName} with ${selectedFaculty.name} for ${allocationContext}.`
              : `Confirm allocating ${selectedFaculty.name} to ${allocationContext}.`}
          </p>
        )}
        {isFacultyAtCapacity && (
          <p role="alert" style={errorStyle}>
            This faculty member is at the workload limit.
          </p>
        )}
        {requestError && (
          <p role="alert" style={errorStyle}>
            {requestError}
          </p>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 20,
          }}
        >
          <button
            type="button"
            className="btn secondary"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn"
            onClick={submitAllocation}
            disabled={
              !selectedFaculty ||
              isCurrentFaculty ||
              isFacultyAtCapacity ||
              facultyQuery.isLoading ||
              facultyQuery.isError ||
              isPending
            }
          >
            {isPending
              ? "Saving..."
              : course.allocation
                ? "Confirm Change"
                : "Confirm Allocation"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function facultyLabel(faculty: AllocationFacultyOption) {
  const designation = faculty.designation ? ` - ${faculty.designation}` : "";
  return `${faculty.name} (${faculty.employeeNumber})${designation} · ${faculty.workload}/${faculty.maxWorkload}`;
}

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 10px",
  borderRadius: 5,
  border: "1px solid var(--line)",
  background: "var(--card)",
  color: "var(--ink)",
  font: "inherit",
};

const errorStyle: React.CSSProperties = {
  color: "var(--red)",
  margin: "12px 0 0",
};
