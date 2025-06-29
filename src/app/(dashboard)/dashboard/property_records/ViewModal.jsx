"use client";
import { useEffect, useRef } from "react";

export default function ViewModal({ data, type }) {
  const modalRef = useRef();

  useEffect(() => {
    if (data && modalRef.current) {
      const modal = new Modal(modalRef.current);
      modal.show();
    }
  }, [data]);

  if (!data) return null;

  const renderFields = () => {
    return Object.entries(data).map(([key, value]) => (
      <tr key={key}>
        <th style={{ textTransform: "capitalize" }}>
          {key.replace(/_/g, " ")}
        </th>
        <td>{typeof value === "boolean" ? (value ? "Yes" : "No") : value}</td>
      </tr>
    ));
  };

  return (
    <div className="modal fade" ref={modalRef} tabIndex="-1">
      <div className="modal-dialog modal-dialog-scrollable modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">View {type} Details</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <table className="table table-bordered">
              <tbody>{renderFields()}</tbody>
            </table>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" data-bs-dismiss="modal">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
