"use client";
import { useState } from "react";

export default function MaintenanceTable() {
  const [records] = useState([
    {
      id: 1,
      unit: "A1",
      description: "Leaking pipe",
      cost: 3000,
      notes: "Urgent fix",
      image: null,
      date: "2025-06-29",
    },
    {
      id: 2,
      unit: "B2",
      description: "Broken window",
      cost: 1500,
      notes: "",
      image: null,
      date: "2025-06-27",
    },
  ]);

  return (
    <div className="card p-3">
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Unit</th>
            <th>Description</th>
            <th>Cost (Ksh)</th>
            <th>Date</th>
            <th>Notes</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody>
          {records.map((item) => (
            <tr key={item.id}>
              <td>{item.unit}</td>
              <td>{item.description}</td>
              <td>{item.cost}</td>
              <td>{item.date}</td>
              <td>{item.notes}</td>
              <td>
                {item.image ? (
                  <img src={URL.createObjectURL(item.image)} width="60" />
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
