import { useState } from "react";
import {
  useOverview,
  useYears,
  useSessions,
  useBatches,
} from "../../hooks/useAcademicQueries";
import type {
  AcademicYearStatus,
  AcademicSessionStatus,
  BatchStatus,
} from "../../api/academic";

import type { Tab } from "./helpers";
import { OverviewTab } from "./OverviewTab";
import { YearsTab } from "./years/YearsTab";
import { YearDetail } from "./years/YearDetail";
import { YearEdit } from "./years/YearEdit";
import { SessionsTab } from "./sessions/SessionsTab";
import { SessionDetail } from "./sessions/SessionDetail";
import { SessionEdit } from "./sessions/SessionEdit";
import { BatchesTab } from "./batches/BatchesTab";
import { BatchDetail } from "./batches/BatchDetail";
import { BatchEdit } from "./batches/BatchEdit";
import { SetupTab } from "./SetupTab";

export default function AcademicsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [yearStatus, setYearStatus] = useState<AcademicYearStatus | "all">(
    "all",
  );
  const [sessionStatus, setSessionStatus] = useState<
    AcademicSessionStatus | "all"
  >("all");
  const [sessionYearId, setSessionYearId] = useState<string | "all">("all");
  const [batchStatus, setBatchStatus] = useState<BatchStatus | "all">("all");

  // detail / edit selection
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null);
  const [editingYearId, setEditingYearId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);

  const overview = useOverview();
  const yearsQuery = useYears(yearStatus);
  const allYears = useYears("all");
  const sessionsQuery = useSessions({
    status: sessionStatus,
    academicYearId: sessionYearId,
  });
  const batchesQuery = useBatches(batchStatus);

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Academic Management</h1>
          <div className="today">
            Academic years, sessions, batches, and setup.
          </div>
        </div>
        <button
          type="button"
          className="btn"
          onClick={() => setActiveTab("setup")}
        >
          + Setup New Academic Year
        </button>
      </div>

      <div className="card">
        <div className="tabs-row">
          {(
            [
              ["overview", "Overview"],
              ["years", "Years"],
              ["sessions", "Sessions"],
              ["batches", "Batches"],
              ["setup", "Setup"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`tab-btn${activeTab === key ? " active" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && <OverviewTab overview={overview} />}

        {activeTab === "years" && (
          <YearsTab
            yearStatus={yearStatus}
            setYearStatus={setYearStatus}
            yearsQuery={yearsQuery}
            onView={(id) => setSelectedYearId(id)}
            onEdit={(id) => setEditingYearId(id)}
          />
        )}

        {activeTab === "sessions" && (
          <SessionsTab
            sessionStatus={sessionStatus}
            setSessionStatus={setSessionStatus}
            sessionYearId={sessionYearId}
            setSessionYearId={setSessionYearId}
            years={allYears.data ?? []}
            sessionsQuery={sessionsQuery}
            onView={(id) => setSelectedSessionId(id)}
            onEdit={(id) => setEditingSessionId(id)}
          />
        )}

        {activeTab === "batches" && (
          <BatchesTab
            batchStatus={batchStatus}
            setBatchStatus={setBatchStatus}
            batchesQuery={batchesQuery}
            onView={(id) => setSelectedBatchId(id)}
            onEdit={(id) => setEditingBatchId(id)}
          />
        )}

        {activeTab === "setup" && (
          <SetupTab onDone={() => setActiveTab("overview")} />
        )}
      </div>

      {/* Detail / Edit overlays */}
      {selectedYearId && (
        <YearDetail
          id={selectedYearId}
          onClose={() => setSelectedYearId(null)}
        />
      )}
      {editingYearId && (
        <YearEdit id={editingYearId} onClose={() => setEditingYearId(null)} />
      )}
      {selectedSessionId && (
        <SessionDetail
          id={selectedSessionId}
          onClose={() => setSelectedSessionId(null)}
        />
      )}
      {editingSessionId && (
        <SessionEdit
          id={editingSessionId}
          years={allYears.data ?? []}
          onClose={() => setEditingSessionId(null)}
        />
      )}
      {selectedBatchId && (
        <BatchDetail
          id={selectedBatchId}
          onClose={() => setSelectedBatchId(null)}
        />
      )}
      {editingBatchId && (
        <BatchEdit
          id={editingBatchId}
          onClose={() => setEditingBatchId(null)}
        />
      )}
    </>
  );
}
