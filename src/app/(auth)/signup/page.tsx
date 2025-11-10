"use client"
import CompanySignupForm from "@/components/company-signup/company-signup"
import StudentSignupForm from "@/components/student-signup/student-signup"
import { CustomSelect } from "@/components/ui/select"
import { useState } from "react"

const Singup = () => {

  const [selectedRole, setSelectedRole] = useState<"applicant" | "company">("applicant")

  return (
    <div className="space-y-4">
      <div className="w-full">
        <CustomSelect
          className="w-48"
          label="Select Role"
          placeholder="Select Role"
          options={[
            { value: "applicant", label: "Student" },
            { value: "company", label: "Company" },
          ]}
          value={selectedRole}
          onValueChange={(val) => {
            setSelectedRole(val as "applicant" | "company")
          }}
        />
      </div>
      {
        selectedRole === "applicant" ? (
          <StudentSignupForm />
        ) : (
          <CompanySignupForm />
        )
      }
    </div>
  )
}

export default Singup
