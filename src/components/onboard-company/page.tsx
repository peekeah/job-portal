'use client';
import axios, { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import CompanyProfile from './company-profile';
import CompanyMetadata from './company-metadata';
import CompanyAccount from './company-account';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Check } from 'lucide-react';
import clsx from 'clsx';
import { Card, CardContent } from '../ui/card';
import useSWRMutation from 'swr/mutation';
import { Spinner } from '../ui/spinner';
import * as z from 'zod';
import { CompanySize, UserType } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  combinedCompanySchema,
  companyAccountInputKeys,
  companyMetadataInputKeys,
  companyProfileInputKeys,
  CompanyCombinedInputKeys,
  CompanySignupPayload,
} from './types';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';

const initialFormData: CompanySignupPayload = {
  name: '',
  founding_year: 2004,
  company_type: '',
  email: '',
  password: '',
  contact_no: '',
  website: '',
  address: '',
  size: CompanySize.SIZE_1_10,
  bio: null,
};

type StepTitle = 'profile' | 'account' | 'metadata';

type Step = {
  id: number;
  title: StepTitle;
};

const steps: Step[] = [
  {
    id: 1,
    title: 'profile',
  },
  {
    id: 2,
    title: 'account',
  },
  {
    id: 3,
    title: 'metadata',
  },
];

const getFieldsForStepMap: Map<StepTitle, CompanyCombinedInputKeys[]> = new Map<
  StepTitle,
  CompanyCombinedInputKeys[]
>([
  ['profile', companyProfileInputKeys],
  ['account', companyAccountInputKeys],
  ['metadata', companyMetadataInputKeys],
]);

const signupApiCall = async (
  url: string,
  { arg }: { arg: { payload: CompanySignupPayload } },
) => {
  return await axios.post(url, {
    ...arg.payload,
    user_type: 'company',
    founding_year: +arg.payload.founding_year,
  });
};

import { setAuthCookies } from '@/lib/auth-utils';

const OnboardCompany = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(steps[0]);

  const {
    data: signupApiRes,
    isMutating: isLoading,
    trigger: signupApiTrigger,
  } = useSWRMutation('/api/auth/signup', signupApiCall);

  const handleNext = async () => {
    const fields = getFieldsForStepMap.get(currentStep.title);
    const isValid = await form.trigger(fields);

    if (isValid) {
      setCurrentStep((prev) => (prev.id === 3 ? prev : steps[prev.id]));
    }
  };

  const handlePrev = () => {
    const fields = getFieldsForStepMap.get(currentStep.title as StepTitle);

    fields?.forEach((field) => {
      form.clearErrors(field);
    });

    setCurrentStep((prev) => (prev?.id === 1 ? prev : steps[prev.id - 2]));
  };

  const form = useForm<CompanySignupPayload>({
    resolver: zodResolver(combinedCompanySchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: initialFormData,
  });

  const onSubmit = async (data: z.infer<typeof combinedCompanySchema>) => {
    try {
      await signupApiTrigger({ payload: data });
      toast.success('Signup successful');
    } catch (err) {
      if (err instanceof AxiosError) {
        toast.error(err?.response?.data?.error);
      } else {
        toast.error('something went wrong');
      }
    }
  };

  useEffect(() => {
    if (!isLoading && signupApiRes) {
      router.push('/login');
    }
  }, [isLoading, signupApiRes, router]);

  return (
    <Card className="mx-auto mt-16 min-w-xl p-3 py-8 pb-6">
      <CardContent>
        <div className="text-2xl leading-none font-semibold tracking-tight">
          Onboard Company
        </div>

        <div className="mt-6">
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => {
              setAuthCookies('signup', UserType.company);
              signIn('google', { callbackUrl: '/onboard?type=company' });
            }}
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
        </div>

        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>

        <div className="mx-auto my-8 flex items-center">
          {steps.map((step) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={clsx(
                    `flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors`,
                    step.id < currentStep.id
                      ? 'bg-green-500 text-white'
                      : step.id === currentStep.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500',
                  )}
                >
                  {step.id < currentStep.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </div>
              </div>
              {step.id < 3 && (
                <div
                  className={clsx(
                    'mx-2 h-1 flex-1 transition-colors',
                    step.id < currentStep.id ? 'bg-green-500' : 'bg-gray-200',
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <form
          className="mx-auto space-y-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {currentStep.id === 1 && (
            <CompanyProfile formControl={form.control} />
          )}
          {currentStep.id === 2 && (
            <CompanyAccount formControl={form.control} />
          )}
          {currentStep.id === 3 && (
            <CompanyMetadata formControl={form.control} />
          )}
          <div className="mt-6 space-x-4">
            {currentStep.id !== 1 && (
              <Button
                className="w-24"
                type="button"
                variant="outline"
                onClick={handlePrev}
              >
                Prev
              </Button>
            )}
            {currentStep.id !== 3 && (
              <Button className="w-24" type="button" onClick={handleNext}>
                Next
              </Button>
            )}
            {currentStep.id === 3 && (
              <Button className="w-24" type="submit">
                {!isLoading ? 'Submit' : <Spinner />}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default OnboardCompany;
