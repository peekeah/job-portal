import { ChangeEvent, Dispatch, SetStateAction } from "react";
import { CompanySignupPayload } from "./page";
import { Input } from "../ui/input";

type Props = {
  formData: CompanySignupPayload;
  setFormData: Dispatch<SetStateAction<CompanySignupPayload>>;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const CompanyAccount = ({ formData, handleChange }: Props) => {
  return (
    <div className="space-y-5">
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
    </div>
  )
}

export default CompanyAccount;
