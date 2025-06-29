"use client";
import { useState } from "react";

export default function PasswordForm() {
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) {
      alert("Passwords do not match");
      return;
    }
    alert("Password changed (frontend only)");
  };

  return (
    <div className="card mt-4">
      <div className="card-header">
        <h5 className="card-title">Change Password</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Old Password</label>
            <input
              type="password"
              className="form-control"
              value={oldPwd}
              onChange={(e) => setOldPwd(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label>New Password</label>
            <input
              type="password"
              className="form-control"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label>Confirm Password</label>
            <input
              type="password"
              className="form-control"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
            />
          </div>
          <button className="btn btn-warning" type="submit">
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}
