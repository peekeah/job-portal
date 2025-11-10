"use client"
import { ChangeEvent, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Button } from '../ui/button';
import { CustomSelect } from '../ui/select';
import { Input } from '../ui/input';
import { useRouter } from 'next/navigation';

const initialFormData = {
  user_type: 'company',
  name: '',
  founding_year: '',
  company_type: '',
  email: '',
  password: '',
  contact_no: '',
  website: '',
  address: '',
  size: '1-10',
  bio: ''
}

function CompanySignupForm() {

  const [formData, setFormData] = useState(initialFormData)
  const router = useRouter()

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    try {
      // #FIXME: Need to fix the enum validation for size
      await axios.post("/api/auth/signup", {
        ...formData,
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

  return (
    <div className="grid grid-cols-2 gap-4">
      <Input
        label="Company Name"
        placeholder="Enter company name"
        name="name"
        value={formData.name}
        onChange={handleChange}
      />

      <Input
        label="Year Founded"
        type="number"
        placeholder="Enter founding year"
        name="founding_year"
        value={formData.founding_year}
        onChange={handleChange}
      />

      <Input
        label="Company Type"
        placeholder="Enter company type"
        name="company_type"
        value={formData.company_type}
        onChange={handleChange}
      />

      <Input
        label="Email"
        type="email"
        placeholder="Enter company email"
        name="email"
        value={formData.email}
        onChange={handleChange}
      />

      <Input
        label="Password"
        type="password"
        placeholder="Enter password"
        name="password"
        value={formData.password}
        onChange={handleChange}
      />

      <Input
        label="Phone No"
        type="number"
        placeholder="Enter contact number"
        name="contact_no"
        value={formData.contact_no}
        onChange={handleChange}
      />

      <Input
        label="Website"
        placeholder="Enter company website"
        name="website"
        value={formData.website}
        onChange={handleChange}
      />

      <Input
        label="Address"
        placeholder="Enter state"
        name="address"
        value={formData.address}
        onChange={handleChange}
      />
      <Input
        label="Bio"
        placeholder="Enter company bio"
        name="bio"
        value={formData.bio}
        onChange={handleChange}
      />
      <CustomSelect
        label='Company Size'
        value={formData.size}
        className='w-48'
        onValueChange={
          (val) => setFormData(prev => ({
            ...prev, ["size"]: val
          }))
        }
        options={[
          { value: '1-10', label: '1-10' },
          { value: '10-50', label: '10-50' },
          { value: '50-100', label: '50-100' },
          { value: '100+', label: '100+' },
        ]}
      />
      <div className='flex gap-2 py-2'>
        <Button onClick={handleSubmit}>Submit</Button>
        <Button variant='destructive' onClick={handleReset}>Reset</Button>
      </div>
    </div>

  )
}

export default CompanySignupForm
