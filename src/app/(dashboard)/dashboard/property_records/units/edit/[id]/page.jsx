"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UnitForm from "../../../../property_entry/UnitForm";

export default function EditUnitPage({ params }) {
  const { id } = params;
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    bedrooms: "",
    bathrooms: "",
    floor_number: "",
    rent_amount_kes: "",
    deposit_amount_kes: "",
    amenities: "",
    has_dsq: false,
    space_sqm: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUnit() {
      try {
        const res = await fetch(`/api/units?id=${id}`);
        if (!res.ok) throw new Error("Failed to fetch unit");

        const data = await res.json();
        console.log("Fetched unit data:", data);
        setForm(data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUnit();
  }, [id]);

  const handleChange = (updatedForm) => {
    setForm(updatedForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Updating unit...", form);

    try {
      const res = await fetch(`/api/units?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Failed to update unit:", error);
        alert("Error: " + (error.message || "Update failed"));
        return;
      }

      router.push("/dashboard/property_records");
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
          <h3>Edit Unit {form.name}</h3>
          <form onSubmit={handleSubmit}>
            <UnitForm
              index={0}
              data={form}
              onChange={handleChange}
              removable={false}
            />
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
