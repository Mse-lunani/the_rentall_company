// app/(dashboard)/dashboard/components/ChartCard.jsx
export default function ChartCard({ title, children }) {
  return (
    <div className="modern-chart-card">
      <div className="modern-chart-header">
        <h5 className="modern-chart-title">{title}</h5>
      </div>
      <div className="modern-chart-body">
        {children}
      </div>
    </div>
  );
}
