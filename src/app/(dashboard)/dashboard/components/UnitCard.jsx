// src/app/dashboard/components/UnitCard.jsx
import Link from "next/link";

export default function UnitCard({ unit }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{unit.name}</h3>
        <div className="card-tools">
          <span className="badge bg-info">{unit.type}</span>
          {unit.hasDSQ && <span className="badge bg-warning ms-1">DSQ</span>}
        </div>
      </div>
      <div className="card-body">
        <p>
          <strong>Building:</strong> {unit.building || "Standalone"}
        </p>
        <p>
          <strong>Area:</strong> {unit.squareMeters} m²
        </p>
        <p>
          <strong>Floor:</strong> {unit.floorNumber || "N/A"}
        </p>
        <p>
          <strong>Bathrooms:</strong> {unit.bathrooms}
        </p>
        <p>
          <strong>Rent:</strong> ${unit.rentAmount}/month
        </p>
        <div className="mt-2">
          {unit.amenities.map((amenity, index) => (
            <span key={index} className="badge bg-light text-dark me-1">
              {amenity}
            </span>
          ))}
        </div>
      </div>
      <div className="card-footer">
        <Link
          href={`/dashboard/units/${unit.id}`}
          className="btn btn-sm btn-primary"
        >
          View Details
        </Link>
        <Link
          href={`/dashboard/units/${unit.id}/edit`}
          className="btn btn-sm btn-secondary ms-2"
        >
          Edit
        </Link>
      </div>
    </div>
  );
}
