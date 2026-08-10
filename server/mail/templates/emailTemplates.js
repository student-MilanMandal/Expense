/**
 * HTML Email Templates for ExpensePilot / Smart Khata
 */

const formatEmailDate = (dateVal) => {
  if (!dateVal) return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const isoStr = dateVal instanceof Date ? dateVal.toISOString() : String(dateVal);

  if (isoStr.includes('-')) {
    const datePart = isoStr.split('T')[0];
    const parts = datePart.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIndex = Number(parts[1]) - 1;
      const month = monthNames[monthIndex] || parts[1];
      const day = Number(parts[2]);
      return `${day} ${month} ${year}`;
    }
  }

  const d = new Date(dateVal);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// 1. Budget Alert Template (Threshold Warning or Limit Exceeded)
export const budgetAlertTemplate = ({
  userName,
  category,
  period,
  totalSpent,
  budgetLimit,
  alertThreshold,
  percent,
  isExceeded,
}) => {
  const accentColor = isExceeded ? '#f43f5e' : '#f59e0b';
  const badgeText = isExceeded ? '🚨 CRITICAL: LIMIT EXCEEDED' : '⚠️ HIGH SPENDING WARNING';

  return `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #070a11; color: #ffffff; padding: 30px; border-radius: 24px; border: 1px solid #1e293b; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background-color: ${accentColor}20; border: 1px solid ${accentColor}; padding: 6px 16px; border-radius: 999px; color: ${accentColor}; font-size: 11px; font-weight: 800; letter-spacing: 1px;">
          ${badgeText}
        </div>
        <h2 style="color: #ffffff; margin-top: 16px; font-size: 22px; font-weight: 900;">
          ${category} Budget Alert
        </h2>
      </div>

      <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; text-align: center;">
        Hello <strong style="color: #ffffff;">${userName || 'User'}</strong>,<br/>
        Your spending on <strong>${category}</strong> has reached <strong style="color: ${accentColor};">${percent}%</strong> of your set budget limit.
      </p>

      <div style="background-color: #0d121f; border: 1px solid #1e293b; padding: 20px; border-radius: 18px; margin: 24px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #cbd5e1;">
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Category:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #ffffff;">${category}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Budget Period:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #818cf8; text-transform: uppercase;">${period}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Current Spending:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 800; color: ${accentColor};">₹${Number(totalSpent).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Budget Limit:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #ffffff;">₹${Number(budgetLimit).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Alert Threshold:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #f59e0b;">${alertThreshold}% (${percent}% Used)</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin-top: 30px; border-top: 1px solid #1e293b; pt: 20px;">
        <p style="font-size: 11px; color: #475569; margin: 0;">
          ExpensePilot Automated Alert System
        </p>
      </div>
    </div>
  `;
};

// 2. Income Entry Added Template
export const incomeAddedTemplate = ({
  userName,
  amount,
  source,
  category,
  date,
  paymentMethod,
}) => {
  return `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #070a11; color: #ffffff; padding: 30px; border-radius: 24px; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background-color: #10b98120; border: 1px solid #10b981; padding: 6px 16px; border-radius: 999px; color: #10b981; font-size: 11px; font-weight: 800; letter-spacing: 1px;">
          💰 NEW INCOME RECORDED
        </div>
        <h2 style="color: #ffffff; margin-top: 16px; font-size: 22px; font-weight: 900;">
          +₹${Number(amount).toLocaleString('en-IN')} Received
        </h2>
      </div>

      <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; text-align: center;">
        Hello <strong style="color: #ffffff;">${userName || 'User'}</strong>,<br/>
        A new income credit entry has been logged to your ExpensePilot account.
      </p>

      <div style="background-color: #0d121f; border: 1px solid #1e293b; padding: 20px; border-radius: 18px; margin: 24px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #cbd5e1;">
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Source:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #ffffff;">${source || 'Income Source'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Category:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #34d399;">${category}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Payment Method:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #ffffff;">${paymentMethod}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Date:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #ffffff;">${new Date(date).toLocaleDateString()}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin-top: 30px; border-top: 1px solid #1e293b; pt: 20px;">
        <p style="font-size: 11px; color: #475569; margin: 0;">
          ExpensePilot Income Confirmation
        </p>
      </div>
    </div>
  `;
};

