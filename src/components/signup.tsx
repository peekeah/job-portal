import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import z from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useSWRMutation from 'swr/mutation';
import { Spinner } from './ui/spinner';
import { toast } from 'sonner';
import { IconBriefcaseFilled } from '@tabler/icons-react';
import { signIn } from 'next-auth/react';

const initialFormValues = {
  name: '',
  email: '',
  password: '',
  verifyPassword: '',
};

const signupSchema = z
  .object({
    name: z
      .string()
      .nonempty({ message: 'Name is required' })
      .min(2, { message: 'Name must be at least 2 characters long' })
      .max(50, { message: 'Name cannot exceed 50 characters' }),

    email: z
      .string()
      .nonempty({ message: 'Email is required' })
      .email({ message: 'Please enter a valid email address' })
      .max(50, { message: 'Email cannot exceed 50 characters' }),

    password: z
      .string()
      .nonempty({ message: 'Password is required' })
      .min(8, { message: 'Password must be at least 8 characters long' })
      .max(20, { message: 'Password cannot exceed 20 characters' })
      .regex(/[A-Z]/, {
        message: 'Password must contain at least one uppercase letter',
      })
      .regex(/[a-z]/, {
        message: 'Password must contain at least one lowercase letter',
      })
      .regex(/[0-9]/, { message: 'Password must contain at least one number' }),

    verifyPassword: z
      .string()
      .nonempty({ message: 'Confirm password is required' }),
  })
  .refine((data) => data.password === data.verifyPassword, {
    message: 'Passwords do not match',
    path: ['verifyPassword'],
  });

type SignupPayload = z.infer<typeof signupSchema> & {
  userType: string;
};

const signupApiCall = async (
  url: string,
  { arg: payload }: { arg: SignupPayload },
) => {
  try {
    const response = await axios.post(url, payload);
    toast.success(response.data.data);
    return response.data;
  } catch (err) {
    if (err instanceof AxiosError) {
      toast.error(err?.response?.data?.message);
    } else {
      toast.error('something went wrong');
    }
  }
};

import { setAuthCookies } from '@/lib/auth-utils';
import { UserType } from '@prisma/client';

export default function SignUpPage() {
  const router = useRouter();

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: initialFormValues,
  });

  const { trigger: handleSignup, isMutating: isLoading } = useSWRMutation(
    `/api/auth/signup`,
    signupApiCall,
  );

  const onSubmit = async (data: z.infer<typeof signupSchema>) => {
    const payload: SignupPayload = {
      ...data,
      userType: 'applicant',
    };

    try {
      await handleSignup(payload);
      toast.success('successfully signup!');
      router.push('/login');
    } catch (err) {
      if (err instanceof AxiosError) {
        toast.error(err?.response?.data.message || err?.response?.data.error);
      }
    }
  };

  const handleGoogleSignIn = () => {
    setAuthCookies('signup', UserType.applicant);
    signIn('google', { callbackUrl: '/onboard?type=applicant' });
  };

  return (
    <section className="mt-12 flex h-full p-5 md:mt-28 dark:bg-transparent">
      <form
        id="signup-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="bg-muted m-auto h-fit w-full max-w-lg overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]"
      >
        <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
          <div className="text-center">
            <div className="mx-auto block w-fit">
              <IconBriefcaseFilled className="text-primary size-7" />
            </div>
            <h1 className="mt-4 mb-1 text-xl font-semibold">Create Account</h1>
            <p className="text-sm">Welcome! Create account to proceed</p>
          </div>

          <div className="mt-6 space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGoogleSignIn}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                  fill="#4285F4"
                />
                <path
                  d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                  fill="#34A853"
                />
                <path
                  d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
                  fill="#FBBC05"
                />
                <path
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
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

            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState, formState }) => (
                <Input
                  {...field}
                  label="Name"
                  placeholder="Name"
                  aria-invalid={fieldState.invalid}
                  error={
                    !formState.isValid ? formState.errors.name?.message : ''
                  }
                />
              )}
            />
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState, formState }) => (
                <Input
                  {...field}
                  type="email"
                  label="Email"
                  aria-invalid={fieldState.invalid}
                  placeholder="Email"
                  error={
                    !formState.isValid ? formState.errors.email?.message : ''
                  }
                />
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState, formState }) => (
                <Input
                  {...field}
                  type="password"
                  placeholder="Password"
                  aria-invalid={fieldState.invalid}
                  label="Password"
                  error={
                    !formState.isValid ? formState.errors.password?.message : ''
                  }
                />
              )}
            />
            <Controller
              name="verifyPassword"
              control={form.control}
              render={({ field, fieldState, formState }) => (
                <Input
                  {...field}
                  type="password"
                  placeholder="Confirm Password"
                  aria-invalid={fieldState.invalid}
                  label="Confirm Password"
                  error={
                    !formState.isValid
                      ? formState.errors.verifyPassword?.message
                      : ''
                  }
                />
              )}
            />
            <Button className="w-full" type="submit">
              {!isLoading ? 'Sign Up' : <Spinner />}
            </Button>
          </div>
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm">
            Join us?
            <Button asChild variant="link" className="px-2">
              <Link href="/onboard-company">Onboard company</Link>
            </Button>
          </p>
        </div>
      </form>
    </section>
  );
}
