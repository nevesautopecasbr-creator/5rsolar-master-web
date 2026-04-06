import { CashMovementForm } from "@/components/finance/cash-movement-form";

export default function Page() {
  return <CashMovementForm onSuccessRedirect="/finance/cash" />;
}