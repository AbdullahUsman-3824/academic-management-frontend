import { activeVoucher, student } from "../../data/mockStudent";

function escapeHtml(value: unknown): string {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });
}

export function handlePrintVoucher() {
  const voucher = activeVoucher;

  const studentName = escapeHtml(student.name);
  const registrationNo = escapeHtml(student.regNo);
  const section = escapeHtml(student.section);
  const semester = escapeHtml(voucher.semester);
  const voucherNo = escapeHtml(voucher.voucherNo);
  const issueDate = escapeHtml(voucher.issueDate);
  const dueDate = escapeHtml(voucher.dueDate);
  const total = escapeHtml(voucher.total);

  const feeRows = voucher.components
    .map(
      (component) => `
        <tr>
          <td>${escapeHtml(component.label)}</td>
          <td class="amount">${escapeHtml(component.amount)}</td>
        </tr>
      `,
    )
    .join("");

  const copies = [
    { title: "BANK COPY", note: "For bank record" },
    { title: "OFFICE COPY", note: "For college record" },
    { title: "STUDENT COPY", note: "Keep for your record" },
  ];

  const copyMarkup = copies
    .map(
      ({ title, note }) => `
        <section class="copy">
          <header class="copy-header">
            <div class="college-name">MUHAMMADAN<br />LAW COLLEGE</div>
            <div class="college-subtitle">
              STUDENT FEE CHALLAN
            </div>
            <div class="copy-title">${title}</div>
            <div class="copy-note">${note}</div>
          </header>

          <div class="voucher-number">
            <span>CHALLAN NO.</span>
            <strong>${voucherNo}</strong>
          </div>

          <div class="semester-line">
            <span>Semester / Session</span>
            <strong>${semester}</strong>
          </div>

          <div class="student-details">
            <div class="detail">
              <span>Student Name</span>
              <strong>${studentName}</strong>
            </div>

            <div class="detail">
              <span>Registration No.</span>
              <strong>${registrationNo}</strong>
            </div>

            <div class="detail">
              <span>Section</span>
              <strong>${section}</strong>
            </div>

            <div class="detail">
              <span>Issue Date</span>
              <strong>${issueDate}</strong>
            </div>

            <div class="detail due-date">
              <span>Due Date</span>
              <strong>${dueDate}</strong>
            </div>
          </div>

          <table class="fee-table">
            <thead>
              <tr>
                <th>FEE DESCRIPTION</th>
                <th class="amount">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              ${feeRows}
              <tr class="total-row">
                <td>TOTAL PAYABLE</td>
                <td class="amount">${total}</td>
              </tr>
            </tbody>
          </table>

          <div class="payment-instructions">
            <strong>PAYMENT INSTRUCTIONS</strong>
            <p>
              Please pay on or before the due date.
              Late-payment charges may apply according to
              college policy.
            </p>
          </div>

          <div class="bank-details">
            <div>
              <span>Bank / Branch</span>
              <div class="blank-line"></div>
            </div>
            <div>
              <span>Transaction / Receipt No.</span>
              <div class="blank-line"></div>
            </div>
          </div>

          <div class="signature-area">
            <div>
              <div class="signature-line"></div>
              <span>Bank Stamp / Teller</span>
            </div>
            <div>
              <div class="signature-line"></div>
              <span>Authorized Signature</span>
            </div>
          </div>

          <footer class="copy-footer">
            Computer-generated fee challan
            <span>•</span>
            ${title}
          </footer>
        </section>
      `,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Fee Challan - ${voucherNo}</title>

  <style>
    @page {
      size: A4 landscape;
      margin: 7mm;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, Helvetica, sans-serif;
      color: #1f2937;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      font-size: 9px;
    }

    .challan-sheet {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      width: 100%;
      align-items: stretch;
    }

    .copy {
      min-width: 0;
      padding: 8px 10px;
      border: 1px solid #9ca3af;
      display: flex;
      flex-direction: column;
      break-inside: avoid;
      overflow-wrap: anywhere;
    }

    .copy + .copy {
      border-left: 1px dashed #6b7280;
    }

    .copy-header {
      position: relative;
      text-align: center;
      padding-bottom: 8px;
      border-bottom: 2px solid #145c43;
      margin-bottom: 8px;
    }

    .college-name {
      font-size: 17px;
      line-height: 1.15;
      font-weight: 800;
      letter-spacing: 0.3px;
      color: #145c43;
    }

    .college-subtitle {
      margin-top: 4px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1.2px;
    }

    .copy-title {
      display: inline-block;
      margin-top: 7px;
      padding: 3px 12px;
      border: 1px solid #145c43;
      border-radius: 2px;
      color: #145c43;
      font-weight: 800;
      font-size: 10px;
      letter-spacing: 0.8px;
    }

    .copy-note {
      margin-top: 3px;
      font-size: 8px;
      color: #6b7280;
    }

    .voucher-number {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 5px;
      padding: 6px 7px;
      margin-bottom: 5px;
      background: #f0f5f2;
      border: 1px solid #d1ded6;
    }

    .voucher-number span,
    .semester-line span {
      font-size: 8px;
      font-weight: 700;
      color: #4b5563;
    }

    .voucher-number strong {
      font-family: "Courier New", monospace;
      font-size: 11px;
      text-align: right;
    }

    .semester-line {
      display: flex;
      justify-content: space-between;
      gap: 5px;
      padding: 5px 2px;
      border-bottom: 1px solid #d1d5db;
    }

    .semester-line strong {
      text-align: right;
    }

    .student-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 7px 10px;
      padding: 9px 2px;
    }

    .detail {
      min-width: 0;
    }

    .detail span {
      display: block;
      margin-bottom: 3px;
      color: #6b7280;
      font-size: 8px;
    }

    .detail strong {
      display: block;
      font-size: 9px;
      line-height: 1.3;
      overflow-wrap: anywhere;
    }

    .due-date strong {
      color: #b42318;
    }

    .fee-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 2px;
      table-layout: fixed;
    }

    .fee-table th {
      background: #e9efeb;
      font-size: 8px;
      text-align: left;
      padding: 6px 5px;
      border: 1px solid #d1d5db;
    }

    .fee-table td {
      font-size: 9px;
      padding: 6px 5px;
      border: 1px solid #e5e7eb;
      vertical-align: top;
      overflow-wrap: anywhere;
    }

    .fee-table .amount {
      width: 37%;
      text-align: right;
      white-space: normal;
      font-variant-numeric: tabular-nums;
    }

    .fee-table .total-row td {
      font-size: 10px;
      font-weight: 800;
      color: #145c43;
      background: #f0f5f2;
      border-top: 2px solid #145c43;
    }

    .payment-instructions {
      margin-top: 10px;
      padding: 7px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      line-height: 1.5;
    }

    .payment-instructions strong {
      font-size: 8px;
      letter-spacing: 0.4px;
    }

    .payment-instructions p {
      margin: 4px 0 0;
      color: #4b5563;
      font-size: 8px;
    }

    .bank-details {
      display: grid;
      gap: 9px;
      margin-top: 10px;
    }

    .bank-details span {
      font-size: 8px;
      color: #6b7280;
    }

    .blank-line {
      height: 15px;
      border-bottom: 1px solid #9ca3af;
    }

    .signature-area {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 15px;
    }

    .signature-area > div {
      text-align: center;
    }

    .signature-line {
      height: 20px;
      border-bottom: 1px solid #6b7280;
      margin-bottom: 4px;
    }

    .signature-area span {
      font-size: 7px;
      color: #4b5563;
    }

    .copy-footer {
      margin-top: auto;
      padding-top: 10px;
      text-align: center;
      font-size: 7px;
      color: #6b7280;
    }

    .copy-footer span {
      padding: 0 3px;
    }

    @media screen {
      body {
        background: #e5e7eb;
        padding: 20px;
      }

      .challan-sheet {
        max-width: 1100px;
        margin: 0 auto;
        background: white;
        box-shadow: 0 2px 12px #00000012;
      }

      .copy {
        min-height: 650px;
      }
    }

    @media print {
      body {
        background: white;
      }

      .challan-sheet {
        width: 100%;
      }

      .copy {
        min-height: 0;
      }
    }
  </style>
</head>

<body>
  <main class="challan-sheet">
    ${copyMarkup}
  </main>

  <script>
    window.onload = () => {
      window.focus();
      window.print();
    };
  <\/script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=1200,height=850");

  if (!win) {
    alert("Please allow pop-ups to print your fee challan.");
    return;
  }

  win.document.open();
  win.document.write(html);
  win.document.close();

  win.onafterprint = () => {
    win.close();
  };
}
