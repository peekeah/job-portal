"use client"
import axios, { AxiosError } from "axios";
import React, { ChangeEvent, useState } from "react";
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

const initialFormData = {
  name: '',
  founding_year: '',
  company_type: '',
  email: '',
  password: '',
  contact_no: '',
  website: '',
  address: '',
  size: 'SIZE_1_10',
  bio: ''
}

export type CompanySignupPayload = {
  name: string;
  founding_year: string;
  company_type: string;
  email: string;
  password: string;
  contact_no: string;
  website: string;
  address: string;
  size: string;
  bio: string;
}

type Step = {
  id: number;
  title: string;
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

  const [formData, setFormData] = useState<CompanySignupPayload>(initialFormData)

  const { data: signupApiRes, isMutating: isLoading } = useSWRMutation("/api/auth/signup", signupApiCall)

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    try {
      await axios.post("/api/auth/signup", {
        ...formData,
        user_type: "company",
        founding_year: +formData.founding_year,
      });

      alert("successful signup!")
      handleReset()
      router.push("/login")

    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        alert(err?.response?.data?.error)
        console.log(err);
      } else {
        console.log(err)
        alert("something went wrong")
      }
    }
  }

  const handleReset = async () => {
    setFormData(() => initialFormData)
  }

  const handleNext = () => {
    setCurrentStep(prev => prev.id === 3 ? prev : steps[prev.id])
  }

  const handlePrev = () => {
    setCurrentStep(prev => prev?.id === 1 ? prev : steps[prev.id - 2])
  }

  if (!isLoading && signupApiRes) {
    router.push("/login")
    alert("Signup successful")
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

        <div className="space-y-4 mx-auto">
          {
            currentStep?.id === 1 && (
              <CompanyProfile
                formData={formData}
                setFormData={setFormData}
                handleChange={handleChange}
              />)}
          {currentStep?.id === 2 && (
            <CompanyAccount
              formData={formData}
              setFormData={setFormData}
              handleChange={handleChange}
            />)}
          {currentStep?.id === 3 && (
            <CompanyMetadata
              formData={formData}
              setFormData={setFormData}
              handleChange={handleChange}
            />)
          }
          <div className="mt-6 space-x-4">
            {currentStep.id !== 1 && <Button className="w-24" variant="outline" onClick={handlePrev}>Prev</Button>}
            {currentStep.id !== 3 && <Button className="w-24" onClick={handleNext}>Next</Button>}
            {currentStep.id === 3 && <Button className="w-24" onClick={handleSubmit}>{!isLoading ? "Submit" : <Spinner />}</Button>}
          </div>
        </div>
      </CardContent>
    </Card >
  )
}

export default OnboardCompany
