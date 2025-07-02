// app/(dashboard)/dashboard/components/ChartCard.jsx
import { Card } from "react-bootstrap";

export default function ChartCard({ title, children }) {
  return (
    <Card className="mb-4">
      <Card.Header>
        <Card.Title>{title}</Card.Title>
      </Card.Header>
      <Card.Body>{children}</Card.Body>
    </Card>
  );
}
