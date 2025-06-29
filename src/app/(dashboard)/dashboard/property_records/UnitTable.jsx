"use client";
import { useState } from "react";
import ViewModal from "./ViewModal";

const fakeUnits = [
  {
    id: 1,
    name: "Unit A3",
    bedrooms: 2,
    bathrooms: 1,
    dsq: true,
    floor: 3,
    rent: 25000,
    deposit: 25000,
    space: 85,
    amenities: "WiFi, Parking",
    building: "Sky View Towers",
  },
  {
    id: 2,
    name: "Unit B2",
    bedrooms: 1,
    bathrooms: 1,
    dsq: false,
    floor: 1,
    rent: 15000,
    deposit: 15000,
    space: 45,
    amenities: "Balcony",
    building: "Standalone",
  },
];

export default function UnitTable() {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <div className="card mt-4">
        <div className="card-header">
          <h3 className="card-title">Unit Records</h3>
        </div>
        <div className="card-body table-responsive">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Unit</th>
                <th>Bedrooms</th>
                <th>Bathrooms</th>
                <th>DSQ</th>
                <th>Floor</th>
                <th>Rent</th>
                <th>Deposit</th>
                <th>Space</th>
                <th>Building</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fakeUnits.map((u, i) => (
                <tr key={u.id}>
                  <td>{i + 1}</td>
                  <td>{u.name}</td>
                  <td>{u.bedrooms}</td>
                  <td>{u.bathrooms}</td>
                  <td>{u.dsq ? "Yes" : "No"}</td>
                  <td>{u.floor}</td>
                  <td>{u.rent.toLocaleString()}</td>
                  <td>{u.deposit.toLocaleString()}</td>
                  <td>{u.space}</td>
                  <td>{u.building}</td>
                  <td>
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => setSelected(u)}
                    >
                      View
                    </button>{" "}
                    <button className="btn btn-warning btn-sm">Edit</button>{" "}
                    <button className="btn btn-danger btn-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ViewModal data={selected} type="Unit" />
    </>
  );
}
