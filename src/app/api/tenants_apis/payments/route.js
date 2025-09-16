import { sql, requireTenantIdOr401 } from "../_common";

// Function to calculate next due date (5th of month)
function getNextDueDate() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentDay = now.getDate();

  let dueDate;

  if (currentDay <= 5) {
    // If we're before the 5th, due date is this month
    dueDate = new Date(currentYear, currentMonth, 5);
  } else {
    // If we're after the 5th, due date is next month
    dueDate = new Date(currentYear, currentMonth + 1, 5);
  }

  return dueDate;
}

// Function to calculate pro-rated rent for first month
function calculateProRatedRent(startDate, monthlyRent) {
  const start = new Date(startDate);
  const startMonth = start.getMonth();
  const startYear = start.getFullYear();
  const startDay = start.getDate();

  // Get first day of next month
  const nextMonth = new Date(startYear, startMonth + 1, 1);

  // Calculate days from start date to first of next month
  const daysToNextMonth = Math.ceil((nextMonth - start) / (1000 * 60 * 60 * 24));

  // Get total days in the start month
  const totalDaysInMonth = new Date(startYear, startMonth + 1, 0).getDate();

  // Calculate pro-rated rent
  const proRatedRent = (daysToNextMonth / totalDaysInMonth) * monthlyRent;

  return Math.round(proRatedRent * 100) / 100; // Round to 2 decimal places
}

// Function to calculate amount due (including deposit for first month)
function calculateAmountDue(tenancy, hasReceivedAnyPayment) {
  const monthlyRent = Number(tenancy.monthly_rent);
  const depositAmount = tenancy.deposit_paid ? Number(tenancy.deposit_paid) : 0;

  // If this is the first payment ever for this tenancy
  if (!hasReceivedAnyPayment) {
    const proRatedRent = calculateProRatedRent(tenancy.start_date, monthlyRent);
    return depositAmount + proRatedRent;
  }

  // For subsequent months, just the monthly rent
  return monthlyRent;
}

// Function to get payment status
function getPaymentStatus(lastPaymentDate, dueDate, isFirstPayment, startDate) {
  const now = new Date();

  if (!lastPaymentDate) {
    // For first payment (deposit + pro-rated rent), it's due immediately when tenancy starts
    if (isFirstPayment) {
      const tenancyStart = new Date(startDate);
      return now > tenancyStart ? 'overdue' : 'pending';
    }

    // For subsequent payments, use the 5th of month rule
    return now > dueDate ? 'overdue' : 'pending';
  }

  const lastPayment = new Date(lastPaymentDate);
  const dueDateMonth = dueDate.getMonth();
  const dueDateYear = dueDate.getFullYear();
  const lastPaymentMonth = lastPayment.getMonth();
  const lastPaymentYear = lastPayment.getFullYear();

  // Check if payment was made for the current due period
  if (lastPaymentYear === dueDateYear && lastPaymentMonth === dueDateMonth) {
    return 'paid';
  }

  return now > dueDate ? 'overdue' : 'pending';
}

export async function GET(request) {
  const { error, tenantId } = requireTenantIdOr401(request);
  if (error) return error;

  try {
    // Get tenant's active tenancies with payment information
    const activeTenancies = await sql`
      SELECT
        tu.id as tenancy_id,
        tu.monthly_rent,
        tu.start_date,
        tu.deposit_paid,
        u.name as unit_name,
        b.name as building_name,
        MAX(p.date_paid) as last_payment_date,
        COUNT(p.id) as total_payments,
        COALESCE(SUM(p.amount_paid), 0) as total_amount_paid
      FROM tenants_units tu
      JOIN units u ON tu.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      LEFT JOIN payments p ON tu.id = p.tenancy_id
      WHERE tu.tenant_id = ${tenantId} AND tu.occupancy_status = 'active'
      GROUP BY tu.id, tu.monthly_rent, tu.start_date, tu.deposit_paid, u.name, b.name
      ORDER BY tu.start_date DESC
    `;

    // Get all payment history for the tenant
    const paymentHistory = await sql`
      SELECT
        p.*,
        tu.monthly_rent,
        u.name as unit_name,
        b.name as building_name
      FROM payments p
      JOIN tenants_units tu ON p.tenancy_id = tu.id
      JOIN units u ON tu.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE tu.tenant_id = ${tenantId}
      ORDER BY p.date_paid DESC
    `;

    // Calculate payment status and due dates for active tenancies
    const nextDueDate = getNextDueDate();

    const tenancyPaymentStatus = activeTenancies.map(tenancy => {
      const hasReceivedAnyPayment = Number(tenancy.total_payments) > 0;
      const isFirstPayment = !hasReceivedAnyPayment;
      const status = getPaymentStatus(tenancy.last_payment_date, nextDueDate, isFirstPayment, tenancy.start_date);
      const amountDue = calculateAmountDue(tenancy, hasReceivedAnyPayment);

      // Calculate days until due based on payment type
      let daysUntilDue;
      if (isFirstPayment) {
        // First payment is due immediately (from start date)
        const tenancyStart = new Date(tenancy.start_date);
        daysUntilDue = Math.ceil((tenancyStart - new Date()) / (1000 * 60 * 60 * 24));
      } else {
        // Subsequent payments due on 5th of month
        daysUntilDue = Math.ceil((nextDueDate - new Date()) / (1000 * 60 * 60 * 24));
      }

      return {
        ...tenancy,
        next_due_date: isFirstPayment ?
          new Date(tenancy.start_date).toISOString().split('T')[0] :
          nextDueDate.toISOString().split('T')[0],
        payment_status: status,
        amount_due: amountDue,
        monthly_rent_amount: Number(tenancy.monthly_rent),
        deposit_amount: tenancy.deposit_paid ? Number(tenancy.deposit_paid) : 0,
        is_first_payment: isFirstPayment,
        pro_rated_rent: isFirstPayment ? calculateProRatedRent(tenancy.start_date, Number(tenancy.monthly_rent)) : null,
        days_until_due: daysUntilDue
      };
    });

    // Calculate summary statistics
    const summary = {
      total_active_tenancies: activeTenancies.length,
      total_monthly_rent: activeTenancies.reduce((sum, t) => sum + Number(t.monthly_rent), 0),
      total_payments_made: paymentHistory.length,
      total_amount_paid: paymentHistory.reduce((sum, p) => sum + Number(p.amount_paid), 0),
      next_payment_due: nextDueDate.toISOString().split('T')[0],
      overdue_count: tenancyPaymentStatus.filter(t => t.payment_status === 'overdue').length,
      pending_count: tenancyPaymentStatus.filter(t => t.payment_status === 'pending').length,
      paid_count: tenancyPaymentStatus.filter(t => t.payment_status === 'paid').length
    };

    return Response.json({
      activeTenancies: tenancyPaymentStatus,
      paymentHistory,
      summary
    });

  } catch (err) {
    console.error("GET /api/tenants_apis/payments error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}