/**
 * HTML Email Templates for ExpensePilot / Smart Khata
 * Note: Unused routine transaction templates removed to maintain clean codebase.
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

// 2. Expense Summary & Income Exceeded Alert Template
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

      <div style="background-color: #0f172a; border: 1px solid #334155; padding: 20px; border-radius: 18px; margin: 20px 0;">
        <h4 style="margin: 0 0 14px 0; color: #38bdf8; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
          📅 Current Month Summary (${monthName || 'This Month'})
        </h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #cbd5e1;">
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">Total Income:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 800; color: #10b981;">₹${Number(monthlyIncome).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">Total Expenses:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 800; color: #f43f5e;">₹${Number(monthlyExpenses).toLocaleString('en-IN')}</td>
          </tr>
          <tr style="border-top: 1px dashed #334155;">
            <td style="padding: 10px 0; color: #ffffff; font-weight: 800;">Monthly Remaining Balance:</td>
            <td style="padding: 10px 0; text-align: right; font-weight: 900; color: ${monthlyBalance < 0 ? '#f43f5e' : '#10b981'}; font-size: 16px;">
              ${formattedMonthlyBal}
            </td>
          </tr>
        </table>
      </div>

      <div style="padding: 16px; background-color: #0284c715; border: 1px solid #0284c740; border-radius: 16px; text-align: center; margin-top: 16px;">
        <span style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px;">
          💼 Overall Account Balance
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
