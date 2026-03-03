import { NextRequest, NextResponse } from "next/server";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(
  /\/+$/,
  "",
);

type RouteParams = {
  path?: string[];
};

async function proxy(request: NextRequest, params: RouteParams) {
  const path = params.path?.join("/") ?? "";
  const url = `${API_BASE}/${path}${request.nextUrl.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.text();

  const response = await fetch(url, {
    method: request.method,
    headers,
    body,
  });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("transfer-encoding");

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export function GET(request: NextRequest, { params }: { params: RouteParams }) {
  return proxy(request, params);
}

export function POST(request: NextRequest, { params }: { params: RouteParams }) {
  return proxy(request, params);
}

export function PATCH(request: NextRequest, { params }: { params: RouteParams }) {
  return proxy(request, params);
}

export function PUT(request: NextRequest, { params }: { params: RouteParams }) {
  return proxy(request, params);
}

export function DELETE(
  request: NextRequest,
  { params }: { params: RouteParams },
) {
  return proxy(request, params);
}
