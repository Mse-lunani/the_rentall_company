import Link from "next/link";
import BuildingForm from "../../components/BuildingForm";

export default function AddBuildingPage() {
  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-xxl flex-grow-1 container-p-y">
          <div className="row mb-2 justify-content-end">
            <div className="col-sm-10">
              <h4>Add New Building</h4>
            </div>
            <div className="col-sm-2">
              <Link
                href="/dashboard/buildings"
                className="btn btn-secondary float-right"
              >
                <i className="fas fa-arrow-left"></i> Back
              </Link>
            </div>
          </div>
          <div className="row">
            <div className="col-md-8 mx-auto">
              <BuildingForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
