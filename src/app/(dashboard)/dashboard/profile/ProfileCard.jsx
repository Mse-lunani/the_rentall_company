"use client";
import { useState } from "react";

export default function ProfileCard() {
  const [image, setImage] = useState(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="card card-primary card-outline shadow-sm">
      <div className="card-body box-profile text-center">
        <div className="position-relative d-inline-block mb-3">
          <img
            src={
              image ||
              "https://ui-avatars.com/api/?name=Michael+Se-lunani&background=0D8ABC&color=fff"
            }
            alt="User profile"
            className="img-fluid rounded-circle border border-3 border-primary"
            style={{ width: 120, height: 120, objectFit: "cover" }}
          />
        </div>
        <h4 className="profile-username text-primary mt-2">
          Michael Se-lunani
        </h4>
        <p className="text-muted mb-3">Admin</p>

        <label className="form-label fw-bold">Change Profile Picture</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="form-control"
        />
      </div>
    </div>
  );
}
