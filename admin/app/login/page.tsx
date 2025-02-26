'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthMutation } from "@/lib/hooks/use-auth-mutation"
import { useAuth } from "@/lib/store/use-auth"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { mutate: login, isPending, error } = useAuthMutation()
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
      router.refresh()
    }
  }, [isAuthenticated, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login({ email, password })
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-[400px] space-y-6 rounded-lg border p-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">코코아 관리자 로그인</h1>
          <p className="text-muted-foreground">
            관리자 계정으로 로그인 해주세요.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="text-sm text-red-500">
              {error instanceof Error ? error.message : '로그인 실패'}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? '로그인 중...' : '로그인'}
          </Button>
        </form>
      </div>
    </div>
  )
} 