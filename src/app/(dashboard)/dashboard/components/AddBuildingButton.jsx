// src/app/dashboard/components/AddBuildingButton.jsx
"use client";

import { useRouter } from "next/navigation";

export default function AddBuildingButton() {
  const router = useRouter();

  return (
    <button
      className="btn btn-primary float-right"
      onClick={() => router.push("/dashboard/buildings/add")}
    >
      <i className="fas fa-plus"></i> Add Building
    </button>
  );
}
