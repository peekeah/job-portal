'use client';
import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AxiosError } from 'axios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { toast } from 'sonner';
import { IconBriefcaseFilled } from '@tabler/icons-react';
import { setAuthCookies } from '@/lib/auth-utils';

export default function Login() {
  const [user, setUser] = useState({
    email: '',
    password: '',
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'OAuthAccountExists') {
      toast.error(
        'An account already exists with these credentials. Please sign in with your password.',
      );
    } else if (error === 'UserNotFound') {
      toast.error(
        'No account found with this Google email. Please sign up first.',
      );
    } else if (error) {
      toast.error(error);
    }
  }, [searchParams]);

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
      toast.error(msg);
    }
  };

  const handleGoogleSignIn = () => {
    setAuthCookies('login');
    signIn('google', { callbackUrl: '/dashboard' });
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

          <div className="mt-6 space-y-4">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGoogleSignIn}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 py-1.5 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

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
