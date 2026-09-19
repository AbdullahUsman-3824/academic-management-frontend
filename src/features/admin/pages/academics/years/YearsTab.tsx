import { useState } from "react";
import { AcademicYearStatus } from "../../../api/academic"; // ya jahan se enum aata hai
import { useYears } from "../../../hooks/useAcademicQueries";
import { StatusFilterBar } from "../../../components/StatusFilterBar";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { formatDate, yearStatusClass } from "../helpers";
import { YearDetail } from "./YearDetail";
import { YearEdit } from "./YearEdit";

const YEAR_STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: AcademicYearStatus.ACTIVE, label: "Active" },
  { value: AcademicYearStatus.INACTIVE, label: "Inactive" },
  { value: AcademicYearStatus.COMPLETED, label: "Completed" },
];

export default function AcademicsYearsPage() {
  const [yearStatus, setYearStatus] = useState<AcademicYearStatus | "all">(
    "all",
  );
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null);
  const [editingYearId, setEditingYearId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useYears(yearStatus);

  return (
    <>
      {/* ── Filters ─────────────────────────────────────────── */}
      <StatusFilterBar
        filters={[
          {
            id: "status",
            label: "Status",
            value: yearStatus,
            options: YEAR_STATUS_OPTIONS,
            onChange: (v) => setYearStatus(v as AcademicYearStatus | "all"),
          },
        ]}
        onRefresh={() => refetch()}
        meta={
          isLoading
            ? null
            : `${data?.length ?? 0} year${(data?.length ?? 0) !== 1 ? "s" : ""}${
                yearStatus !== "all" ? ` · ${yearStatus}` : ""
              }`
        }
      />

      {/* ── Error state ─────────────────────────────────────── */}
      {isError && (
        <div className="card-body">
          <p style={{ color: "var(--ink-faint)", marginBottom: 12 }}>
            {(error as Error)?.message}
          </p>
          <button
            type="button"
            className="btn secondary"
            onClick={() => refetch()}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Loading state ───────────────────────────────────── */}
      {isLoading && <LoadingSpinner label="Loading years…" />}

      {/* ── Table ───────────────────────────────────────────── */}
      {!isLoading && !isError && (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th className="col-hide-sm">Start Date</th>
                <th className="col-hide-sm">End Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data?.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      color: "var(--ink-faint)",
                      fontStyle: "italic",
                    }}
                  >
                    No academic years found
                  </td>
                </tr>
              )}
              {data?.map((year) => (
                <tr key={year.id}>
                  <td>
                    <div className="subj-title">{year.name}</div>
                  </td>
                  <td className="subj-sub col-hide-sm">
                    {formatDate(year.startDate)}
                  </td>
                  <td className="subj-sub col-hide-sm">
                    {formatDate(year.endDate)}
                  </td>
                  <td>
                    <span className={`status ${yearStatusClass[year.status]}`}>
                      {year.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn secondary"
                      style={{
                        padding: "4px 10px",
                        fontSize: 12,
                        marginRight: 6,
                      }}
                      onClick={() => setSelectedYearId(year.id)}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="btn secondary"
                      style={{ padding: "4px 10px", fontSize: 12 }}
                      onClick={() => setEditingYearId(year.id)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Detail / Edit overlays ──────────────────────────── */}
      {selectedYearId && (
        <YearDetail
          id={selectedYearId}
          onClose={() => setSelectedYearId(null)}
        />
      )}
      {editingYearId && (
        <YearEdit id={editingYearId} onClose={() => setEditingYearId(null)} />
      )}
    </>
  );
}
