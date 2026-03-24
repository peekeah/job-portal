'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconBriefcaseFilled } from '@tabler/icons-react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEventHandler, FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

const ResetPassword = () => {
  const params = useSearchParams();
  const token = params.get('token');
  const router = useRouter();

  const [formData, setFormData] = useState({
    password: '',
    verifyPassword: '',
  });

  const onInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (formData.password !== formData.verifyPassword) {
      toast.error('password does not match');
      return;
    }

    const payload = {
      token,
      password: formData.password,
    };

    axios
      .post('/api/auth/reset-password', payload)
      .then((res) => {
        toast.success(res.data?.data);
        router.push('/login');
      })
      .catch((err) => {
        toast.error(err?.message);
      });
  };

  return (
    <section className="flex px-4 py-16 md:py-32 dark:bg-transparent">
      <form
        onSubmit={onSubmit}
        className="bg-muted m-auto h-fit w-full max-w-md overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]"
      >
        <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
          <div className="text-center">
            <Link href="/" aria-label="go home" className="mx-auto block w-fit">
              <IconBriefcaseFilled size={18} className="text-primary" />
            </Link>
            <h1 className="mt-4 mb-1 text-xl font-semibold">Reset Password</h1>
          </div>

          <div className="mt-6 space-y-6">
            <div className="space-y-5">
              <Input
                value={formData.password}
                onChange={onInputChange}
                label="Password"
                type="password"
                required
                name="password"
                placeholder="Password"
              />
              <Input
                value={formData.verifyPassword}
                onChange={onInputChange}
                label="Verify Password"
                type="password"
                required
                name="verifyPassword"
                placeholder="Verify Password"
              />
            </div>

            <Button type="submit" className="w-full">
              Change Password
            </Button>
          </div>
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm">
            Remembered your password?
            <Button asChild variant="link" className="px-2">
              <Link href="/login">Log in</Link>
            </Button>
          </p>
        </div>
      </form>
    </section>
  );
};

export default ResetPassword;
