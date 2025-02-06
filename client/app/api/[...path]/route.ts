import { serverClient } from '@/lib/axios'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/')
    const searchParams = request.nextUrl.searchParams
    const response = await serverClient.get(`/${path}?${searchParams}`)
    return NextResponse.json(response.data)
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: error.response?.status || 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/')
    const body = await request.json()
    const response = await serverClient.post(`/${path}`, body)
    return NextResponse.json(response.data)
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: error.response?.status || 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/')
    const body = await request.json()
    const response = await serverClient.put(`/${path}`, body)
    return NextResponse.json(response.data)
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: error.response?.status || 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/')
    const response = await serverClient.delete(`/${path}`)
    return NextResponse.json(response.data)
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: error.response?.status || 500 }
    )
  }
} 