'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { toast } from 'sonner';
import { IconBriefcaseFilled } from '@tabler/icons-react';

export default function Login() {
  const [user, setUser] = useState({
    email: '',
    password: '',
  });

  const router = useRouter();

  const handleSubmit = async () => {
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: user.email,
        password: user.password,
      });

      if (res?.error) {
        return toast.error(res?.error);
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      let msg = 'something went wrong';
      if (err instanceof AxiosError) {
        msg = err?.response?.data?.error;
      }
      toast.success(msg);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  return (
    <section className="mt-16 flex h-full w-full p-5 md:mt-42 dark:bg-transparent">
      <div className="bg-muted m-auto h-fit w-full max-w-lg overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]">
        <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
          <div className="text-center">
            <div className="mx-auto block w-fit">
              <IconBriefcaseFilled className="text-primary size-7" />
            </div>
            <h1 className="mt-4 mb-1 text-xl font-semibold">
              Sign In to Nexthire
            </h1>
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

            <div className="space-y-2">
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
                className="intent-info variant-ghost px-0 pt-0 text-sm"
              >
                <Link href="/forgot-password">Forgot your Password ?</Link>
              </Button>
            </div>

            <Button className="w-full" onClick={handleSubmit}>
              Sign In
            </Button>
          </div>
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm">
            Don&apos;t have an account ?
            <Button asChild variant="link" className="px-2">
              <Link href="/signup">Create account</Link>
            </Button>
          </p>
        </div>
      </div>
    </section>
  );
}
