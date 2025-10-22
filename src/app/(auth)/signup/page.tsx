"use client"
import CompanySignupForm from "@/components/company-signup/company-signup"
import StudentSignupForm from "@/components/student-signup/student-signup"
import { CustomSelect } from "@/components/ui/select"
import { useState } from "react"

const Singup = () => {

  const [selectedRole, setSelectedRole] = useState<"student" | "company">("company")

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
