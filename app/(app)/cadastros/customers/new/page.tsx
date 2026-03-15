"use client";

import { useRouter } from "next/navigation";
import { CustomerForm } from "@/components/cadastros/customer-form";

export default function NewCustomerPage() {
  const router = useRouter();

  return (
    <CustomerForm
      onSuccess={() => router.push("/cadastros/customers")}
      onCancel={() => router.push("/cadastros/customers")}
    />
  );
}
