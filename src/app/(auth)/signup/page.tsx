"use client"
import CompanySignupForm from "@/components/company-signup/company-signup"
import Container from "@/components/container"
import SignupComponet from "@/components/signup"
import StudentSignupForm from "@/components/student-signup/student-signup"
import { CustomSelect } from "@/components/ui/select"
import axios from "axios"
import { ChangeEvent, useState } from "react"

const Singup = () => {

  const [selectedRole, setSelectedRole] = useState<"student" | "company">("company")
  const [formData, setFormData] = useState({
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
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {

    try {
      const url = `${process.env.REACT_APP_BACKEND_URL}/company/signup`;
      const response = await axios.post(url, formData);

      const token = response.data.data.token;

    } catch (err) {
      alert(err.response.data.error)
      console.log(err);
    }
  }

  const handleReset = async () => {
    setFormData({
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
    })
  }

  return (
    <div className="space-y-4">
      <div className="w-full">
        <CustomSelect
          className="w-48"
          label="Select Role"
          placeholder="Select Role"
          options={[
            { value: "student", label: "Student" },
            { value: "company", label: "Company" },
          ]}
          value={selectedRole}
          onValueChange={(val) => {
            setSelectedRole(val as "student" | "company")
          }}
        />
      </div>
      {
        selectedRole === "student" ? (
          <StudentSignupForm />
        ) : (
          <CompanySignupForm />
        )
      }
    </div>
  )
}

export default Singup
