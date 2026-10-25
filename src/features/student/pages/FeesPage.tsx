import { feeStatus, activeVoucher, paymentHistory } from "../data/mockStudent";

import { handlePrintVoucher } from "../components/fees/printFeeVoucher";

function FeesPage() {
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

      <div className="layout">
        <div className="col-main">
          <div className="card">
            <div className="card-head">
              <h2>Active Voucher</h2>
              <span className="meta">{activeVoucher.semester}</span>
            </div>
            <div className="card-body" style={{ paddingBottom: 4 }}>
              <div className="voucher-meta">
                <div>
                  <div className="lbl">Voucher No.</div>
                  <div className="code">{activeVoucher.voucherNo}</div>
                </div>
                <div>
                  <div className="lbl">Issue Date</div>
                  <div>{activeVoucher.issueDate}</div>
                </div>
                <div>
                  <div className="lbl">Due Date</div>
                  <div>{activeVoucher.dueDate}</div>
                </div>
              </div>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Fee Component</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {activeVoucher.components.map((component) => (
                    <tr key={component.label}>
                      <td className="subj-title">{component.label}</td>
                      <td>{component.amount}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="subj-title">Total</td>
                    <td className="subj-title">{activeVoucher.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="card-body">
              {/* Opens a print-ready voucher in a new window; user can
                  Save as PDF or print to paper via the browser dialog. */}
              <button
                type="button"
                className="btn"
                onClick={handlePrintVoucher}
              >
                Download / Print voucher
              </button>
            </div>
          </div>
        </div>

        <div className="col-side">
          <div className="card">
            <div className="card-head">
              <h2>Fee Status</h2>
            </div>
            <div className="card-body">
              <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                Outstanding — {activeVoucher.semester}
              </div>
              <div className="fee-amount">
                {feeStatus.outstanding} <small>due</small>
              </div>
              <div className="fee-due">Due {feeStatus.dueDate}</div>
              {feeStatus.isDefaulter ? (
                <span
                  className="status overdue"
                  style={{ marginTop: 10, display: "inline-block" }}
                >
                  Fee defaulter
                </span>
              ) : null}
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h2>Payment History</h2>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Semester</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((entry) => (
                    <tr key={entry.semester}>
                      <td className="subj-sub">{entry.semester}</td>
                      <td>{entry.amount}</td>
                      <td>
                        <span className={`status ${entry.status}`}>
                          {entry.statusLabel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FeesPage;
