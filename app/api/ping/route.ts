import { NextResponse } from "next/server";

export async function GET() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  const url = `${apiBase}/api/health`;
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7c7a3af8-2979-4f40-9dcc-4e60fdd8a2be',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/ping/route.ts:7',message:'ping_before',data:{url},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'H6'})}).catch(()=>{});
    // #endregion
    const response = await fetch(url, { method: "GET" });
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7c7a3af8-2979-4f40-9dcc-4e60fdd8a2be',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/ping/route.ts:12',message:'ping_after',data:{ok:response.ok,status:response.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'H6'})}).catch(()=>{});
    // #endregion
    return NextResponse.json({ ok: response.ok, status: response.status });
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7c7a3af8-2979-4f40-9dcc-4e60fdd8a2be',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/ping/route.ts:16',message:'ping_error',data:{name:(error as Error)?.name,message:(error as Error)?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'H6'})}).catch(()=>{});
    // #endregion
    return NextResponse.json({ ok: false, error: "API unreachable" }, { status: 502 });
  }
}
