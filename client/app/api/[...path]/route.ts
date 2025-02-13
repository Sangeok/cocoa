import { ServerAPICall } from "@/lib/axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const { path } = await params;
    const pathString = path.join("/");
    const searchParams = request.nextUrl.searchParams;
    const response = await ServerAPICall.get(`/${pathString}?${searchParams}`, {
      withCredentials: true,
    });
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
    
    // 요청의 쿠키를 가져옵니다
    const cookies = request.cookies;
    const accessToken = cookies.get('access_token');
    
    const response = await ServerAPICall.post(`/${pathString}`, body, {
      withCredentials: true,
      headers: {
        Cookie: `access_token=${accessToken?.value || ''}`
      }
    });
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
    const response = await ServerAPICall.put(`/${pathString}`, body, {
      withCredentials: true,
    });
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
    const response = await ServerAPICall.delete(`/${pathString}`, {
      withCredentials: true,
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: error.response?.status || 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const { path } = await params;
    const pathString = path.join("/");
    const body = await request.json();
    
    // 요청의 쿠키를 가져옵니다
    const cookies = request.cookies;
    const accessToken = cookies.get('access_token');
    
    const response = await ServerAPICall.patch(`/${pathString}`, body, {
      withCredentials: true,
      headers: {
        Cookie: `access_token=${accessToken?.value || ''}`
      }
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: error.response?.status || 500 }
    );
  }
}
