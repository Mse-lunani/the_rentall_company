// app/(dashboard)/dashboard/page.jsx
"use client";
import { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { Bar, Line } from "react-chartjs-2";
import "./styles/charts.css";
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
        borderColor: "rgba(102, 126, 234, 1)",
        backgroundColor: "linear-gradient(180deg, rgba(102, 126, 234, 0.3) 0%, rgba(102, 126, 234, 0.05) 100%)",
        borderWidth: 3,
        pointBackgroundColor: "#667eea",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: "#667eea",
        pointHoverBorderColor: "#ffffff",
        pointHoverBorderWidth: 4,
        tension: 0.4,
        fill: true,
        gradient: true,
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
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: "rgba(16, 185, 129, 0.9)",
        hoverBorderColor: "rgba(16, 185, 129, 1)",
        hoverBorderWidth: 3,
      },
      {
        label: "Vacant Units",
        data: kpis.occupancyData.map((item) => item.vacant),
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: "rgba(239, 68, 68, 0.9)",
        hoverBorderColor: "rgba(239, 68, 68, 1)",
        hoverBorderWidth: 3,
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
                <div style={{ height: '400px' }}>
                  <Line
                  data={monthlyPaymentsData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                      mode: 'index',
                      intersect: false,
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#667eea',
                        borderWidth: 2,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                          label: function (context) {
                            return `Ksh ${context.raw.toLocaleString()}`;
                          },
                        },
                      },
                    },
                    scales: {
                      x: {
                        grid: {
                          display: false,
                        },
                        ticks: {
                          color: '#64748b',
                          font: {
                            size: 12,
                            weight: '500',
                          },
                        },
                      },
                      y: {
                        grid: {
                          color: 'rgba(148, 163, 184, 0.1)',
                          lineWidth: 1,
                        },
                        ticks: {
                          color: '#64748b',
                          font: {
                            size: 12,
                            weight: '500',
                          },
                          callback: function (value) {
                            return `Ksh ${value.toLocaleString()}`;
                          },
                        },
                      },
                    },
                  }}
                  />
                </div>
              </ChartCard>
            </div>

            <div className="col-lg-6 mb-4">
              <ChartCard title="Unit Occupancy by Building">
                <div style={{ height: '400px' }}>
                  <Bar
                  data={occupancyData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top",
                        labels: {
                          usePointStyle: true,
                          pointStyle: 'circle',
                          color: '#64748b',
                          font: {
                            size: 12,
                            weight: '500',
                          },
                          padding: 20,
                        },
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#667eea',
                        borderWidth: 2,
                        cornerRadius: 8,
                        displayColors: true,
                        usePointStyle: true,
                      },
                    },
                    scales: {
                      x: {
                        stacked: true,
                        grid: {
                          display: false,
                        },
                        ticks: {
                          color: '#64748b',
                          font: {
                            size: 12,
                            weight: '500',
                          },
                        },
                      },
                      y: {
                        stacked: true,
                        grid: {
                          color: 'rgba(148, 163, 184, 0.1)',
                          lineWidth: 1,
                        },
                        ticks: {
                          color: '#64748b',
                          font: {
                            size: 12,
                            weight: '500',
                          },
                          stepSize: 1,
                        },
                      },
                    },
                  }}
                  />
                </div>
              </ChartCard>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
