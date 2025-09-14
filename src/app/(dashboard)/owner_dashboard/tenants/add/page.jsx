import TenantForm from "./TenantForm";

export default function AddTenantPage() {
  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-xxl flex-grow-1 container-p-y">
          <h1 className="mt-3">Add Tenant</h1>
          <TenantForm />
        </div>
      </section>
    </div>
  );
}
