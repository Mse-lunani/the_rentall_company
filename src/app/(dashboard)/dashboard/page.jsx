import React from "react";

const DashboardPage = () => {
  // Mock data generation
  const generateMockData = () => {
    const properties = [
      { id: 1, name: "Sunrise Apartments", units: 12 },
      { id: 2, name: "Downtown Lofts", units: 8 },
      { id: 3, name: "Hillside Villas", units: 6 },
    ];

    const units = [
      ...properties.flatMap((property) =>
        Array.from({ length: property.units }, (_, i) => ({
          id: `${property.id}-${i + 1}`,
          propertyId: property.id,
          propertyName: property.name,
          unitNumber: `${property.name.split(" ")[0][0]}${i + 1}`,
          rent: 800 + Math.floor(Math.random() * 700),
          occupied: Math.random() > 0.3,
          tenant:
            Math.random() > 0.3
              ? `Tenant ${Math.floor(Math.random() * 100)}`
              : null,
        }))
      ),
      // Standalone units (not in buildings)
      ...Array.from({ length: 5 }, (_, i) => ({
        id: `standalone-${i + 1}`,
        propertyId: null,
        propertyName: "Private Unit",
        unitNumber: `SU${i + 1}`,
        rent: 1200 + Math.floor(Math.random() * 800),
        occupied: Math.random() > 0.4,
        tenant:
          Math.random() > 0.4
            ? `Tenant ${Math.floor(Math.random() * 100)}`
            : null,
      })),
    ];

    const occupiedUnits = units.filter((unit) => unit.occupied);
    const totalMonthlyRent = occupiedUnits.reduce(
      (sum, unit) => sum + unit.rent,
      0
    );

    // Calculate KPIs
    return {
      totalProperties: properties.length,
      totalUnits: units.length,
      occupiedUnits: occupiedUnits.length,
      vacancyRate: ((units.length - occupiedUnits.length) / units.length) * 100,
      totalMonthlyRent,
      averageRent: totalMonthlyRent / occupiedUnits.length || 0,
      rentCollectionRate: 85 + Math.floor(Math.random() * 15), // 85-99%
      recentPayments: occupiedUnits
        .filter(() => Math.random() > 0.4) // Random selection
        .slice(0, 5)
        .map((unit) => ({
          unit: unit.unitNumber,
          tenant: unit.tenant,
          amount: unit.rent,
          date: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000)
            .toISOString()
            .split("T")[0],
          status: ["Paid", "Pending", "Late"][Math.floor(Math.random() * 3)],
        })),
    };
  };

  const {
    totalProperties,
    totalUnits,
    occupiedUnits,
    vacancyRate,
    totalMonthlyRent,
    averageRent,
    rentCollectionRate,
    recentPayments,
  } = generateMockData();

  // KPI Cards Data
  const kpis = [
    {
      title: "Total Properties",
      value: totalProperties,
      icon: "fa-building",
      color: "info",
    },
    {
      title: "Total Units",
      value: totalUnits,
      icon: "fa-home",
      color: "success",
    },
    {
      title: "Occupancy Rate",
      value: `${((occupiedUnits / totalUnits) * 100).toFixed(1)}%`,
      icon: "fa-bed",
      color: "primary",
    },
    {
      title: "Vacancy Rate",
      value: `${vacancyRate.toFixed(1)}%`,
      icon: "fa-door-open",
      color: "warning",
    },
    {
      title: "Monthly Rent",
      value: `$${totalMonthlyRent.toLocaleString()}`,
      icon: "fa-dollar-sign",
      color: "dark",
    },
    {
      title: "Avg. Unit Rent",
      value: `$${Math.round(averageRent)}`,
      icon: "fa-chart-line",
      color: "secondary",
    },
    {
      title: "Rent Collection",
      value: `${rentCollectionRate}%`,
      icon: "fa-percentage",
      color: rentCollectionRate > 90 ? "success" : "danger",
    },
  ];

  return (
    <div className="content-wrapper">
      {/* Content Header */}
      <section className="content-header">
        <div className="container-xxl flex-grow-1 container-p-y">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Dashboard</h1>
            </div>
          </div>
          {/* KPI Cards */}
          <div className="row">
            {kpis.map((kpi, index) => (
              <div className="col-lg-4 col-md-6 col-sm-6 mb-4" key={index}>
                <div className="stat-card">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div className="card-info">
                        <h6 className={`card-text text-${kpi.color}`}>
                          {kpi.title}
                        </h6>
                        <div className="d-flex align-items-end mb-2">
                          <h4 className="card-title mb-0 me-2">{kpi.value}</h4>
                        </div>
                        <small>
                          <a className={`view-more text-${kpi.color}`} href="#">
                            View details <i className="fas fa-chevron-right" />
                          </a>
                        </small>
                      </div>
                      <div className={`card-icon bg-label-${kpi.color}`}>
                        <i className={`fas ${kpi.icon}`} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Payments */}
          <div className="row">
            <div className="col-md-8">
              <div className="card">
                <div className="card-header border-transparent">
                  <h3 className="card-title">Recent Payments</h3>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table m-0">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Unit</th>
                          <th>Tenant</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentPayments.map((payment, index) => (
                          <tr key={index}>
                            <td>{payment.date}</td>
                            <td>{payment.unit}</td>
                            <td>{payment.tenant}</td>
                            <td>${payment.amount}</td>
                            <td>
                              <span
                                className={`badge ${
                                  payment.status === "Paid"
                                    ? "bg-success"
                                    : payment.status === "Pending"
                                    ? "bg-warning"
                                    : "bg-danger"
                                }`}
                              >
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="card-footer clearfix">
                  <a href="#" className="btn btn-sm btn-secondary float-right">
                    View All Payments
                  </a>
                </div>
              </div>
            </div>

            {/* Property Distribution */}
            <div className="col-md-4">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Portfolio Distribution</h3>
                </div>
                <div className="card-body">
                  <div className="progress mt-3 mb-3">
                    <div
                      className="progress-bar bg-success"
                      style={{ width: "70%" }}
                    >
                      <span className="sr-only">70% Occupied</span>
                    </div>
                    <div
                      className="progress-bar bg-danger"
                      style={{ width: "30%" }}
                    >
                      <span className="sr-only">30% Vacant</span>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>
                      <i className="fas fa-square text-success" /> Occupied
                      <br />
                      <strong>{occupiedUnits} units</strong>
                    </span>
                    <span>
                      <i className="fas fa-square text-danger" /> Vacant
                      <br />
                      <strong>{totalUnits - occupiedUnits} units</strong>
                    </span>
                  </div>
                  <hr />
                  <div className="text-center">
                    <p className="mb-1">
                      <i className="fas fa-chart-pie mr-1" /> Portfolio Value
                    </p>
                    <h2>
                      $
                      {((totalMonthlyRent * 12) / 0.07).toLocaleString(
                        undefined,
                        { maximumFractionDigits: 0 }
                      )}
                    </h2>
                    <p className="text-muted">Estimated at 7% cap rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
