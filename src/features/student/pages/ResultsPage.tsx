import { useStudentResults } from "../hooks/useStudentQueries";

function ResultsPage() {
  // GET /students/me/results — backend route is still a placeholder.
  const { data, isLoading, isError } = useStudentResults();

  const hasData =
    data !== undefined &&
    data !== null &&
    !(Array.isArray(data) && data.length === 0);

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Results</h1>
          <div className="today">
            Subject-wise results by semester, and your complete academic history.
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {isLoading ? (
            <p className="page-placeholder__todo">Loading results…</p>
          ) : isError ? (
            <p className="page-placeholder__todo">
              Unable to load results right now. Please try again later.
            </p>
          ) : !hasData ? (
            <>
              <span className="status pending">Not available yet</span>
              <p className="page-placeholder__todo" style={{ marginTop: 10 }}>
                Results will appear here once they are published by the
                Administrator.
              </p>
            </>
          ) : (
            // TODO: render the results payload once the backend defines its shape
            <pre style={{ fontSize: 12, overflow: "auto" }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </>
  );
}

export default ResultsPage;