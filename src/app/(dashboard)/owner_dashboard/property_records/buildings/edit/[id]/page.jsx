"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BuildingForm from "../../../../property_entry/BuildingForm";

export default function EditBuildingPage({ params }) {
  const { id } = params;
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    type: "",
    units_owned: "",
    total_space_sqm: "",
    occupancy_status: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBuilding(id) {
      try {
        const res = await fetch(`/api/owner/buildings?id=${id}`);
        if (!res.ok) throw new Error("Failed to fetch building");

        const data = await res.json();
        console.log("Fetched Building Data:", data);
        setForm(data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBuilding(id);
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Updating building...", form);

    try {
      const res = await fetch(`/api/owner/buildings?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Failed to update building:", error);
        alert("Error: " + (error.message || "Update failed"));
        return;
      }

      // Redirect after successful update
      router.push("/owner_dashboard/property_records");
    } catch (err) {
      console.error("Network or server error:", err);
      alert("An unexpected error occurred.");
    }
  };

  if (loading) return <div className="p-5">Loading...</div>;

  return (
    <div className="content-wrapper">
      <section className="content">
        <div className="container-xxl flex-grow-1 container-p-y">
          <h3>Edit Building {form.name}</h3>
          <form onSubmit={handleSubmit}>
            <BuildingForm form={form} setForm={setForm} />
            <div className="card-footer">
              <button type="submit" className="mt-3 btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
