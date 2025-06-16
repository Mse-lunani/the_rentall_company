// src/app/dashboard/page-2/page.jsx
import React from "react";

export default function Page2() {
  return (
    <main className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        <h4 className="fw-bold py-3 mb-4">Page 2</h4>

        <div className="card">
          <div className="card-body">
            <h3 className="card-title">This is Sample Page 2</h3>
            <p>
              You can put any content here—tables, forms, charts, etc. This page
              is automatically wrapped by your DashboardLayout (Sidebar, Navbar,
              Footer).
            </p>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Foo</td>
                  <td>Foo’s description</td>
                </tr>
                <tr>
                  <td>Bar</td>
                  <td>Bar’s description</td>
                </tr>
                <tr>
                  <td>Baz</td>
                  <td>Baz’s description</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
