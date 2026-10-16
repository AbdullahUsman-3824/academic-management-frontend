import { useNavigate } from "react-router-dom";
import { adminPaths } from "../../../data/navData";

/**
 * The backend has NO standalone "create batch" route (POST /academics/batches
 * doesn't exist) — batches are created by POST /academics/setup. Until such a
 * route is added, this page points the admin to the Setup Wizard.
 *
 * When the backend adds it: add `createBatch` to api/academic.ts and
 * `useCreateBatch` to hooks/useAcademicQueries.ts, then replace the body below
 * with <BatchForm /> (same pattern as CreateYearPage).
 */
export default function CreateBatchPage() {
  const navigate = useNavigate();

  return (
    <div className="card" style={{ margin: 16 }}>
      <div className="card-head">
        <h2>New Batch</h2>
        <button
          type="button"
          className="btn secondary"
          onClick={() => navigate(adminPaths.academicsBatches)}
        >
          ← Back to Batches
        </button>
      </div>
      <div className="card-body">
        <p style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>
          Batches are created automatically when you run the Academic Setup
          Wizard (year + sessions + batch). You can edit a batch's name, entry
          year, program duration and section capacity afterwards from the
          Batches list.
        </p>
        <button
          type="button"
          className="btn"
          onClick={() => navigate(adminPaths.academicsSetup)}
        >
          Go to Setup Wizard
        </button>
      </div>
    </div>
  );
}