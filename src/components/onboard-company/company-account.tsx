import { CompanySignupPayload } from './types';
import { Input } from '../ui/input';
import { Control, Controller } from 'react-hook-form';

const CompanyAccount = ({
  formControl,
}: {
  formControl: Control<CompanySignupPayload>;
}) => {
  return (
    <div className="space-y-5">
      <Controller
        name="email"
        control={formControl}
        render={({ field, fieldState: { error, invalid } }) => (
          <Input
            {...field}
            label="Email"
            type="email"
            placeholder="Enter company email"
            aria-invalid={invalid}
            error={error ? error.message : ''}
          />
        )}
      />
      <Controller
        name="password"
        control={formControl}
        render={({ field, fieldState: { error, invalid } }) => (
          <Input
            {...field}
            label="Password"
            type="password"
            placeholder="Enter password"
            aria-invalid={invalid}
            error={error ? error.message : ''}
          />
        )}
      />
      <Controller
        name="contact_no"
        control={formControl}
        render={({ field, fieldState: { error, invalid } }) => (
          <Input
            {...field}
            label="Phone No"
            type="number"
            placeholder="Enter contact number"
            aria-invalid={invalid}
            error={error ? error.message : ''}
          />
        )}
      />
    </div>
  );
};

export default CompanyAccount;
