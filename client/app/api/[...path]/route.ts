import { serverClient } from "@/lib/axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const { path } = await params;
    const pathString = path.join("/");
    const searchParams = request.nextUrl.searchParams;
    const response = await serverClient.get(`/${pathString}?${searchParams}`);
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const { path } = await params;
    const pathString = path.join("/");
    const body = await request.json();
    const response = await serverClient.post(`/${pathString}`, body);
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: error.response?.status || 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const { path } = await params;
    const pathString = path.join("/");
    const body = await request.json();
    const response = await serverClient.put(`/${pathString}`, body);
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: error.response?.status || 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const { path } = await params;
    const pathString = path.join("/");
    const response = await serverClient.delete(`/${pathString}`);
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: error.response?.status || 500 }
    );
  }
}
