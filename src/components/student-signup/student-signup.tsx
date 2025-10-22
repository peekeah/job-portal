"use client"
import axios from 'axios';
import { ChangeEvent, FormEventHandler, useState } from 'react';

import { Input } from '../ui/input';
import { Button } from '../ui/button';

const initialFormState = {
  name: '',
  mobile: '',
  email: '',
  password: '',
  profile_pic: '',
  college_name: '',
  college_branch: '',
  college_joining_year: '',
}

function StudentSignupForm() {

  const [formData, setFormData] = useState(initialFormState);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit: FormEventHandler = async (e) => {
    e.preventDefault()

    const college = {
      name: formData.college_name,
      branch: formData.college_branch,
      joining_year: formData.college_joining_year,
    }

    const payload = {
      ...formData, college, userType: "student"
    }

    try {
      const url = `/api/auth/signup`;
      const response = await axios.post(url, payload);
      console.log("resp:", response)

      const token = response.data.data.token;
      alert("successfully signup!")
      handleReset()

    } catch (err) {
      alert(err.response.data.error)
      console.log(err);
    }
  }

  const handleReset = async () => {
    setFormData(() => initialFormState)
  }

  return (
    <div className='space-y-8'>
      <div className='grid grid-cols-2 gap-4'>
        <Input
          label="Name"
          placeholder='Enter your full name'
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
        <Input
          label="Mobile"
          placeholder='Mobile Number'
          name="mobile"
          value={formData.mobile}
          onChange={handleChange}
        />
        <Input
          label="Email"
          placeholder='Email Address'
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        <Input
          label="Password"
          placeholder='Password'
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
        <Input
          label="College Name"
          placeholder='College Name'
          type="text"
          name="college_name"
          value={formData.college_name}
          onChange={handleChange}
        />
        <Input
          label="College Branch"
          placeholder='College Branch'
          name="college_branch"
          value={formData.college_branch}
          onChange={handleChange}
        />
        <Input
          label="College Joining Year"
          placeholder='College Joining Year'
          type="number"
          name="college_joining_year"
          value={formData.college_joining_year}
          onChange={handleChange}
        />

      </div>
      <div className='flex gap-2'>
        <Button onClick={handleSubmit}>Submit</Button>
        <Button className='bg-red-300 hover:bg-red-500 transition-all' onClick={handleReset}>Reset</Button>
      </div>
    </div>

  )
}

export default StudentSignupForm
