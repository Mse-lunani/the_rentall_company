"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function PaymentTypesPage() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [owners, setOwners] = useState([]);

  useEffect(() => {
    fetchTypes();
    fetchOwners();
  }, []);

  const fetchTypes = async () => {
    try {
      const res = await fetch("/api/payment_types");
      if (res.ok) {
        const data = await res.json();
        setTypes(data || []);
      } else {
        console.error("Failed to load payment types", await res.text());
      }
    } catch (err) {
      console.error("Failed to fetch payment types:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async () => {
    try {
      const res = await fetch("/api/owners");
      if (res.ok) {
        const data = await res.json();
        setOwners(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch owners:", err);
    }
  };

  return (
    <div className="content-wrapper">
      <section className="content">
        <div className="container-xxl flex-grow-1 container-p-y">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">Payment Types</h4>
            <div>
              <Link
                href="/dashboard/payment_types/add"
                className="btn btn-primary me-2"
              >
                Add Payment Type
              </Link>
              <button
                className="btn btn-outline-secondary"
                onClick={fetchTypes}
                disabled={loading}
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              {loading ? (
                <p>Loading...</p>
              ) : types.length === 0 ? (
                <div className="text-center py-4">
                  <p className="mb-2">No payment types found.</p>
                  <Link
                    href="/dashboard/payment_types/add"
                    className="btn btn-primary"
                  >
                    Create one
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Owner ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {types.map((t, i) => (
                        <tr key={t.id}>
                          <td>{i + 1}</td>
                          <td>{t.name}</td>
                          <td>{t.type}</td>
                          <td>
                            {t.amount !== null && t.amount !== undefined
                              ? `Ksh ${Number(t.amount).toLocaleString()}`
                              : "—"}
                          </td>
                            <td>{
                              t.owner_id
                                ? (owners.find((o) => o.id === t.owner_id)?.full_name || "—")
                                : "—"
                            }</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
