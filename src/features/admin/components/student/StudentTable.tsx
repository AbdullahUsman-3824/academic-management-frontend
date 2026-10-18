import type { StudentListItem } from "../../api/students";
import { STATUS_CLASS } from "../../types/student.types";
import { getDisplayName, toLabel } from "../../helpers/student.helpers";

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
  const colSpan = selectMode ? 9 : 8;

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
            <th className="col-hide-sm">Phone</th>
            <th className="col-hide-sm">Email</th>
            <th>Status</th>
            <th className="col-hide-sm">Admission Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td
                colSpan={colSpan}
                style={{
                  textAlign: "center",
                  color: "var(--ink-faint)",
                  fontStyle: "italic",
                }}
              >
                Loading students…
              </td>
            </tr>
          )}
          {!loading && error && (
            <tr>
              <td
                colSpan={colSpan}
                style={{
                  textAlign: "center",
                  color: "var(--ink-faint)",
                  fontStyle: "italic",
                }}
              >
                Failed to load students. Please try again.
              </td>
            </tr>
          )}
          {!loading && !error && students.length === 0 && (
            <tr>
              <td
                colSpan={colSpan}
                style={{
                  textAlign: "center",
                  color: "var(--ink-faint)",
                  fontStyle: "italic",
                }}
              >
                No students match the selected query.
              </td>
            </tr>
          )}
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
                  <div className="subj-title">{getDisplayName(student)}</div>
                  <div className="subj-sub col-show-sm">
                    {student.batch.name}
                  </div>
                </td>
                <td className="subj-sub col-hide-sm">{student.batch.name}</td>
                <td className="subj-sub col-hide-sm">
                  {student.phone ?? "—"}
                </td>
                <td className="subj-sub col-hide-sm">
                  {student.email ?? "—"}
                </td>
                <td>
                  <span className={`status ${STATUS_CLASS[student.status]}`}>
                    {toLabel(student.status)}
                  </span>
                </td>
                <td className="subj-sub col-hide-sm">
                  {student.admissionDate}
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
