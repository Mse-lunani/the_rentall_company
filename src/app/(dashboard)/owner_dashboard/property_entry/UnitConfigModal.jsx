"use client";
import { useState, useEffect } from "react";

export default function UnitConfigModal({ show, onClose, onGenerate, total }) {
  const [config, setConfig] = useState({
    prefix: "A",
    start: 1,
    bedrooms: 1,
    bathrooms: 1,
    floor_strategy: "increment",
    rent: 20000,
    deposit: 20000,
    has_dsq: false,
    space_sqm: 30,
  });

  useEffect(() => {
    const modal = document.getElementById("unitConfigModal");
    if (show) {
      new window.bootstrap.Modal(modal).show();
    } else {
      const instance = window.bootstrap.Modal.getInstance(modal);
      instance?.hide();
    }
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig({ ...config, [name]: value });
  };

  const handleSubmit = () => {
    const generated = [];
    for (let i = 0; i < total; i++) {
      const number = parseInt(config.start) + i;
      generated.push({
        name: `${config.prefix}${number}`,
        bedrooms: parseInt(config.bedrooms),
        bathrooms: parseInt(config.bathrooms),
        floor_number:
          config.floor_strategy === "increment" ? i : parseInt(config.start),
        rent_amount_kes: parseFloat(config.rent),
        deposit_amount_kes: parseFloat(config.deposit),
        amenities: "",
        has_dsq: config.has_dsq,
        space_sqm: parseFloat(config.space_sqm),
      });
    }
    onGenerate(generated);
    onClose();
  };

  return (
    <div
      className="modal fade"
      id="unitConfigModal"
      tabIndex="-1"
      aria-labelledby="unitConfigModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="unitConfigModalLabel">
              Configure Units
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {[
              { label: "Unit Name Prefix", name: "prefix" },
              { label: "Starting Number", name: "start", type: "number" },
              { label: "Bedrooms", name: "bedrooms", type: "number" },
              { label: "Bathrooms", name: "bathrooms", type: "number" },
              { label: "Rent Amount", name: "rent", type: "number" },
              { label: "Deposit Amount", name: "deposit", type: "number" },
              { label: "Space (sqm)", name: "space_sqm", type: "number" },
            ].map((field) => (
              <div className="form-group mb-2" key={field.name}>
                <label>{field.label}</label>
                <input
                  className="form-control"
                  name={field.name}
                  type={field.type || "text"}
                  value={config[field.name]}
                  onChange={handleChange}
                />
              </div>
            ))}
            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                name="has_dsq"
                id="has_dsq"
                checked={config.has_dsq}
                onChange={(e) =>
                  setConfig({ ...config, has_dsq: e.target.checked })
                }
              />
              <label className="form-check-label" htmlFor="has_dsq">
                DSQ Available for all units
              </label>
            </div>
            <div className="form-group">
              <label>Floor Strategy</label>
              <select
                className="form-control"
                name="floor_strategy"
                value={config.floor_strategy}
                onChange={handleChange}
              >
                <option value="increment">Increment</option>
                <option value="static">Same Floor</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              Generate Units
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
