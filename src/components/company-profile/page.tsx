"use client"
import useSWR from 'swr';
import axios from 'axios';
import { ChangeEventHandler, useEffect, useState } from 'react';
import { redirect } from 'next/navigation';

import { fetcher } from '@/lib/fetcher';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { CustomSelect } from '../ui/select';

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
  const { data, error, isLoading } = useSWR<{ data: Company }>('/api/company/profile', fetcher)
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

  return (
    <div className='p-8'>
      <h1 className='pb-3 font-semibold text-2xl'>Company Profile</h1>
      <div className='w-1/2 mx-auto flex justify-center'>
        {
          editContent ?
            <Button onClick={onSave}>Save</Button> :
            <Button onClick={toggleEdit}>Edit</Button>
        }
      </div>
      {
        editContent ?
          <div className='grid grid-cols-2 place-content-center w-1/2 mx-auto mt-42 gap-3'>
            <div>Company Name</div>
            <Input
              name="name"
              value={formData?.name}
              onChange={onInputChange}
            />
            <div>Year Founded</div>
            <Input
              type="number"
              name="founding_year"
              value={formData?.founding_year}
              onChange={onInputChange}
            />
            <div>Company Type</div>
            <Input
              name="company_type"
              value={formData?.company_type}
              onChange={onInputChange}
            />
            <div>Email</div>
            <Input
              name="email"
              value={formData?.email}
              onChange={onInputChange}
            />
            <div>Phone No</div>
            <Input
              name="contact_no"
              value={formData?.contact_no}
              onChange={onInputChange}
            />
            <div>Website</div>
            <Input
              name="website"
              value={formData?.website}
              onChange={onInputChange}
            />
            <div>Address</div>
            <Input
              name="address"
              value={formData?.address}
              onChange={onInputChange}
            />
            <div>Company Size</div>
            <CustomSelect
              value={formData.size}
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
            <div>Company Bio</div>
            <Input
              name="bio"
              value={formData?.bio}
              onChange={onInputChange}
            />
          </div> :
          <div className='grid grid-cols-2 place-content-center w-1/2 mx-auto mt-42 gap-3'>
            <div>Company Name</div>
            <div>{formData?.name}</div>
            <div>Year Founded</div>
            <div>{formData?.founding_year}</div>
            <div>Company Type</div>
            <div>{formData?.company_type}</div>
            <div>Email</div>
            <div>{formData?.email}</div>
            <div>Phone No</div>
            <div>{formData?.contact_no}</div>
            <div>Website</div>
            <div>{formData?.website}</div>
            <div>Address</div>
            <div>{formData?.address}</div>
            <div>Company Size</div>
            <div>{companySizeMap.get(formData?.size)}</div>
            <div>Company Bio</div>
            <div>{formData?.bio}</div>
          </div>
      }
    </div >
  )
}

