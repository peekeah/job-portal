'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { UserType, CompanySize } from '@prisma/client';
import { companySchema } from '@/lib/schema';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const applicantOnboardingSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  mobile: z.string().min(10, 'Valid mobile number is required'),
  college_name: z.string().min(1, 'College name is required'),
  college_branch: z.string().min(1, 'College branch is required'),
  college_joining_year: z.string().min(4, 'Valid year is required'),
});

export default function OnboardingPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userType] = useState<UserType>(
    (searchParams.get('type') as UserType) || UserType.applicant
  );
  const [isLoading, setIsLoading] = useState(false);

  const applicantForm = useForm<z.infer<typeof applicantOnboardingSchema>>({
    resolver: zodResolver(applicantOnboardingSchema),
    defaultValues: {
      name: session?.user?.email?.split('@')[0] || '',
      mobile: '',
      college_name: '',
      college_branch: '',
      college_joining_year: '',
    },
  });

  const companyForm = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      email: session?.user?.email || '',
      founding_year: new Date().getFullYear(),
      company_type: '',
      contact_no: '',
      address: '',
      size: CompanySize.SIZE_1_10,
    },
  });

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (userType === UserType.applicant) {
        applicantForm.reset({
          name: session.user.name || session.user.email?.split('@')[0] || '',
          mobile: applicantForm.getValues('mobile'),
          college_name: applicantForm.getValues('college_name'),
          college_branch: applicantForm.getValues('college_branch'),
          college_joining_year: applicantForm.getValues('college_joining_year'),
        });
      } else {
        companyForm.reset({
          name: companyForm.getValues('name'),
          email: session.user.email || '',
          founding_year: companyForm.getValues('founding_year'),
          company_type: companyForm.getValues('company_type'),
          contact_no: companyForm.getValues('contact_no'),
          address: companyForm.getValues('address'),
          size: companyForm.getValues('size'),
        });
      }
    }
  }, [status, session, userType]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && !session?.user?.needsOnboarding) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  const onSubmit = async (data: z.infer<typeof applicantOnboardingSchema> | z.infer<typeof companySchema>) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        user_type: userType,
      };
      const response = await axios.post('/api/auth/onboard', payload);
      if (response.data.status) {
        toast.success('Onboarding complete!');
        await update(); // Refresh session
        router.push('/dashboard');
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        toast.error(err?.response?.data?.message || 'Onboarding failed');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') return <div className="flex h-screen items-center justify-center"><Spinner /></div>;

  return (
    <div className="container mx-auto max-w-2xl py-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Complete Your Profile</CardTitle>
          <p className="text-center text-muted-foreground">Tell us more about yourself to get started</p>
        </CardHeader>
        <CardContent>
          <div className="mb-8 p-4 bg-muted/50 rounded-lg border flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Registering as</p>
              <p className="text-lg font-bold capitalize">{userType}</p>
            </div>
            <div className="text-xs text-muted-foreground max-w-[200px] text-right">
              Profile type is fixed based on your signup choice.
            </div>
          </div>

          {userType === UserType.applicant ? (
            <form onSubmit={applicantForm.handleSubmit(onSubmit)} className="space-y-4">
              <Controller
                name="name"
                control={applicantForm.control}
                render={({ field, fieldState }) => (
                  <Input {...field} label="Full Name" placeholder="John Doe" error={fieldState.error?.message} />
                )}
              />
              <Controller
                name="mobile"
                control={applicantForm.control}
                render={({ field, fieldState }) => (
                  <Input {...field} label="Mobile Number" placeholder="+91 9876543210" error={fieldState.error?.message} />
                )}
              />
              <Controller
                name="college_name"
                control={applicantForm.control}
                render={({ field, fieldState }) => (
                  <Input {...field} label="College Name" placeholder="IIT Delhi" error={fieldState.error?.message} />
                )}
              />
              <Controller
                name="college_branch"
                control={applicantForm.control}
                render={({ field, fieldState }) => (
                  <Input {...field} label="College Branch" placeholder="Computer Science" error={fieldState.error?.message} />
                )}
              />
              <Controller
                name="college_joining_year"
                control={applicantForm.control}
                render={({ field, fieldState }) => (
                  <Input {...field} label="Joining Year" placeholder="2022" error={fieldState.error?.message} />
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Spinner /> : 'Complete Setup'}
              </Button>
            </form>
          ) : (
            <form onSubmit={companyForm.handleSubmit(onSubmit)} className="space-y-4">
              <Controller
                name="name"
                control={companyForm.control}
                render={({ field, fieldState }) => (
                  <Input {...field} label="Company Name" placeholder="Nexthire Inc." error={fieldState.error?.message} />
                )}
              />
               <Controller
                name="email"
                control={companyForm.control}
                render={({ field, fieldState }) => (
                  <Input {...field} label="Company Email" disabled error={fieldState.error?.message} />
                )}
              />
              <Controller
                name="founding_year"
                control={companyForm.control}
                render={({ field, fieldState }) => (
                  <Input 
                    {...field} 
                    type="number" 
                    label="Founding Year" 
                    placeholder="2020" 
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    error={fieldState.error?.message} 
                  />
                )}
              />
              <Controller
                name="company_type"
                control={companyForm.control}
                render={({ field, fieldState }) => (
                  <Input {...field} label="Company Type" placeholder="SaaS / Fintech" error={fieldState.error?.message} />
                )}
              />
              <Controller
                name="contact_no"
                control={companyForm.control}
                render={({ field, fieldState }) => (
                  <Input {...field} label="Contact Number" placeholder="+91 9876543210" error={fieldState.error?.message} />
                )}
              />
              <Controller
                name="address"
                control={companyForm.control}
                render={({ field, fieldState }) => (
                  <Input {...field} label="Address" placeholder="123 Silicon Valley" error={fieldState.error?.message} />
                )}
              />
              <Controller
                name="size"
                control={companyForm.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Company Size</label>
                    <Select onValueChange={field.onChange} defaultValue={field.value!}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(CompanySize).map((size) => (
                          <SelectItem key={size} value={size}>
                            {size.replace('SIZE_', '').replace('_', '-')} Employees
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.error && <p className="text-xs text-red-500">{fieldState.error.message}</p>}
                  </div>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Spinner /> : 'Complete Setup'}
              </Button>
            </form>
          )}
          
          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-sm text-muted-foreground mb-3">Signed in as {session?.user?.email}</p>
            <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/login' })}>
              Sign out and try again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
