"use client";

import { useState } from "react";

export default function CSVBulkUpload() {
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
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith(".csv")) {
        setFile(droppedFile);
        setResult(null);
      } else {
        alert("Please upload a CSV file");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/csv-upload/tenant-assignments", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        // Clear file after successful upload
        setFile(null);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setResult({
        success: false,
        message: "Failed to upload file. Please try again.",
        error: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    window.location.href = "/api/csv-template?type=tenant-assignments";
  };

  return (
    <div className="card">
      <div className="card-header">
        <h4 className="card-title">Bulk Create Tenants & Assign to Units</h4>
        <p className="text-muted mb-0">
          Upload a CSV file to create multiple new tenants and assign them to
          units at once
        </p>
      </div>
      <div className="card-body">
        {/* Download Template Button */}
        <div className="mb-4 pt-3">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={downloadTemplate}
          >
            <i className="bx bx-download me-2"></i>
            Download CSV Template
          </button>
          <small className="text-muted ms-3">
            Download the template, fill it with your data, then upload it below
          </small>
        </div>

        {/* File Upload Zone */}
        <div
          className={`border rounded p-4 text-center mb-3 ${
            dragActive ? "border-primary bg-light" : "border-dashed"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{ minHeight: "150px", cursor: "pointer" }}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            style={{ display: "none" }}
            id="csvFileInput"
          />

          {!file ? (
            <label
              htmlFor="csvFileInput"
              style={{ cursor: "pointer", width: "100%" }}
            >
              <div className="py-4">
                <i
                  className="bx bx-cloud-upload"
                  style={{ fontSize: "48px", color: "#666" }}
                ></i>
                <h5 className="mt-3">Drag & Drop CSV file here</h5>
                <p className="text-muted">or click to browse</p>
                <small className="text-muted">
                  Maximum file size: 5MB | Maximum 500 rows
                </small>
              </div>
            </label>
          ) : (
            <div className="py-3">
              <i
                className="bx bx-file"
                style={{ fontSize: "48px", color: "#4CAF50" }}
              ></i>
              <h6 className="mt-2">{file.name}</h6>
              <p className="text-muted mb-2">
                {(file.size / 1024).toFixed(2)} KB
              </p>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => {
                  setFile(null);
                  setResult(null);
                }}
              >
                Remove File
              </button>
            </div>
          )}
        </div>

        {/* Upload Button */}
        {file && !uploading && !result && (
          <div className="text-center mb-3">
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={handleUpload}
            >
              <i className="bx bx-upload me-2"></i>
              Upload & Process CSV
            </button>
          </div>
        )}

        {/* Loading Indicator */}
        {uploading && (
          <div className="alert alert-info">
            <div className="d-flex align-items-center">
              <div
                className="spinner-border spinner-border-sm me-3"
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
              <div>
                <strong>Processing CSV...</strong>
                <p className="mb-0">
                  Please wait while we validate and create tenant assignments
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div
            className={`alert ${
              result.success ? "alert-success" : "alert-danger"
            }`}
          >
            <h5 className="alert-heading">
              {result.success ? "Upload Successful!" : "Upload Failed"}
            </h5>
            <p>{result.message}</p>

            {/* Success Summary */}
            {result.success && (
              <div className="mt-3">
                <p className="mb-2">
                  <strong>Summary:</strong>
                </p>
                <ul className="mb-0">
                  <li>Total Rows: {result.totalRows}</li>
                  <li>
                    Successful Assignments: {result.successfulAssignments}
                  </li>
                  {result.failedAssignments > 0 && (
                    <li className="text-danger">
                      Failed Assignments: {result.failedAssignments}
                    </li>
                  )}
                </ul>

                {result.assignments && result.assignments.length > 0 && (
                  <div className="mt-3">
                    <p>
                      <strong>Created Assignments:</strong>
                    </p>
                    <div
                      className="table-responsive"
                      style={{ maxHeight: "300px", overflowY: "auto" }}
                    >
                      <table className="table table-sm table-bordered">
                        <thead>
                          <tr>
                            <th>Row</th>
                            <th>Tenant</th>
                            <th>Phone</th>
                            <th>Unit</th>
                            <th>Building</th>
                            <th>Start Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.assignments.map((assignment, idx) => (
                            <tr key={idx}>
                              <td>{assignment.row}</td>
                              <td>
                                {assignment.tenant_name} (ID:{" "}
                                {assignment.tenant_id})
                              </td>
                              <td>{assignment.tenant_phone}</td>
                              <td>{assignment.unit_name}</td>
                              <td>{assignment.building_name || "N/A"}</td>
                              <td>{assignment.start_date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error Details */}
            {!result.success && result.errors && result.errors.length > 0 && (
              <div className="mt-3">
                <p className="mb-2">
                  <strong>Errors Found ({result.errors.length}):</strong>
                </p>
                <div
                  className="table-responsive"
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  <table className="table table-sm table-bordered">
                    <thead>
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
                          <td>
                            <code>{error.field}</code>
                          </td>
                          <td>
                            <code>{error.value}</code>
                          </td>
                          <td className="text-danger">{error.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Unit Resolution Info for Duplicate Names */}
                {result.unitResolutionNeeded &&
                  result.unitResolutionNeeded.length > 0 && (
                    <div className="mt-3 alert alert-warning">
                      <h6>Action Required: Duplicate Unit Names</h6>
                      <p>
                        The following unit names exist in multiple buildings.
                        Please update your CSV with more specific unit names or
                        use unique identifiers:
                      </p>
                      {result.unitResolutionNeeded.map((resolution, idx) => (
                        <div key={idx} className="mb-2">
                          <strong>
                            Row {resolution.row}: "{resolution.unit_name}"
                          </strong>
                          <ul>
                            {resolution.options.map((option, optIdx) => (
                              <li key={optIdx}>
                                Building: {option.building_name} (Building ID:{" "}
                                {option.building_id}, Unit ID: {option.unit_id})
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-4">
          <h6>CSV File Requirements:</h6>
          <ul className="text-muted small">
            <li>
              <strong>Required columns:</strong> full_name, phone, unit_name,
              start_date
            </li>
            <li>
              <strong>Optional columns:</strong> email, monthly_rent,
              deposit_paid, lease_terms, notes
            </li>
            <li>
              <strong>Date format:</strong> YYYY-MM-DD (e.g., 2025-01-15)
            </li>
            <li>
              <strong>Numeric fields:</strong> Use numbers only (no currency
              symbols)
            </li>
            <li>
              <strong>Phone numbers:</strong> Must be unique - each tenant needs
              a unique phone number
            </li>
            <li>
              <strong>Unit Names:</strong> Must match existing unit names. If
              duplicate names exist, you'll be asked to clarify which building.
            </li>
            <li>
              <strong>File limits:</strong> Maximum 5MB, 500 rows per upload
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
