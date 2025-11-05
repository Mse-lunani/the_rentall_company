"use client";
import { useState } from "react";

export default function CSVUnitUpload({ buildingId, onSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResult(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleDownloadTemplate = () => {
    window.location.href = `/api/csv-template/units?building_id=${buildingId}`;
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    setUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/csv-upload/units", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);

      if (data.success && onSuccess) {
        onSuccess(data);
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Upload failed: " + error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
  };

  return (
    <div className="csv-unit-upload">
      {/* Download Template Button */}
      <div className="mb-3">
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={handleDownloadTemplate}
        >
          📥 Download CSV Template (Building ID: {buildingId})
        </button>
      </div>

      {/* File Upload Area */}
      <div
        className={`upload-zone border rounded p-4 text-center mb-3 ${
          dragActive ? "bg-light border-primary" : "border-secondary"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {!file ? (
          <>
            <p className="mb-2">Drag and drop your CSV file here, or</p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="form-control"
              style={{ maxWidth: "400px", margin: "0 auto" }}
            />
          </>
        ) : (
          <div>
            <p className="mb-2">
              <strong>Selected file:</strong> {file.name}
            </p>
            <p className="text-muted mb-2">
              Size: {(file.size / 1024).toFixed(2)} KB
            </p>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={handleReset}
            >
              Change File
            </button>
          </div>
        )}
      </div>

      {/* Upload Button */}
      {file && !result && (
        <div className="mb-3">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload CSV"}
          </button>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div
          className={`alert ${
            result.success ? "alert-success" : "alert-danger"
          } mt-3`}
        >
          <h5>{result.message}</h5>

          {result.success && result.units && (
            <div className="mt-3">
              <p>
                <strong>
                  Successfully created {result.successfulUnits} units:
                </strong>
              </p>
              <div
                className="table-responsive"
                style={{ maxHeight: "300px", overflowY: "auto" }}
              >
                <table className="table table-sm table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>Row</th>
                      <th>Unit Name</th>
                      <th>Building</th>
                      <th>Bedrooms</th>
                      <th>Bathrooms</th>
                      <th>Space (sqm)</th>
                      <th>Rent (KES)</th>
                      <th>Deposit (KES)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.units.map((unit, idx) => (
                      <tr key={idx}>
                        <td>{unit.row}</td>
                        <td>{unit.unit_name}</td>
                        <td>{unit.building_name}</td>
                        <td>{unit.bedrooms}</td>
                        <td>{unit.bathrooms}</td>
                        <td>{unit.space_sqm}</td>
                        <td>{unit.rent?.toLocaleString()}</td>
                        <td>{unit.deposit?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!result.success && result.errors && (
            <div className="mt-3">
              <p>
                <strong>Found {result.errorCount} errors:</strong>
              </p>
              <div
                className="table-responsive"
                style={{ maxHeight: "300px", overflowY: "auto" }}
              >
                <table className="table table-sm table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>Row</th>
                      <th>Field</th>
                      <th>Value</th>
                      <th>Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.map((error, idx) => (
                      <tr key={idx}>
                        <td>{error.row}</td>
                        <td>{error.field}</td>
                        <td className="text-break">
                          {error.value || "(empty)"}
                        </td>
                        <td className="text-danger">{error.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {result.success && (
            <button
              type="button"
              className="btn btn-success mt-3"
              onClick={handleReset}
            >
              Upload More Units
            </button>
          )}
        </div>
      )}
    </div>
  );
}
