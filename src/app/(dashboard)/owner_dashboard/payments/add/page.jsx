import PaymentForm from "./PaymentForm";

export default function AddPaymentPage() {
  const tenants = [
    { id: "1", name: "Alice Wanjiku", rent: 15000 },
    { id: "2", name: "John Otieno", rent: 12000 },
    { id: "3", name: "Sarah Njeri", rent: 18000 },
  ];

  return (
    <div className="content-wrapper">
      <section className="content">
        <div className="container-xxl flex-grow-1 container-p-y">
          <PaymentForm tenants={tenants} />
        </div>
      </section>
    </div>
  );
}
