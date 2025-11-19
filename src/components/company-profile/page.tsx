"use client"
import useSWR from 'swr';
import axios from 'axios';
import { ChangeEventHandler, useEffect, useState } from 'react';
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

type Company = {
  id: string;
  name: string;
  founding_year: string;
  company_type: string;
  email: string;
  contact_no: string;
  website: string;
  address: string;
  size: string;
  bio: string;
}

const initialCompany: Company = {
  id: "",
  name: "",
  founding_year: "",
  company_type: "",
  email: "",
  contact_no: "",
  website: "",
  address: "",
  size: "",
  bio: "",
};

export const companySizeMap = new Map([
  ["SIZE_1_10", "1-10"],
  ["SIZE_10_50", "10-50"],
  ["SIZE_50_100", "50-100"],
  ["SIZE_100_PLUS", "100+"]
]);

export default function CompanyProfile() {
  const { data, isLoading } = useSWR<{ data: Company }>('/api/company/profile', fetcher)
  const company = data?.data;

  if (!isLoading && !company) {
    redirect("/dashboard")
  }

  const [editContent, setEditContent] = useState<boolean>(false)
  const [formData, setFormData] = useState<Company>(initialCompany)

  useEffect(() => {
    if (company) {
      setFormData(() => company)
    }
  }, [company])

  const toggleEdit = () => {
    setEditContent((prev) => !prev)
  }


  const onInputChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const onSave = async () => {
    try {
      const res = await axios.post("/api/company/profile", {
        ...formData,
        founding_year: +formData.founding_year
      })

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
    setFormData(prev => company ? company : prev);
    setEditContent(() => false);
  }

  return (
    <div className='p-8 max-w-4xl mx-auto'>
      <h1 className='pb-3 font-semibold text-2xl'>Company Profile</h1>
      <div className='mx-auto mb-4 flex justify-end'>
        {
          editContent ?
            <div className='space-x-3'>
              <Button onClick={onSave}>Save</Button>
              <Button
                onClick={onCancelChanges}
                variant={"destructive"}
              >Cancel</Button>
            </div> :
            <Button onClick={toggleEdit}>Edit</Button>
        }
      </div>
      <div className='space-y-5'>
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
                  >{companySizeMap.get(company?.size!)} employees</Badge>
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
              <Textarea
                rows={4}
                label='Description'
                name="bio"
                className="text-neutral-500"
                value={formData?.bio}
                onChange={onInputChange}
                disabled={!editContent}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Heading variant='h4' className='mb-3'>Contact Information</Heading>
            <div className='grid grid-cols-2 gap-5'>
              <Input
                label="Email"
                name="email"
                value={formData?.email}
                onChange={onInputChange}
                disabled={!editContent}
              />
              <Input
                label="Contact No"
                name="contact_no"
                value={formData?.contact_no}
                onChange={onInputChange}
                disabled={!editContent}
              />
              <Input
                label="Location"
                name="address"
                value={formData?.address}
                onChange={onInputChange}
                disabled={!editContent}
              />
              <Input
                label="Website"
                name="website"
                value={formData?.website}
                onChange={onInputChange}
                disabled={!editContent}
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
              <Input
                label="Industry/Domain"
                name="company_type"
                value={formData?.company_type}
                onChange={onInputChange}
                disabled={!editContent}
              />
              <CustomSelect
                label="Company Size"
                value={formData.size}
                disabled={!editContent}
                onValueChange={(val) => {
                  setFormData((prev) => ({ ...prev, size: val }))
                }}
                options={[
                  { value: "SIZE_1_10", label: "1-10" },
                  { value: "SIZE_10_50", label: "10-50" },
                  { value: "SIZE_50_100", label: "50-100" },
                  { value: "SIZE_100_PLUS", label: "100+" },
                ]}
              >
              </CustomSelect>

              <Input
                label="Year Founded"
                type="number"
                name="founding_year"
                value={formData?.founding_year}
                onChange={onInputChange}
                disabled={!editContent}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div >
  )
}

