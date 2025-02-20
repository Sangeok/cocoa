import { ServerAPICall } from "@/lib/axios";
import { NextRequest, NextResponse } from "next/server";

// 공통 헤더 설정 함수 추가
const getAuthHeaders = (request: NextRequest) => {
  const cookies = request.cookies;
  const accessToken = cookies.get('access_token');
  
  return {
    Cookie: `access_token=${accessToken?.value || ''}`,
    Authorization: accessToken?.value ? `Bearer ${accessToken.value}` : '',
  };
};

// API URL 선택 함수 추가
const getBaseUrl = (pathString: string) => {
  if (pathString.startsWith('scamscanner/')) {
    return process.env.SCAMSCANNER_API_URL || "https://api.scamscanner.info/api";
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
};

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const { path } = await params;
    const pathString = path.join("/");
    const searchParams = request.nextUrl.searchParams;
    
    console.log('API Route - Path:', pathString);
    console.log('API Route - SearchParams:', searchParams.toString());
    console.log('API Route - Full URL:', `/${pathString}?${searchParams}`);

    const response = await ServerAPICall.get(`/${pathString}?${searchParams}`, {
      withCredentials: true,
      headers: getAuthHeaders(request)
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('API Route - Error:', error);
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
    
    const baseUrl = getBaseUrl(pathString);
    const apiPath = pathString.startsWith('scamscanner/') 
      ? `/${pathString.substring('scamscanner/'.length)}` 
      : `/${pathString}`;
    
    const response = await ServerAPICall.post(`${apiPath}`, body, {
      baseURL: baseUrl,
      withCredentials: true,
      headers: getAuthHeaders(request)
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
    
    const baseUrl = getBaseUrl(pathString);
    const apiPath = pathString.startsWith('scamscanner/') 
      ? `/${pathString.substring('scamscanner/'.length)}` 
      : `/${pathString}`;
    
    const response = await ServerAPICall.put(`${apiPath}`, body, {
      baseURL: baseUrl,
      withCredentials: true,
      headers: getAuthHeaders(request)
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
    
    const baseUrl = getBaseUrl(pathString);
    const apiPath = pathString.startsWith('scamscanner/') 
      ? `/${pathString.substring('scamscanner/'.length)}` 
      : `/${pathString}`;
    
    const response = await ServerAPICall.delete(`${apiPath}`, {
      baseURL: baseUrl,
      withCredentials: true,
      headers: getAuthHeaders(request)
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
    
    const baseUrl = getBaseUrl(pathString);
    const apiPath = pathString.startsWith('scamscanner/') 
      ? `/${pathString.substring('scamscanner/'.length)}` 
      : `/${pathString}`;
    
    const response = await ServerAPICall.patch(`${apiPath}`, body, {
      baseURL: baseUrl,
      withCredentials: true,
      headers: getAuthHeaders(request)
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: error.response?.status || 500 }
    );
  }
}
