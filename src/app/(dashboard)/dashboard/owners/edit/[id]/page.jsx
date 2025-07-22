"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import OwnerForm from "../../add/OwnerForm";
import Link from "next/link";

export default function EditOwnerPage() {
  const params = useParams();
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/owners?id=${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          setOwner(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch owner:", err);
          setLoading(false);
        });
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-xxl flex-grow-1 container-p-y">
            <p>Loading...</p>
          </div>
        </section>
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-xxl flex-grow-1 container-p-y">
            <p>Owner not found</p>
            <Link href="/dashboard/owners" className="btn btn-secondary">
              Back to Owners
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-xxl flex-grow-1 container-p-y">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="mt-3">Edit Owner</h1>
            <Link href="/dashboard/owners" className="btn btn-secondary">
              Back to Owners
            </Link>
          </div>
          <OwnerForm initialData={owner} />
        </div>
      </section>
    </div>
  );
}