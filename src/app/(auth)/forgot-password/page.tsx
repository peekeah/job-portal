"use client"
import { LogoIcon } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import axios, { AxiosError } from 'axios'
import Link from 'next/link'
import { FormEventHandler, useState } from 'react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const onSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post("/api/auth/forgot-password", {
        email
      })

      alert(res?.data?.data)

    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        alert(err?.message)
        return
      }
      alert("something went wrong, try again!")
    }
  }

  return (
    <section className="flex px-4 py-16 md:py-32 dark:bg-transparent">
      <form
        action={"#"}
        onSubmit={onSubmit}
        className="bg-muted m-auto h-fit w-full max-w-md overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]">
        <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
          <div className="text-center">
            <Link
              href="/"
              aria-label="go home"
              className="mx-auto block w-fit">
              <LogoIcon />
            </Link>
            <h1 className="mb-1 mt-4 text-xl font-semibold">Recover Password</h1>
            <p className="text-sm">Enter your email to receive a reset link</p>
          </div>

          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                label="Email"
                type="email"
                required
                name="email"
                placeholder="name@example.com"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
            >Send Reset Link</Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">We'll send you a link to reset your password.</p>
          </div>
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm">
            Remembered your password?
            <Button
              asChild
              variant="link"
              className="px-2">
              <Link href="/login">Log in</Link>
            </Button>
          </p>
        </div>
      </form>
    </section>
  )
}
