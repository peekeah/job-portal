import { ChangeEvent, Dispatch, SetStateAction } from "react";
import { CompanySignupPayload } from "./page"
import { Input } from "../ui/input";
import { CustomSelect } from "../ui/select";

type Props = {
  formData: CompanySignupPayload;
  setFormData: Dispatch<SetStateAction<CompanySignupPayload>>;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const CompanyProfile = ({ formData, handleChange }: Props) => {
  return (
    <div className="space-y-5">
      <Input
        label="Company Name"
        placeholder="Enter company name"
        name="name"
        value={formData.name}
        onChange={handleChange}
      />

      <Input
        label="Company Type"
        placeholder="Enter company type"
        name="company_type"
        value={formData.company_type}
        onChange={handleChange}
      />

      <div className="flex gap-3">
        <Input
          label="Year Founded"
          type="number"
          placeholder="Enter founding year"
          name="founding_year"
          value={formData.founding_year}
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
            { value: 'SIZE_1_10', label: '1-10' },
            { value: 'SIZE_10_50', label: '10-50' },
            { value: 'SIZE_50_100', label: '50-100' },
            { value: 'SIZE_100_PLUS', label: '100+' },
          ]}
        />
      </div>
    </div>

  )
}

export default CompanyProfile
