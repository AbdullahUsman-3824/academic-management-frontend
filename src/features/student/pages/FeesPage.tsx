import { useStudentFees } from "../hooks/useStudentQueries";

function FeesPage() {
  // GET /students/me/fees — backend route is still a placeholder.
  const { data, isLoading, isError } = useStudentFees();

  const hasData =
    data !== undefined &&
    data !== null &&
    !(Array.isArray(data) && data.length === 0);

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Fees</h1>
          <div className="today">
            Fee status, active voucher, and payment history.
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {isLoading ? (
            <p className="page-placeholder__todo">Loading fee information…</p>
          ) : isError ? (
            <p className="page-placeholder__todo">
              Unable to load fee information right now. Please try again later.
            </p>
          ) : !hasData ? (
            <>
              <span className="status pending">Not available yet</span>
              <p className="page-placeholder__todo" style={{ marginTop: 10 }}>
                Fee details and vouchers will appear here once they are
                available.
              </p>
            </>
          ) : (
            // TODO: render the fees payload (and wire handlePrintVoucher to it)
            // once the backend defines its shape
            <pre style={{ fontSize: 12, overflow: "auto" }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </>
  );
}

export default FeesPage;