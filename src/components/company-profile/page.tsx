"use client"
import useSWR from 'swr';
import axios from 'axios';
import { useState } from 'react';
import { redirect } from 'next/navigation';

import { fetcher } from '@/lib/fetcher';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { CustomSelect } from '../ui/select';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Heading } from '../ui/typography';
import { Textarea } from '../ui/textarea';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { combinedCompanySchema } from '../onboard-company/types';
import { CompanySize } from '@prisma/client';
import z from 'zod';

const profileSchema = z
  .object({
    id: z.uuid(),
  })
  .extend(
    combinedCompanySchema.omit({ password: true }).shape
  )

type CompanyProfile = z.infer<typeof profileSchema>

const initialCompanyValues: CompanyProfile = {
  id: "",
  name: "",
  founding_year: 0,
  company_type: "",
  email: "",
  contact_no: "",
  website: "",
  address: "",
  size: CompanySize.SIZE_1_10,
  bio: "",
};

export const companySizeMap = new Map([
  ["SIZE_1_10", "1-10"],
  ["SIZE_10_50", "10-50"],
  ["SIZE_50_100", "50-100"],
  ["SIZE_100_PLUS", "100+"]
]);

const postProfileApiCall = async (url: string, { arg: { payload: payload } }: { arg: { payload: CompanyProfile } }) => {
  try {
    const res = await axios.post(url, payload)

    if (!res?.data?.status) {
      throw new Error(res?.data?.error || "error while saving")
    }

    alert("successfully saved data")

  } catch (err) {
    console.log("err:", err)
    alert("error while saving data")
  }
}

