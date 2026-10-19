import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AcademicYearStatus } from "../../../types/academics.types";
import { useYears } from "../../../hooks/useAcademicQueries";
import { StatusFilterBar } from "../../../components/StatusFilterBar";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { adminPaths } from "../../../data/navData";
import { formatDate, yearStatusClass } from "../../../helpers/academic.helpers";

const YEAR_STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: AcademicYearStatus.ACTIVE, label: "Active" },
  { value: AcademicYearStatus.INACTIVE, label: "Inactive" },
  { value: AcademicYearStatus.COMPLETED, label: "Completed" },
];

export default function YearsPage() {
  const navigate = useNavigate();
  const [yearStatus, setYearStatus] = useState<AcademicYearStatus | "all">(
    "all",
  );

  const { data, isLoading, isError, error, refetch } = useYears(yearStatus);
  const years = data ?? [];

  return (
    <>
      <div
        className="card-head"
        style={{ borderTop: "none", borderBottom: "1px solid var(--line)" }}
      >
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
              ? "Loading…"
              : `${years.length} academic year${years.length !== 1 ? "s" : ""}`
          }
        />
      </div>

      {isError && (
        <div className="card-body">
          <p style={{ color: "crimson", marginBottom: 12 }}>
            {(error as Error)?.message ?? "Failed to load academic years"}
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

      {isLoading && <LoadingSpinner label="Loading academic years…" />}

      {!isLoading && !isError && (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th className="col-hide-sm">Start Date</th>
                <th className="col-hide-sm">End Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {years.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{ textAlign: "center", padding: "32px 16px" }}
                  >
                    <p style={{ color: "var(--ink-faint)", marginBottom: 12 }}>
                      No academic years found
                    </p>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => navigate(adminPaths.academicsSetup)}
                    >
                      Setup Academic Year
                    </button>
                  </td>
                </tr>
              )}

              {years.map((year) => (
                <tr key={year.id}>
                  <td>
                    <div className="subj-title">{year.name}</div>
                  </td>
                  <td className="col-hide-sm subj-sub">
                    {formatDate(year.startDate)}
                  </td>
                  <td className="col-hide-sm subj-sub">
                    {formatDate(year.endDate)}
                  </td>
                  <td>
                    <span className={`status ${yearStatusClass[year.status]}`}>
                      {year.status}
                    </span>
                  </td>
                  <td>
                    <div className="inline-actions">
                      {year.status !== AcademicYearStatus.COMPLETED && (
                        <button
                          type="button"
                          className="btn secondary"
                          style={{ padding: "4px 10px", fontSize: 12 }}
                          onClick={() =>
                            navigate(adminPaths.academicsYearEdit(year.id))
                          }
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
