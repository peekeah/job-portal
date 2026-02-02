"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AxiosError } from "axios"

import { LogoIcon } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default function Login() {

  const [user, setUser] = useState({
    email: '',
    password: '',
  });

  const router = useRouter()

  const handleSubmit = async () => {

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: user.email,
        password: user.password,
      })

      if (res?.error) {
        return alert(res?.error)
      }

      router.push("/dashboard")
    } catch (err: unknown) {
      let msg = "something went wrong";
      if (err instanceof AxiosError) {
        msg = err?.response?.data?.error;
      }
      alert(msg)
      console.log(err);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  }

  return (
    <section className="flex px-4 py-16 md:py-32 dark:bg-transparent">
      <div
        className="bg-muted h-fit min-w-md overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]">
        <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
          <div className="text-center">
            <Link
              href="/"
              aria-label="go home"
              className="mx-auto block w-fit">
              <LogoIcon />
            </Link>
            <h1 className="mb-1 mt-4 text-xl font-semibold">Sign In to Nexthire</h1>
            <p className="text-sm">Welcome back! Sign in to continue</p>
          </div>

          <div className="mt-6 space-y-6">
            <Input
              required
              name="email"
              label="Email"
              placeholder="Email"
              onChange={handleInputChange}
            />

            <div className="space-y-2 mb-2">
              <Input
                required
                name="password"
                label="Password"
                placeholder="Password"
                type="password"
                onChange={handleInputChange}
              />
              <Button
                asChild
                variant="link"
                className="px-0 pt-0 text-sm intent-info variant-ghost">
                <Link
                  href={"/forgot-password"}
                >Forgot your Password ?</Link>
              </Button>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
          >Sign In</Button>

          <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <hr className="border-dashed" />
            <span className="text-muted-foreground text-xs">Or continue With</span>
            <hr className="border-dashed" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              className="overflow-hidden"
              type="button"
              variant="outline">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="0.98em"
                height="1em"
                viewBox="0 0 256 262">
                <path
                  fill="#4285f4"
                  d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path>
                <path
                  fill="#34a853"
                  d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"></path>
                <path
                  fill="#fbbc05"
                  d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"></path>
                <path
                  fill="#eb4335"
                  d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"></path>
              </svg>
              <span>Google</span>
            </Button>
            <Button
              type="button"
              variant="outline">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 256 256">
                <path
                  fill="#f1511b"
                  d="M121.666 121.666H0V0h121.666z"></path>
                <path
                  fill="#80cc28"
                  d="M256 121.666H134.335V0H256z"></path>
                <path
                  fill="#00adef"
                  d="M121.663 256.002H0V134.336h121.663z"></path>
                <path
                  fill="#fbbc09"
                  d="M256 256.002H134.335V134.336H256z"></path>
              </svg>
              <span>Microsoft</span>
            </Button>
          </div>

        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm">
            Don&apos;t have an account ?
            <Button
              asChild
              variant="link"
              className="px-2">
              <Link href="/signup">Create account</Link>
            </Button>
          </p>
        </div>
      </div>
    </section >
  )
}

