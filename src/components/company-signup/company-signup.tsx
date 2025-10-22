"use client"
import { ChangeEvent, useState } from 'react';
import axios from 'axios';
import { Button } from '../ui/button';
import { CustomSelect } from '../ui/select';
import { Input } from '../ui/input';

const initialFormData = {
  userType: 'company',
  name: '',
  founding_year: '',
  company_type: '',
  email: '',
  password: '',
  contact_no: '',
  website: '',
  state: '',
  size: '',
  bio: ''
}

function CompanySignupForm() {

  const [formData, setFormData] = useState(initialFormData)

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {

    try {
      const response = await axios.post("/api/auth/signup", formData);

      const token = response.data.data.token;
      alert("successful signup!")
      handleReset()

    } catch (err) {
      alert(err.response.data.error)
      console.log(err);
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
        label="State"
        placeholder="Enter state"
        name="state"
        value={formData.state}
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
        value={"1-10"}
        className='w-48'
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
