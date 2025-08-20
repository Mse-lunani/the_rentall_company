"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import UnitForm from "../../../../property_entry/UnitForm";

export default function EditUnitPage({ params }) {
  const { id } = use(params);
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
    owner_id: "",
  });

  const [loading, setLoading] = useState(true);
  const [owners, setOwners] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch unit data
        const unitRes = await fetch(`/api/units?id=${id}`);
        if (!unitRes.ok) throw new Error("Failed to fetch unit");
        const unitData = await unitRes.json();
        console.log("Fetched unit data:", unitData);
        setForm(unitData);

        // Fetch owners
        const ownersRes = await fetch("/api/owners");
        if (ownersRes.ok) {
          const ownersData = await ownersRes.json();
          setOwners(ownersData || []);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleChange = (updatedForm) => {
    setForm(updatedForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Updating unit...", form);

    // Prepare form data, converting empty owner_id to null
    const formData = {
      ...form,
      owner_id: form.owner_id === "" ? null : parseInt(form.owner_id) || null,
    };

    try {
      const res = await fetch(`/api/units?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Failed to update unit:", error);
        alert("Error: " + (error.message || "Update failed"));
        return;
      }

      alert("Unit updated successfully!");
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
            {/* Owner Assignment Section */}
            <div className="card card-secondary mt-3 mb-3">
              <div className="card-header">
                <h3 className="card-title">Owner Assignment (Optional)</h3>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label>Select Owner (Optional)</label>
                  <select
                    name="owner_id"
                    className="form-control"
                    value={form.owner_id || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        owner_id: e.target.value,
                      })
                    }
                  >
                    <option value="">No Owner Assigned</option>
                    {owners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.full_name} - {owner.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

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