// 3. Khata Transaction Template
export const khataTxnTemplate = ({
  userName,
  customerName,
  type,
  amount,
  notes,
  date,
}) => {
  const isGave = type === 'GAVE';
  const accentColor = isGave ? '#f43f5e' : '#10b981';
  const titleText = isGave ? 'Credit Given' : 'Payment Received';

  return `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #070a11; color: #ffffff; padding: 30px; border-radius: 24px; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background-color: ${accentColor}20; border: 1px solid ${accentColor}; padding: 6px 16px; border-radius: 999px; color: ${accentColor}; font-size: 11px; font-weight: 800; letter-spacing: 1px;">
          📖 KHATA BOOK LEDGER ENTRY
        </div>
        <h2 style="color: #ffffff; margin-top: 16px; font-size: 22px; font-weight: 900;">
          ${titleText}
        </h2>
      </div>

      <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; text-align: center;">
        Hello <strong style="color: #ffffff;">${userName || 'User'}</strong>,<br/>
        A Khata Book ledger entry was recorded for <strong>${customerName}</strong>.
      </p>

      <div style="background-color: #0d121f; border: 1px solid #1e293b; padding: 20px; border-radius: 18px; margin: 24px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #cbd5e1;">
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Customer Name:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #ffffff;">${customerName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Transaction Type:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: ${accentColor};">${isGave ? 'You Gave (Credit)' : 'You Got (Payment)'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Amount:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 800; color: ${accentColor}; font-size: 16px;">₹${Number(amount).toLocaleString('en-IN')}</td>
          </tr>
          ${notes ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Notes:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #94a3b8;">${notes}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Date:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #ffffff;">${new Date(date || Date.now()).toLocaleDateString()}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin-top: 30px; border-top: 1px solid #1e293b; pt: 20px;">
        <p style="font-size: 11px; color: #475569; margin: 0;">
          Smart Khata • Digital Ledger Confirmation
        </p>
      </div>
    </div>
  `;
};

// 4. Daily Cash Book Flow Template
export const cashEntryTemplate = ({
  userName,
  type,
  amount,
  date,
  notes,
  openingBalance = 0,
  cashIn = 0,
  cashOut = 0,
  closingBalance = 0,
}) => {
  const isCashIn = type === 'CASH_IN' || type === 'IN';
  const accentColor = isCashIn ? '#10b981' : '#f43f5e';
  const titleText = isCashIn ? '💵 CASH IN (+)' : '💸 CASH OUT (-)';
  const displayDate = formatEmailDate(date);

  return `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #070a11; color: #ffffff; padding: 30px; border-radius: 24px; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background-color: ${accentColor}20; border: 1px solid ${accentColor}; padding: 6px 16px; border-radius: 999px; color: ${accentColor}; font-size: 11px; font-weight: 800; letter-spacing: 1px;">
          DAILY CASH BOOK FLOW REPORT
        </div>
        <h2 style="color: #ffffff; margin-top: 16px; font-size: 22px; font-weight: 900;">
          ${titleText}: ${isCashIn ? '+' : '-'}₹${Number(amount).toLocaleString('en-IN')}
        </h2>
      </div>

      <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; text-align: center;">
        Hello <strong style="color: #ffffff;">${userName || 'User'}</strong>,<br/>
        A cash transaction was recorded for <strong style="color: #ffffff;">${displayDate}</strong>. Below is your updated daily cash breakdown:
      </p>

      <!-- Transaction Logged Details -->
      <div style="background-color: #0d121f; border: 1px solid #1e293b; padding: 20px; border-radius: 18px; margin: 20px 0;">
        <h4 style="margin: 0 0 12px 0; color: #cbd5e1; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
          📌 Transaction Details
        </h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #cbd5e1;">
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Flow Type:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 800; color: ${accentColor};">${isCashIn ? 'Cash In (+ Received)' : 'Cash Out (- Paid)'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Amount:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 800; color: ${accentColor}; font-size: 16px;">${isCashIn ? '+' : '-'}₹${Number(amount).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Date:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #ffffff;">${displayDate}</td>
          </tr>
          ${notes ? `
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Notes / Remark:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #94a3b8;">${notes}</td>
          </tr>
          ` : ''}
        </table>
      </div>

      <!-- Complete Daily Cash Flow Summary Card -->
      <div style="background-color: #0f172a; border: 1px solid #334155; padding: 20px; border-radius: 18px; margin: 20px 0;">
        <h4 style="margin: 0 0 14px 0; color: #38bdf8; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
          📊 Daily Cash Summary (${displayDate})
        </h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #cbd5e1;">
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">🏦 Opening Balance:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 800; color: #ffffff;">₹${Number(openingBalance).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">🟢 Total Cash In Today:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 800; color: #10b981;">+₹${Number(cashIn).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">🔴 Total Cash Out Today:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 800; color: #f43f5e;">-₹${Number(cashOut).toLocaleString('en-IN')}</td>
          </tr>
        </table>

        <!-- Remaining Cash Highlight Banner -->
        <div style="margin-top: 16px; padding: 14px; background-color: #0284c715; border: 1px solid #0284c740; border-radius: 14px; text-align: center;">
          <span style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px;">
            💼 Remaining Cash in Hand (Closing Balance)
          </span>
          <div style="font-size: 22px; font-weight: 900; color: #00f2fe; margin-top: 4px;">
            ₹${Number(closingBalance).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 24px; border-top: 1px solid #1e293b; padding-top: 18px;">
        <p style="font-size: 11px; color: #475569; margin: 0;">
          ExpensePilot • Daily Cash Book Automated Confirmation
        </p>
      </div>
    </div>
  `;
};

