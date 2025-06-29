"use client";
import { useState } from "react";
import ViewModal from "./ViewModal";

const fakeBuildings = [
  {
    id: 1,
    name: "Sky View Towers",
    type: "Apartment",
    units: 12,
    space: 3500,
    occupancy: "Partially Occupied",
  },
  {
    id: 2,
    name: "Green Villas",
    type: "Bungalow",
    units: 5,
    space: 1800,
    occupancy: "Fully Occupied",
  },
];

export default function BuildingTable() {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Building Records</h3>
        </div>
        <div className="card-body table-responsive">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Type</th>
                <th>Units</th>
                <th>Space (sqm)</th>
                <th>Occupancy</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fakeBuildings.map((b, i) => (
                <tr key={b.id}>
                  <td>{i + 1}</td>
                  <td>{b.name}</td>
                  <td>{b.type}</td>
                  <td>{b.units}</td>
                  <td>{b.space}</td>
                  <td>{b.occupancy}</td>
                  <td>
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => setSelected(b)}
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

      <ViewModal data={selected} type="Building" />
    </>
  );
}
