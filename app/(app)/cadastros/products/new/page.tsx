"use client";

import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/cadastros/product-form";

export default function NewProductPage() {
  const router = useRouter();

  return (
    <ProductForm
      onSuccess={() => router.push("/cadastros/products")}
      onCancel={() => router.push("/cadastros/products")}
    />
  );
}