export default function CompanyProfile() {
  const { data, isLoading } = useSWR<{ data: CompanyProfile }>('/api/company/profile', fetcher)

  const { data: postProfileData, isMutating: postProfileLoading } = useSWR<{ data: CompanyProfile }>('/api/company/profile', fetcher)


  const company = data?.data;

  if (!isLoading && !company) {
    redirect("/dashboard")
  }

  const [editContent, setEditContent] = useState<boolean>(false)

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: initialCompanyValues,
    values: company
  })

  const toggleEdit = () => {
    setEditContent((prev) => !prev)
  }

  const onSubmit = async (payload: CompanyProfile) => {
    try {
      const res = await axios.post("/api/company/profile", payload)

      if (!res?.data?.status) {
        throw new Error(res?.data?.error || "error while saving")
      }

      alert("successfully saved data")
      toggleEdit()

    } catch (err) {
      console.log("err:", err)
    }
  }

  const onCancelChanges = () => {
    form.reset()
    setEditContent(() => false);
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className='p-5 sm:p-7 md:px-10 lg:px-5 h-full w-full'
    >
      <div className='flex w-full'>
        <h1 className='font-semibold text-2xl'>Company Profile</h1>
        <div className='mx-auto flex justify-end flex-1'>
          {
            editContent ?
              <div className='space-x-3'>
                <Button type="submit">Save</Button>
                <Button
                  type='button'
                  onClick={onCancelChanges}
                  variant={"destructive"}
                >Cancel</Button>
              </div> :
              <Button type='button' onClick={toggleEdit}>Edit</Button>
          }
        </div>
      </div>
      <div className='max-w-4xl mt-5 space-y-5'>
        <Card>
          <CardContent>
            <div className='flex gap-4 items-center mb-3'>
              <Avatar className='size-28'>
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>Job</AvatarFallback>
              </Avatar>
              <div className='space-y-2'>
                <div className='text-2xl font-bold'>{company?.name}</div>
                <div className='space-x-2 font-medium'>
                  <Badge
                    variant={"outline"}
                    className='rounded-full px-2 py-1 font-semibold'
                  >{company?.company_type}</Badge>
                  <Badge
                    variant={"outline"}
                    className='rounded-full px-2 py-1 font-semibold'
                  >{companySizeMap.get(company?.size || "") || "0"} employees</Badge>
                  <Badge
                    variant={"outline"}
                    className='rounded-full px-2 py-1 font-semibold'
                  >Founded {company?.founding_year}</Badge>
                </div>
                <div>
                  <Button variant={"outline"}>Change logo</Button>
                </div>
              </div>
            </div>
            <div>
              <Controller
                name="bio"
                control={form.control}
                render={({ field, fieldState: { error, invalid } }) => (
                  <Textarea
                    {...field}
                    rows={4}
                    label='Description'
                    placeholder='Description'
                    aria-invalid={invalid}
                    name="bio"
                    className="text-neutral-500"
                    value={field.value ? String(field.value) : ""}
                    disabled={!editContent}
                    error={
                      error ? error.message : ""
                    }
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Heading variant='h4' className='mb-3'>Contact Information</Heading>
            <div className='grid grid-cols-2 gap-5'>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState: { error, invalid } }) => (
                  <Input
                    {...field}
                    label="Email"
                    aria-invalid={invalid}
                    placeholder="Email"
                    disabled={!editContent}
                    error={
                      error ? error.message : ""
                    }
                  />
                )}
              />
              <Controller
                name="contact_no"
                control={form.control}
                render={({ field, fieldState: { error, invalid } }) => (
                  <Input
                    {...field}
                    label="Contact No"
                    aria-invalid={invalid}
                    placeholder="Email"
                    disabled={!editContent}
                    error={
                      error ? error.message : ""
                    }
                  />
                )}
              />
              <Controller
                name="address"
                control={form.control}
                render={({ field, fieldState: { error, invalid } }) => (
                  <Input
                    {...field}
                    label="Location"
                    aria-invalid={invalid}
                    placeholder="Location"
                    disabled={!editContent}
                    error={
                      error ? error.message : ""
                    }
                  />
                )}
              />
              <Controller
                name="website"
                control={form.control}
                render={({ field, fieldState: { error, invalid } }) => (
                  <Input
                    {...field}
                    label="Website"
                    aria-invalid={invalid}
                    placeholder="Location"
                    value={field.value ? String(field.value) : ""}
                    disabled={!editContent}
                    error={
                      error ? error.message : ""
                    }
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>
        {/*TODO: Add these fields in backend*/}
        <Card>
          <CardContent>
            <Heading variant='h4' className='mb-3'>Social Media</Heading>
            <div className='grid grid-cols-2 gap-5'>
              <Input
                label="LinkedIn"
                disabled={!editContent}
              />
              <Input
                label="Twitter"
                disabled={!editContent}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Heading variant='h4' className='mb-3'>Company Details</Heading>
            <div className='grid grid-cols-2 gap-5'>
              <Controller
                name="company_type"
                control={form.control}
                render={({ field, fieldState: { error, invalid } }) => (
                  <Input
                    {...field}
                    label="Industry/Domain"
                    aria-invalid={invalid}
                    placeholder="Industry/Domain"
                    value={field.value ? String(field.value) : ""}
                    disabled={!editContent}
                    error={
                      error ? error.message : ""
                    }
                  />
                )}
              />
              <Controller
                name="size"
                control={form.control}
                render={({ field, fieldState: { invalid } }) => (
                  <CustomSelect
                    {...field}
                    label="Company Size"
                    aria-invalid={invalid}
                    disabled={!editContent}
                    onValueChange={(val) => {
                      field.onChange((prev) => ({ ...prev, size: val }))
                    }}
                    options={[
                      { value: "SIZE_1_10", label: "1-10" },
                      { value: "SIZE_10_50", label: "10-50" },
                      { value: "SIZE_50_100", label: "50-100" },
                      { value: "SIZE_100_PLUS", label: "100+" },
                    ]}
                  />
                )}
              />

              <Controller
                name="founding_year"
                control={form.control}
                render={({ field, fieldState: { error, invalid } }) => (
                  <Input
                    {...field}
                    label="Year Founded"
                    type="number"
                    aria-invalid={invalid}
                    placeholder="Year founded"
                    disabled={!editContent}
                    onChange={(e) => field.onChange(+e.target.value)}
                    error={
                      error ? error.message : ""
                    }
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}

