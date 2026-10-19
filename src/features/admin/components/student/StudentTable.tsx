import type { StudentListItem } from "../../api/students";
import { STATUS_CLASS } from "../../types/student.types";
import { formatDate, toLabel } from "../../helpers/student.helpers";

interface StudentTableProps {
  students: StudentListItem[];
  loading: boolean;
  error: boolean;
  selectMode: boolean;
  selectedIds: Set<string>;
  onToggleOne: (id: string, index: number, shiftKey: boolean) => void;
  onToggleAll: () => void;
  onView: (id: string) => void;
}

const EMPTY = "—";

export function StudentTable({
  students,
  loading,
  error,
  selectMode,
  selectedIds,
  onToggleOne,
  onToggleAll,
  onView,
}: StudentTableProps) {
  const colSpan = selectMode ? 11 : 10;
  const messageCell = (text: string) => (
    <tr>
      <td
        colSpan={colSpan}
        style={{
          textAlign: "center",
          color: "var(--ink-faint)",
          fontStyle: "italic",
        }}
      >
        {text}
      </td>
    </tr>
  );

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            {selectMode && (
              <th style={{ width: 32 }}>
                <input
                  type="checkbox"
                  checked={
                    students.length > 0 &&
                    students.every((s) => selectedIds.has(s.id))
                  }
                  onChange={onToggleAll}
                />
              </th>
            )}
            <th>Reg. Number</th>
            <th>Student</th>
            <th className="col-hide-sm">Batch</th>
            <th className="col-hide-sm">Semester</th>
            <th className="col-hide-sm">Section</th>
            <th className="col-hide-sm">Phone</th>
            <th className="col-hide-sm">Email</th>
            <th>Status</th>
            <th className="col-hide-sm">Admission Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {loading && messageCell("Loading students…")}
          {!loading && error && messageCell("Failed to load students. Please try again.")}
          {!loading && !error && students.length === 0 &&
            messageCell("No students match the selected query.")}
          {!loading &&
            students.map((student, index) => (
              <tr key={student.id}>
                {selectMode && (
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(student.id)}
                      onChange={(e) =>
                        onToggleOne(
                          student.id,
                          index,
                          (e.nativeEvent as MouseEvent).shiftKey,
                        )
                      }
                    />
                  </td>
                )}
                <td className="code">{student.stdRegNumber}</td>
                <td>
                  <div className="subj-title">{student.fullName}</div>
                  <div className="subj-sub col-show-sm">
                    {[
                      student.batchName,
                      student.currentSemester != null
                        ? `Sem ${student.currentSemester}`
                        : null,
                      student.currentSection
                        ? `Sec ${student.currentSection}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || EMPTY}
                  </div>
                </td>
                <td className="subj-sub col-hide-sm">
                  {student.batchName ?? EMPTY}
                </td>
                <td className="subj-sub col-hide-sm">
                  {student.currentSemester ?? EMPTY}
                </td>
                <td className="subj-sub col-hide-sm">
                  {student.currentSection ?? EMPTY}
                </td>
                <td className="subj-sub col-hide-sm">{student.phone ?? EMPTY}</td>
                <td className="subj-sub col-hide-sm">{student.email ?? EMPTY}</td>
                <td>
                  <span className={`status ${STATUS_CLASS[student.status]}`}>
                    {toLabel(student.status)}
                  </span>
                </td>
                <td className="subj-sub col-hide-sm">
                  {formatDate(student.admissionDate)}
                </td>
                <td>
                  <button
                    type="button"
                    className="btn secondary"
                    style={{ padding: "4px 10px", fontSize: 12 }}
                    onClick={() => onView(student.id)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}