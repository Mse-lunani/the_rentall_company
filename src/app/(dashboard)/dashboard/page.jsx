// app/(dashboard)/dashboard/page.jsx
"use client";
import { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import ChartCard from "./components/ChartCard";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function DashboardPage() {
  const [kpis, setKpis] = useState(null);

  useEffect(() => {
    async function fetchKPIs() {
      try {
        const res = await fetch("/api/kpis");
        const data = await res.json();
        setKpis(data);
      } catch (err) {
        console.error("Failed to fetch KPIs", err);
      }
    }
    fetchKPIs();
  }, []);

  if (!kpis) {
    return (
      <div className="content-wrapper">
        <div className="container-xxl flex-grow-1 container-p-y">
          <h4>Loading dashboard...</h4>
        </div>
      </div>
    );
  }

  // Monthly Payments Line Chart Data
  const monthlyPaymentsData = {
    labels: kpis.monthlyPayments.map((item) =>
      new Date(item.month).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    ),
    datasets: [
      {
        label: "Monthly Payments",
        data: kpis.monthlyPayments.map((item) => item.total),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
        fill: true,
      },
    ],
  };

  // Occupancy Bar Chart Data
  const occupancyData = {
    labels: kpis.occupancyData.map((item) => item.building),
    datasets: [
      {
        label: "Occupied Units",
        data: kpis.occupancyData.map((item) => item.occupied),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
      {
        label: "Vacant Units",
        data: kpis.occupancyData.map((item) => item.vacant),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  const kpiCards = [
    {
      title: "Total Tenants",
      value: kpis.totalTenants,
      icon: "fa-users",
      color: "info",
    },
    {
      title: "Payments (This Month)",
      value: `Ksh ${Number(kpis.totalPayments).toLocaleString()}`,
      icon: "fa-money-bill-wave",
      color: "success",
    },
    {
      title: "Units Occupied",
      value: kpis.occupiedUnits,
      icon: "fa-door-closed",
      color: "primary",
    },
    {
      title: "Maintenance Logs",
      value: kpis.totalMaintenance,
      icon: "fa-tools",
      color: "danger",
    },
  ];

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-xxl flex-grow-1 container-p-y">
          <h1>Dashboard</h1>

          {/* KPI Cards */}
          <div className="row mb-4">
            {kpiCards.map((kpi, idx) => (
              <div className="col-lg-3 col-md-6 mb-4" key={idx}>
                <Card className={`border-left-${kpi.color} shadow h-100 py-2`}>
                  <Card.Body>
                    <div className="row no-gutters align-items-center">
                      <div className="col mr-2">
                        <div
                          className={`text-xs font-weight-bold text-${kpi.color} text-uppercase mb-1`}
                        >
                          {kpi.title}
                        </div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                          {kpi.value}
                        </div>
                      </div>
                      <div className="col-auto">
                        <i className={`fas ${kpi.icon} fa-2x text-gray-300`} />
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="row">
            <div className="col-lg-6 mb-4">
              <ChartCard title="Monthly Payments Trend">
                <Line
                  data={monthlyPaymentsData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            return `Ksh ${context.raw.toLocaleString()}`;
                          },
                        },
                      },
                    },
                    scales: {
                      y: {
                        ticks: {
                          callback: function (value) {
                            return `Ksh ${value.toLocaleString()}`;
                          },
                        },
                      },
                    },
                  }}
                />
              </ChartCard>
            </div>

            <div className="col-lg-6 mb-4">
              <ChartCard title="Unit Occupancy by Building">
                <Bar
                  data={occupancyData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                    },
                    scales: {
                      x: {
                        stacked: true,
                      },
                      y: {
                        stacked: true,
                      },
                    },
                  }}
                />
              </ChartCard>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
