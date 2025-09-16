"use client";
import { useState } from "react";

export default function MaintenanceForm() {
  const [form, setForm] = useState({
    unit: "",
    description: "",
    cost: "",
    notes: "",
    image: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log("Maintenance Record:", form);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    alert("Maintenance record saved!");
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4">
      <div className="mb-3">
        <label className="form-label">Unit</label>
        <select
          name="unit"
          className="form-control"
          value={form.unit}
          onChange={handleChange}
        >
          <option value="">Select Unit</option>
          <option value="A1">A1</option>
          <option value="A2">A2</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">What is damaged?</label>
        <input
          type="text"
          name="description"
          className="form-control"
          value={form.description}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Cost of Repair (Ksh)</label>
        <input
          type="number"
          name="cost"
          className="form-control"
          value={form.cost}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Notes (Optional)</label>
        <textarea
          name="notes"
          className="form-control"
          rows="3"
          value={form.notes}
          onChange={handleChange}
        ></textarea>
      </div>

      <div className="mb-3">
        <label className="form-label">Upload Image (Optional)</label>
        <input
          type="file"
          name="image"
          className="form-control"
          onChange={handleChange}
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Maintenance Record'}
      </button>
    </form>
  );
}