// 5. Khata Customer Added Template
export const customerAddedTemplate = ({
  userName,
  customerName,
  mobile,
  address,
}) => {
  return `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #070a11; color: #ffffff; padding: 30px; border-radius: 24px; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background-color: #6366f120; border: 1px solid #6366f1; padding: 6px 16px; border-radius: 999px; color: #818cf8; font-size: 11px; font-weight: 800; letter-spacing: 1px;">
          👤 NEW KHATA CUSTOMER ADDED
        </div>
        <h2 style="color: #ffffff; margin-top: 16px; font-size: 22px; font-weight: 900;">
          ${customerName}
        </h2>
      </div>

      <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; text-align: center;">
        Hello <strong style="color: #ffffff;">${userName || 'User'}</strong>,<br/>
        A new customer was successfully added to your Khata Book digital ledger.
      </p>

      <div style="background-color: #0d121f; border: 1px solid #1e293b; padding: 20px; border-radius: 18px; margin: 24px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #cbd5e1;">
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Customer Name:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #ffffff;">${customerName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Mobile Number:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #818cf8;">${mobile}</td>
          </tr>
          ${address ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Address:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #94a3b8;">${address}</td>
          </tr>
          ` : ''}
        </table>
      </div>

      <div style="text-align: center; margin-top: 30px; border-top: 1px solid #1e293b; pt: 20px;">
        <p style="font-size: 11px; color: #475569; margin: 0;">
          Smart Khata • Customer Ledger System
        </p>
      </div>
    </div>
  `;
};

// 6. Loan Record Created Template
export const loanCreatedTemplate = ({
  userName,
  personName,
  type,
  amount,
  emiAmount,
  interestRate,
  dueDate,
  notes,
}) => {
  const isLent = type === 'LENT';
  const accentColor = isLent ? '#10b981' : '#6366f1';
  const typeText = isLent ? 'Money Lent (Give)' : 'Money Borrowed (Take)';

  return `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #070a11; color: #ffffff; padding: 30px; border-radius: 24px; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background-color: ${accentColor}20; border: 1px solid ${accentColor}; padding: 6px 16px; border-radius: 999px; color: ${accentColor}; font-size: 11px; font-weight: 800; letter-spacing: 1px;">
          🏦 NEW LOAN RECORDED
        </div>
        <h2 style="color: #ffffff; margin-top: 16px; font-size: 22px; font-weight: 900;">
          ₹${Number(amount).toLocaleString('en-IN')} (${typeText})
        </h2>
      </div>

      <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; text-align: center;">
        Hello <strong style="color: #ffffff;">${userName || 'User'}</strong>,<br/>
        A new loan entry for <strong>${personName}</strong> has been logged in your account.
      </p>

      <div style="background-color: #0d121f; border: 1px solid #1e293b; padding: 20px; border-radius: 18px; margin: 24px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #cbd5e1;">
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Person / Lender:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #ffffff;">${personName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Loan Type:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: ${accentColor};">${typeText}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Principal Amount:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 800; color: #ffffff; font-size: 16px;">₹${Number(amount).toLocaleString('en-IN')}</td>
          </tr>
          ${emiAmount ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Monthly EMI:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #38bdf8;">₹${Number(emiAmount).toLocaleString('en-IN')} / mo</td>
          </tr>
          ` : ''}
          ${interestRate ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Interest Rate:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #f59e0b;">${interestRate}% p.a</td>
          </tr>
          ` : ''}
          ${dueDate ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Due Date:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #a855f7;">${new Date(dueDate).toLocaleDateString()}</td>
          </tr>
          ` : ''}
          ${notes ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Notes:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #94a3b8;">${notes}</td>
          </tr>
          ` : ''}
        </table>
      </div>

      <div style="text-align: center; margin-top: 30px; border-top: 1px solid #1e293b; pt: 20px;">
        <p style="font-size: 11px; color: #475569; margin: 0;">
          Smart Khata • Loans & EMI Management
        </p>
      </div>
    </div>
  `;
};

// 7. Loan EMI Repayment Payment Template
export const emiPaidTemplate = ({
  userName,
  personName,
  paidAmount,
  principalAmount,
  totalPaid,
  remainingBalance,
  status,
  notes,
  date,
}) => {
  const isFullyPaid = remainingBalance <= 0 || status === 'PAID';
  const accentColor = isFullyPaid ? '#10b981' : '#38bdf8';
  const statusBadge = isFullyPaid ? '✅ LOAN FULLY PAID' : `⏳ PENDING (₹${Number(remainingBalance).toLocaleString('en-IN')})`;

  return `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #070a11; color: #ffffff; padding: 30px; border-radius: 24px; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background-color: ${accentColor}20; border: 1px solid ${accentColor}; padding: 6px 16px; border-radius: 999px; color: ${accentColor}; font-size: 11px; font-weight: 800; letter-spacing: 1px;">
          💳 EMI PAYMENT RECORDED
        </div>
        <h2 style="color: #ffffff; margin-top: 16px; font-size: 24px; font-weight: 900;">
          ₹${Number(paidAmount).toLocaleString('en-IN')} Paid
        </h2>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 4px; font-weight: 700;">
          Person: <strong style="color: #ffffff;">${personName}</strong>
        </p>
      </div>

      <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; text-align: center;">
        Hello <strong style="color: #ffffff;">${userName || 'User'}</strong>,<br/>
        An EMI installment of <strong>₹${Number(paidAmount).toLocaleString('en-IN')}</strong> was successfully logged for <strong>${personName}</strong>.
      </p>

      <div style="background-color: #0d121f; border: 1px solid #1e293b; padding: 20px; border-radius: 18px; margin: 24px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #cbd5e1;">
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Payment Amount:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 800; color: #10b981; font-size: 15px;">+₹${Number(paidAmount).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Principal Loan:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #ffffff;">₹${Number(principalAmount).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Total Paid So Far:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #38bdf8;">₹${Number(totalPaid).toLocaleString('en-IN')}</td>
          </tr>
          <tr style="border-top: 1px dashed #1e293b; border-bottom: 1px dashed #1e293b;">
            <td style="padding: 10px 0; color: #cbd5e1; font-weight: 800;">Remaining Balance:</td>
            <td style="padding: 10px 0; text-align: right; font-weight: 900; color: ${isFullyPaid ? '#10b981' : '#f43f5e'}; font-size: 16px;">₹${Number(remainingBalance).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Loan Status:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 800; color: ${accentColor};">${statusBadge}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Payment Date:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #ffffff;">${new Date(date || Date.now()).toLocaleDateString()}</td>
          </tr>
          ${notes ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Payment Notes:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #94a3b8;">${notes}</td>
          </tr>
          ` : ''}
        </table>
      </div>

      <div style="text-align: center; margin-top: 30px; border-top: 1px solid #1e293b; pt: 20px;">
        <p style="font-size: 11px; color: #475569; margin: 0;">
          Smart Khata • Loans & EMI Payment Confirmation
        </p>
      </div>
    </div>
  `;
};

// 8. Expense Summary & Income Exceeded Alert Template
export const expenseSummaryAlertTemplate = ({
  userName,
  amount,
  category,
  description,
  date,
  paymentMethod,
  monthName,
  monthlyIncome = 0,
  monthlyExpenses = 0,
  monthlyBalance = 0,
  overallIncome = 0,
  overallExpenses = 0,
  overallBalance = 0,
  isIncomeCrossed = false,
}) => {
  const accentColor = isIncomeCrossed ? '#f43f5e' : '#38bdf8';
  const badgeText = isIncomeCrossed ? '🚨 CRITICAL: INCOME LIMIT CROSSED' : '💸 EXPENSE RECORDED';
  const formattedMonthlyBal = monthlyBalance < 0
    ? `-₹${Math.abs(monthlyBalance).toLocaleString('en-IN')}`
    : `₹${Number(monthlyBalance).toLocaleString('en-IN')}`;
  const formattedOverallBal = overallBalance < 0
    ? `-₹${Math.abs(overallBalance).toLocaleString('en-IN')}`
    : `₹${Number(overallBalance).toLocaleString('en-IN')}`;

  return `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #070a11; color: #ffffff; padding: 30px; border-radius: 24px; border: 1px solid #1e293b; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background-color: ${accentColor}20; border: 1px solid ${accentColor}; padding: 6px 16px; border-radius: 999px; color: ${accentColor}; font-size: 11px; font-weight: 800; letter-spacing: 1px;">
          ${badgeText}
        </div>
        <h2 style="color: #ffffff; margin-top: 16px; font-size: 24px; font-weight: 900;">
          ₹${Number(amount).toLocaleString('en-IN')} Spent
        </h2>
        <p style="font-size: 13px; color: #94a3b8; margin-top: 4px; font-weight: 600;">
          Category: <strong style="color: #ffffff;">${category || 'General'}</strong>
        </p>
      </div>

      ${
        isIncomeCrossed
          ? `
      <div style="background-color: #ef444415; border: 1px solid #ef4444; border-radius: 16px; padding: 18px; margin-bottom: 24px; text-align: center;">
        <h3 style="color: #f43f5e; margin: 0 0 6px 0; font-size: 16px; font-weight: 900;">⚠️ YOU HAVE CROSSED YOUR MONTHLY INCOME LIMIT!</h3>
        <p style="color: #fca5a5; margin: 0; font-size: 13px; line-height: 1.5;">
          Your total monthly expenses have exceeded your income. Your monthly balance is now in the <strong>negative</strong>.
        </p>
      </div>
      `
          : ''
      }

      <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; text-align: center;">
        Hello <strong style="color: #ffffff;">${userName || 'User'}</strong>,<br/>
        An expense of <strong>₹${Number(amount).toLocaleString('en-IN')}</strong> for <strong>"${description}"</strong> has been recorded.
      </p>

      {/* Transaction Details Box */}
      <div style="background-color: #0d121f; border: 1px solid #1e293b; padding: 20px; border-radius: 18px; margin: 24px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #cbd5e1;">
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Expense Amount:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 800; color: #f43f5e; font-size: 15px;">-₹${Number(amount).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Description:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #ffffff;">${description}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Payment Method:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #818cf8;">${paymentMethod || 'UPI'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Date:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #ffffff;">${formatEmailDate(date)}</td>
          </tr>
        </table>
      </div>

      {/* 📅 Current Month Breakdown Card */}
      <div style="background-color: #0f172a; border: 1px solid #334155; padding: 20px; border-radius: 18px; margin: 20px 0;">
        <h4 style="margin: 0 0 14px 0; color: #38bdf8; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
          📅 Current Month Summary (${monthName || 'This Month'})
        </h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #cbd5e1;">
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">Total Income (চলতি মাসের আয়):</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 800; color: #10b981;">₹${Number(monthlyIncome).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">Total Expenses (চলতি মাসের মোট খরচ):</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 800; color: #f43f5e;">₹${Number(monthlyExpenses).toLocaleString('en-IN')}</td>
          </tr>
          <tr style="border-top: 1px dashed #334155;">
            <td style="padding: 10px 0; color: #ffffff; font-weight: 800;">Monthly Remaining Balance (অবশিষ্ট):</td>
            <td style="padding: 10px 0; text-align: right; font-weight: 900; color: ${monthlyBalance < 0 ? '#f43f5e' : '#10b981'}; font-size: 16px;">
              ${formattedMonthlyBal}
            </td>
          </tr>
        </table>
      </div>

      {/* 💼 Overall Total Account Balance Highlight Banner */}
      <div style="padding: 16px; background-color: #0284c715; border: 1px solid #0284c740; border-radius: 16px; text-align: center; margin-top: 16px;">
        <span style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px;">
          💼 Overall Account Balance (সর্বমোট গচ্ছিত স্থিতি)
        </span>
        <div style="font-size: 22px; font-weight: 900; color: ${overallBalance < 0 ? '#f43f5e' : '#00f2fe'}; margin-top: 4px;">
          ${formattedOverallBal}
        </div>
      </div>

      <div style="text-align: center; margin-top: 30px; border-top: 1px solid #1e293b; padding-top: 20px;">
        <p style="font-size: 11px; color: #475569; margin: 0;">
          ExpensePilot Expense Tracking & Email Alert System
        </p>
      </div>
    </div>
  `;
};

