import MaintenanceForm from "./MaintenanceForm";

export default function AddMaintenancePage() {
  return (
    <div className="content-wrapper">
      <section className="content">
        <div className="container-xxl flex-grow-1 container-p-y">
          <h4 className="mb-4">Add Maintenance Record</h4>
          <MaintenanceForm />
        </div>
      </section>
    </div>
  );
}
