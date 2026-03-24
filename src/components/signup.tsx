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
