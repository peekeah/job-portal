"use client"
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { ChangeEventHandler, useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import axios from 'axios';

type Company = {
  _id: string;
  name: string;
  founding_year: string;
  company_type: string;
  email: string;
  contact_no: string;
  website: string;
  state: string;
  size: string;
  bio: string;
}

const initialCompany: Company = {
  _id: "",
  name: "",
  founding_year: "",
  company_type: "",
  email: "",
  contact_no: "",
  website: "",
  state: "",
  size: "",
  bio: "",
};

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


  const onInputChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const onSave = async () => {
    try {
      const res = await axios.post("/api/company/profile", formData)

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
            <div>State</div>
            <Input
              name="state"
              value={formData?.state}
              onChange={onInputChange}
            />
            <div>Company Size</div>
            <Input
              name="size"
              value={formData?.size}
              onChange={onInputChange}
            />
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
            <div>State</div>
            <div>{formData?.state}</div>
            <div>Company Size</div>
            <div>{formData?.size}</div>
            <div>Company Bio</div>
            <div>{formData?.bio}</div>
          </div>
      }
    </div >
  )
}

