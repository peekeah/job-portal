import { LogoIcon } from '@/components/logo';
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

  return (
    <section className="flex h-full dark:bg-transparent">
      <form
        id="signup-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="bg-muted m-auto h-fit w-full max-w-lg overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]"
      >
        <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
          <div className="text-center">
            <Link href="/" aria-label="go home" className="mx-auto block w-fit">
              <LogoIcon />
            </Link>
            <h1 className="mt-4 mb-1 text-xl font-semibold">Create Account</h1>
            <p className="text-sm">Welcome! Create account to proceed</p>
          </div>

          <div className="mt-6 space-y-6">
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
              {!isLoading ? 'Sign In' : <Spinner />}
            </Button>
          </div>

          <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <hr className="border-dashed" />
            <span className="text-muted-foreground text-xs">
              Or continue With
            </span>
            <hr className="border-dashed" />
          </div>

          <div>
            <Button type="button" className="w-full" variant="outline">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="0.98em"
                height="1em"
                viewBox="0 0 256 262"
              >
                <path
                  fill="#4285f4"
                  d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                ></path>
                <path
                  fill="#34a853"
                  d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                ></path>
                <path
                  fill="#fbbc05"
                  d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                ></path>
                <path
                  fill="#eb4335"
                  d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                ></path>
              </svg>
              <span>Google</span>
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
