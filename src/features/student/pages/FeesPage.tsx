import { feeStatus, activeVoucher, paymentHistory, student } from '../data/mockStudent'


function handlePrintVoucher() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Fee Voucher — ${activeVoucher.voucherNo}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 13px;
      color: #1a1a1a;
      padding: 32px;
      max-width: 680px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f5c3e;
      padding-bottom: 14px;
      margin-bottom: 20px;
    }
    .header .institute { font-size: 16px; font-weight: 700; color: #0f5c3e; }
    .header .sub       { font-size: 12px; color: #555; margin-top: 3px; }
    .header .voucher-title {
      text-align: right;
      font-size: 14px;
      font-weight: 700;
      color: #0f5c3e;
    }
    .header .voucher-no {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: #444;
      margin-top: 3px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 24px;
      background: #f5f9f7;
      border: 1px solid #cfe4d9;
      border-radius: 5px;
      padding: 14px 16px;
      margin-bottom: 20px;
    }
    .meta-item .lbl  { font-size: 10.5px; color: #666; margin-bottom: 2px; }
    .meta-item .val  { font-size: 13px; font-weight: 600; }
    .meta-item .mono { font-family: 'Courier New', monospace; font-size: 12px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      text-align: left;
      font-size: 11.5px;
      color: #555;
      font-weight: 600;
      padding: 8px 12px;
      background: #f0f0ee;
      border-bottom: 1px solid #ddd;
    }
    td {
      padding: 9px 12px;
      border-bottom: 1px solid #eee;
      font-size: 13px;
    }
    tr.total td {
      border-top: 2px solid #0f5c3e;
      border-bottom: none;
      font-weight: 700;
      font-size: 13.5px;
      color: #0f5c3e;
    }
    .footer {
      font-size: 11px;
      color: #777;
      border-top: 1px solid #ddd;
      padding-top: 12px;
      line-height: 1.6;
    }
    @media print {
      body { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="institute">Muhammadan Law College</div>
      <div class="sub">Student Fee Voucher — ${activeVoucher.semester}</div>
    </div>
    <div>
      <div class="voucher-title">Fee Voucher</div>
      <div class="voucher-no">${activeVoucher.voucherNo}</div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <div class="lbl">Student Name</div>
      <div class="val">${student.name}</div>
    </div>
    <div class="meta-item">
      <div class="lbl">Registration No.</div>
      <div class="val mono">${student.regNo}</div>
    </div>
    <div class="meta-item">
      <div class="lbl">Program / Semester</div>
      <div class="val">${student.program}</div>
    </div>
    <div class="meta-item">
      <div class="lbl">Section</div>
      <div class="val">${student.section}</div>
    </div>
    <div class="meta-item">
      <div class="lbl">Issue Date</div>
      <div class="val">${activeVoucher.issueDate}</div>
    </div>
    <div class="meta-item">
      <div class="lbl">Due Date</div>
      <div class="val" style="color:#b24a3b">${activeVoucher.dueDate}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Fee Component</th>
        <th style="text-align:right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${activeVoucher.components
        .map(
          (c) => `<tr>
        <td>${c.label}</td>
        <td style="text-align:right">${c.amount}</td>
      </tr>`
        )
        .join('')}
      <tr class="total">
        <td>Total Payable</td>
        <td style="text-align:right">${activeVoucher.total}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    Please pay by <strong>${activeVoucher.dueDate}</strong> to avoid late-payment charges.
    This is a system-generated document and does not require a physical signature.
    For queries, contact the Finance Office.
  </div>

  <script>window.onload = () => window.print();<\/script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=780,height=900')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}

function FeesPage() {
  return (
    <>
      <div className="topbar">
        <div>
          <h1>Fees</h1>
          <div className="today">Fee status, active voucher, and payment history.</div>
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
              <button type="button" className="btn" onClick={handlePrintVoucher}>
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
              <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Outstanding — {activeVoucher.semester}</div>
              <div className="fee-amount">
                {feeStatus.outstanding} <small>due</small>
              </div>
              <div className="fee-due">Due {feeStatus.dueDate}</div>
              {feeStatus.isDefaulter ? (
                <span className="status overdue" style={{ marginTop: 10, display: 'inline-block' }}>
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
                        <span className={`status ${entry.status}`}>{entry.statusLabel}</span>
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
  )
}

export default FeesPage
