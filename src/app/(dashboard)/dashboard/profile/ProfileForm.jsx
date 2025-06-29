// src/app/dashboard/profile/ProfileForm.jsx
"use client";
import { useState } from "react";

export default function ProfileForm() {
  const [name, setName] = useState("Michael Se-lunani");
  const [email, setEmail] = useState("admin@example.com");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Profile updated (frontend only)");
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title">Edit Profile</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Name</label>
            <input
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label>Email</label>
            <input
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
