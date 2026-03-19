import { CompanySignupPayload } from './types';
import { Input } from '../ui/input';
import { Control, Controller } from 'react-hook-form';

const CompanyMetadata = ({
  formControl,
}: {
  formControl: Control<CompanySignupPayload>;
}) => {
  return (
    <div className="space-y-5">
      <Controller
        name="website"
        control={formControl}
        render={({ field, fieldState: { error, invalid } }) => (
          <Input
            {...field}
            value={field.value ?? ''}
            label="Website"
            placeholder="Enter company website"
            aria-invalid={invalid}
            error={error ? error.message : ''}
          />
        )}
      />
      <Controller
        name="address"
        control={formControl}
        render={({ field, fieldState: { error, invalid } }) => (
          <Input
            {...field}
            label="Address"
            placeholder="Enter state"
            aria-invalid={invalid}
            error={error ? error.message : ''}
          />
        )}
      />
      <Controller
        name="bio"
        control={formControl}
        render={({ field, fieldState: { error, invalid } }) => (
          <Input
            {...field}
            value={field.value ?? ''}
            aria-invalid={invalid}
            label="Bio"
            placeholder="Enter company bio"
            error={error ? error.message : ''}
          />
        )}
      />
    </div>
  );
};

export default CompanyMetadata;
