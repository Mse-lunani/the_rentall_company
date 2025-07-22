import Link from "next/link";
import OwnerForm from "./OwnerForm";

export default function AddOwnerPage() {
  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-xxl flex-grow-1 container-p-y">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="mt-3">Add Owner</h1>
            <Link href="/dashboard/owners" className="btn btn-secondary">
              Back to Owners
            </Link>
          </div>
          <OwnerForm />
        </div>
      </section>
    </div>
  );
}