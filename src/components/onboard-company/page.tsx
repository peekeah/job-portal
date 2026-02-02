"use client"
import axios, { AxiosError } from "axios";
import React, { useState } from "react";
import CompanyProfile from "./company-profile";
import CompanyMetadata from "./company-metadata";
import CompanyAccount from "./company-account";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Check } from "lucide-react";
import clsx from "clsx";
import { Card, CardContent } from "../ui/card";
import useSWRMutation from "swr/mutation";
import { Spinner } from "../ui/spinner";
import * as z from "zod";
import { CompanySize } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  combinedCompanySchema,
  companyAccountInputKeys,
  companyMetadataInputKeys,
  companyProfileInputKeys,
  CompanyCombinedInputKeys,
  CompanySignupPayload
} from "./types";

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
  bio: null
}

type StepTitle = "profile" | "account" | "metadata";

type Step = {
  id: number;
  title: StepTitle
}

const steps: Step[] = [
  {
    id: 1,
    title: "profile",
  }, {
    id: 2,
    title: "account",
  }, {
    id: 3,
    title: "metadata",
  },
]

const getFieldsForStepMap: Map<StepTitle, CompanyCombinedInputKeys[]> =
  new Map<StepTitle, CompanyCombinedInputKeys[]>([
    ["profile", companyProfileInputKeys],
    ["account", companyAccountInputKeys],
    ["metadata", companyMetadataInputKeys]
  ])

const signupApiCall = async (url: string, { arg }: { arg: { payload: CompanySignupPayload } }) => {
  return await axios.post(url, {
    ...arg.payload,
    user_type: "company",
    founding_year: +arg.payload.founding_year,
  });
}

const OnboardCompany = () => {

  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>(steps[0])

  const { data: signupApiRes, isMutating: isLoading, trigger: signupApiTrigger } = useSWRMutation("/api/auth/signup", signupApiCall)

  const handleNext = async () => {
    const fields = getFieldsForStepMap.get(currentStep.title);
    const isValid = await form.trigger(fields);

    if (isValid) {
      setCurrentStep(prev => prev.id === 3 ? prev : steps[prev.id])
    }
  }

  const handlePrev = () => {
    const fields = getFieldsForStepMap.get(currentStep.title as StepTitle)

    fields?.forEach(field => {
      form.clearErrors(field)
    })

    setCurrentStep(prev => prev?.id === 1 ? prev : steps[prev.id - 2])
  }

  const form = useForm<CompanySignupPayload>({
    resolver: zodResolver(combinedCompanySchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: initialFormData
  })

  const onSubmit = async (data: z.infer<typeof combinedCompanySchema>) => {
    try {
      await signupApiTrigger({ payload: data });
      alert("Signup successful")
    } catch (err) {
      if (err instanceof AxiosError) {
        alert(err?.response?.data?.error)
        console.log(err);
      } else {
        console.log(err)
        alert("something went wrong")
      }
    }
  }

  if (!isLoading && signupApiRes) {
    router.push("/login")
  }

  return (
    <Card className="min-w-xl p-3 py-8 pb-6 mx-auto mt-16">
      <CardContent>
        <div className="font-semibold leading-none tracking-tight text-2xl">Onboard Company</div>
        <div className="mx-auto my-8 flex items-center">
          {steps.map((step) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={clsx(
                    `w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors`,
                    step.id < currentStep.id
                      ? 'bg-green-500 text-white'
                      : step.id === currentStep.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                  )}
                >
                  {step.id < currentStep.id ? <Check className="w-5 h-5" /> : step.id}
                </div>
              </div>
              {step.id < 3 && (
                <div
                  className={
                    clsx(
                      'flex-1 h-1 mx-2 transition-colors',
                      step.id < currentStep.id ? 'bg-green-500' : 'bg-gray-200'
                    )
                  }
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <form
          className="space-y-4 mx-auto"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {currentStep.id === 1 && <CompanyProfile formControl={form.control} />}
          {currentStep.id === 2 && <CompanyAccount formControl={form.control} />}
          {currentStep.id === 3 && <CompanyMetadata formControl={form.control} />}
          <div className="mt-6 space-x-4">
            {currentStep.id !== 1 && (
              <Button
                className="w-24"
                type="button"
                variant="outline"
                onClick={handlePrev}
              >Prev</Button>
            )}
            {currentStep.id !== 3 && (
              <Button
                className="w-24"
                type="button"
                onClick={handleNext}
              >Next</Button>
            )}
            {currentStep.id === 3 && (
              <Button
                className="w-24"
                type="submit"
              >{!isLoading ? "Submit" : <Spinner />}</Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default OnboardCompany
