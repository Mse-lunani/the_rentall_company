// src/app/dashboard/components/BuildingCard.jsx
import Link from "next/link";

export default function BuildingCard({ building }) {
  const statusColors = {
    "Fully Occupied": "success",
    "Partially Occupied": "warning",
    Vacant: "danger",
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{building.name}</h3>
        <div className="card-tools">
          <span
            className={`badge bg-${statusColors[building.occupancyStatus]}`}
          >
            {building.occupancyStatus}
          </span>
        </div>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-6">
            <p>
              <strong>Type:</strong> {building.type}
            </p>
            <p>
              <strong>Units Owned:</strong> {building.unitsOwned}
            </p>
          </div>
          <div className="col-6">
            <p>
              <strong>Area:</strong> {building.squareMeters} m²
            </p>
            <p>
              <strong>Status:</strong>
              <span
                className={`text-${
                  statusColors[building.occupancyStatus]
                } ms-1`}
              >
                {building.occupancyStatus}
              </span>
            </p>
          </div>
        </div>
      </div>
      <div className="card-footer">
        <Link
          href={`/dashboard/buildings/${building.id}`}
          className="btn btn-sm btn-primary"
        >
          View Details
        </Link>
        <Link
          href={`/dashboard/buildings/${building.id}/edit`}
          className="btn btn-sm btn-secondary ms-2"
        >
          Edit
        </Link>
      </div>
    </div>
  );
}
