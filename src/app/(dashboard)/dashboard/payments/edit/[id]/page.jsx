"use client";
import { useEffect, useState } from "react";
import PaymentForm from "./PaymentForm";

export default function EditPaymentPage({ params }) {
  async function getPayment(id) {
    const res = await fetch(`/api/payments?id=${id}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch payment");
    const data = await res.json();
    return data;
  }

  const [payment, setPayments] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getPayment(params.id);
      setPayments(data);
    };
    fetchData();
  }, []);

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-xxl flex-grow-1 container-p-y">
          <h1 className="mt-3">Edit Payment</h1>
          <PaymentForm initialData={payment} />
        </div>
      </section>
    </div>
  );
}
