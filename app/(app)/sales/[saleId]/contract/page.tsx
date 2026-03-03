"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import { StatusActionsPanel } from "@/components/workflow/StatusActionsPanel";

type Contract = {
  id: string;
  status: string;
  version: number;
  contractPdfUrl?: string | null;
  signedAt?: string | null;
  customer?: {
    name?: string | null;
    document?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  };
  project?: {
    name?: string | null;
  };
  template?: {
    content?: string | null;
  };
};

export default function ContractSignaturePage() {
  const params = useParams<{ saleId: string }>();
  const saleId = params.saleId;
  const [contract, setContract] = useState<Contract | null>(null);
  const [consent, setConsent] = useState(false);
  const [signedName, setSignedName] = useState("");
  const [signedDocument, setSignedDocument] = useState("");
  const [signatureType, setSignatureType] = useState<"DRAWN" | "UPLOAD">("DRAWN");
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    let active = true;
    apiFetch(`/api/sales/${saleId}/contract`)
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        setContract(data);
      })
      .catch(() => {
        if (!active) return;
        setStatus("Falha ao carregar contrato.");
      });
    return () => {
      active = false;
    };
  }, [saleId]);

  const contractSummary = useMemo(() => {
    return {
      customerName: contract?.customer?.name ?? "-",
      document: contract?.customer?.document ?? "-",
      email: contract?.customer?.email ?? "-",
      phone: contract?.customer?.phone ?? "-",
      address: contract?.customer?.address ?? "-",
      projectName: contract?.project?.name ?? "-",
    };
  }, [contract]);

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (signatureType !== "DRAWN") return;
    drawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111827";
    ctx.beginPath();
    ctx.moveTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
    ctx.stroke();
  }

  function handlePointerUp() {
    drawingRef.current = false;
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function getSignatureBase64() {
    const canvas = canvasRef.current;
    if (!canvas) return "";
    return canvas.toDataURL("image/png");
  }

  async function handleSign() {
    if (!contract) return;
    if (!consent) {
      setStatus("É necessário aceitar o consentimento.");
      return;
    }
    if (!signedName || !signedDocument) {
      setStatus("Nome e documento são obrigatórios.");
      return;
    }

    setLoading(true);
    setStatus(null);
    let signatureFileBase64: string | undefined;

    if (signatureType === "UPLOAD") {
      if (!signatureFile) {
        setStatus("Envie a imagem da assinatura.");
        setLoading(false);
        return;
      }
      const fileBuffer = await signatureFile.arrayBuffer();
      const bytes = new Uint8Array(fileBuffer);
      let binary = "";
      bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
      });
      signatureFileBase64 = `data:${signatureFile.type};base64,${btoa(binary)}`;
    }

    const payload = {
      signatureType,
      signatureImageBase64: signatureType === "DRAWN" ? getSignatureBase64() : undefined,
      signatureFileUrl: signatureType === "UPLOAD" ? signatureFileBase64 : undefined,
      signedName,
      signedDocument,
      consent,
      version: contract.version,
    };

    try {
      const response = await apiFetch(`/api/contracts/${contract.id}/sign`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        setStatus("Falha ao assinar contrato.");
        return;
      }
      const updated = await response.json();
      setContract(updated);
      setStatus("Contrato assinado com sucesso.");
    } catch {
      setStatus("Falha ao assinar contrato.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold">Assinatura do Contrato</h1>
          <p className="text-sm text-brand-navy-600">
            Revise o contrato, confirme o consentimento e capture a assinatura.
          </p>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-md border border-brand-navy-200 p-4 text-sm">
              <div className="font-semibold text-brand-navy-700">Resumo do Contrato</div>
              <div className="mt-2 grid gap-1">
                <div>Cliente: {contractSummary.customerName}</div>
                <div>Documento: {contractSummary.document}</div>
                <div>Email: {contractSummary.email}</div>
                <div>Telefone: {contractSummary.phone}</div>
                <div>Endereço: {contractSummary.address}</div>
                <div>Projeto: {contractSummary.projectName}</div>
              </div>
            </div>
            <div className="rounded-md border border-brand-navy-200 p-4 text-sm">
              <div className="font-semibold text-brand-navy-700">Status</div>
              <div className="mt-2">Contrato: {contract?.status ?? "-"}</div>
              {contract?.signedAt ? (
                <div>Assinado em: {new Date(contract.signedAt).toLocaleString("pt-BR")}</div>
              ) : null}
              {contract?.contractPdfUrl ? (
                <div className="mt-2">
                  <a
                    href={contract.contractPdfUrl}
                    className="text-brand-navy-700 underline"
                    target="_blank"
                  >
                    Ver PDF
                  </a>
                </div>
              ) : null}
            </div>
          </div>
          {contract ? (
            <div className="rounded-md border border-brand-navy-200 p-4">
              <div className="text-sm font-semibold text-brand-navy-700">Ações do contrato</div>
              <div className="mt-3">
                <StatusActionsPanel entityType="CONTRACT" entityId={contract.id} />
              </div>
            </div>
          ) : null}

          <div className="rounded-md border border-brand-navy-200 p-4">
            <div className="text-sm font-semibold text-brand-navy-700">Preview do contrato</div>
            <div
              className="mt-3 max-h-64 overflow-auto rounded-md border border-brand-navy-100 bg-white p-3 text-sm"
              dangerouslySetInnerHTML={{
                __html: contract?.template?.content ?? "<p>Contrato indisponível.</p>",
              }}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Nome completo</Label>
              <Input value={signedName} onChange={(event) => setSignedName(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>CPF/CNPJ</Label>
              <Input
                value={signedDocument}
                onChange={(event) => setSignedDocument(event.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-brand-navy-700 md:col-span-2">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
              />
              Li e concordo com os termos do contrato.
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Tipo de assinatura</Label>
              <select
                className="h-10 w-full rounded-md border border-brand-navy-300 bg-white px-3 text-sm"
                value={signatureType}
                onChange={(event) =>
                  setSignatureType(event.target.value as "DRAWN" | "UPLOAD")
                }
              >
                <option value="DRAWN">Desenhar no dispositivo</option>
                <option value="UPLOAD">Enviar imagem</option>
              </select>
            </div>
            {signatureType === "UPLOAD" ? (
              <div className="grid gap-2">
                <Label>Upload da assinatura</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setSignatureFile(event.target.files?.[0] ?? null)}
                />
              </div>
            ) : (
              <div className="grid gap-2">
                <Label>Assinatura (desenhar)</Label>
                <div className="rounded-md border border-brand-navy-300">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={160}
                    className="w-full touch-none"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                  />
                </div>
                <Button type="button" variant="outline" onClick={clearCanvas}>
                  Limpar
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" onClick={handleSign} disabled={loading}>
              {loading ? "Assinando..." : "Assinar e Finalizar"}
            </Button>
            {status ? <span className="text-sm text-brand-navy-600">{status}</span> : null}
            {contract?.status === "ACTIVE" ? (
              <a
                href={`/sales/${saleId}/implementation`}
                className="text-sm text-brand-navy-700 underline"
              >
                Ir para Checklist
              </a>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
