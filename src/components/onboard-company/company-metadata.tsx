import { ChangeEvent, Dispatch, SetStateAction } from "react";
import { CompanySignupPayload } from "./page";
import { Input } from "../ui/input";

type Props = {
  formData: CompanySignupPayload;
  setFormData: Dispatch<SetStateAction<CompanySignupPayload>>;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const CompanyMetadata = ({ formData, handleChange }: Props) => {
  return (
    <div className="space-y-5">
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
    </div>
  )
}

export default CompanyMetadata
