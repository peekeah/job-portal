import { Input } from '../ui/input';
import { CustomSelect } from '../ui/select';
import { Control, Controller } from 'react-hook-form';
import { CompanySignupPayload } from './types';

const CompanyProfile = ({
  formControl,
}: {
  formControl: Control<CompanySignupPayload>;
}) => {
  return (
    <div className="space-y-5">
      <Controller
        name="name"
        control={formControl}
        render={({ field, fieldState: { error, invalid } }) => (
          <Input
            {...field}
            label="Company Name"
            aria-invalid={invalid}
            placeholder="Enter company name"
            error={error ? error.message : ''}
          />
        )}
      />
      <Controller
        name="company_type"
        control={formControl}
        render={({ field, fieldState: { error, invalid } }) => (
          <Input
            {...field}
            label="Company Type"
            placeholder="Enter company type"
            aria-invalid={invalid}
            error={error ? error.message : ''}
          />
        )}
      />
      <div className="flex gap-3">
        <Controller
          name="founding_year"
          control={formControl}
          render={({ field, fieldState: { error, invalid } }) => (
            <Input
              {...field}
              onChange={(e) =>
                !e.target.value ? null : field.onChange(Number(e.target.value))
              }
              label="Year Founded"
              type="number"
              placeholder="Enter founding year"
              aria-invalid={invalid}
              error={error ? error.message : ''}
            />
          )}
        />

        <Controller
          name="size"
          control={formControl}
          render={({ field }) => (
            <CustomSelect
              {...field}
              label="Company Size"
              className="w-48"
              onValueChange={field.onChange}
              options={[
                { value: 'SIZE_1_10', label: '1-10' },
                { value: 'SIZE_10_50', label: '10-50' },
                { value: 'SIZE_50_100', label: '50-100' },
                { value: 'SIZE_100_PLUS', label: '100+' },
              ]}
            />
          )}
        />
      </div>
    </div>
  );
};

export default CompanyProfile;
