'use client';
import useSWR from 'swr';
import axios from 'axios';
import { useState } from 'react';
import { redirect } from 'next/navigation';

import { fetcher } from '@/lib/fetcher';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { CustomSelect } from '../ui/select';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Heading } from '../ui/typography';
import { Textarea } from '../ui/textarea';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { combinedCompanySchema } from '../onboard-company/types';
import { CompanySize } from '@prisma/client';
import z from 'zod';
import useSWRMutation from 'swr/mutation';
import { toast } from 'sonner';
import { formatInitials } from '@/lib/formater';
import { useUploadThing } from '@/lib/uploadthing-client';
import { Spinner } from '../ui/spinner';
import { IconDeviceFloppy, IconPencil, IconX } from '@tabler/icons-react';

const profileSchema = z
  .object({
    id: z.uuid(),
  })
  .extend(combinedCompanySchema.omit({ password: true }).shape);

type CompanyProfile = z.infer<typeof profileSchema>;

const initialCompanyValues: CompanyProfile = {
  id: '',
  name: '',
  founding_year: 0,
  company_type: '',
  email: '',
  profile_pic: '',
  contact_no: '',
  website: '',
  linkedIn: '',
  twitter: '',
  address: '',
  size: CompanySize.SIZE_1_10,
  bio: '',
};

export const companySizeMap = new Map([
  ['SIZE_1_10', '1-10'],
  ['SIZE_10_50', '10-50'],
  ['SIZE_50_100', '50-100'],
  ['SIZE_100_PLUS', '100+'],
]);

const postProfileApiCall = async (
  url: string,
  { arg: { payload: payload } }: { arg: { payload: CompanyProfile } },
) => {
  try {
    const res = await axios.post(url, payload);

    if (!res?.data?.status) {
      throw new Error(res?.data?.error || 'error while saving');
    }

    toast.success('successfully saved data');
  } catch (_err) {
    toast.error('error while saving data');
  }
};

export default function CompanyProfile() {
  const { data, isLoading, mutate } = useSWR<{ data: CompanyProfile }>(
    '/api/company/profile',
    fetcher,
  );

  const { trigger: postProfileTrigger } = useSWRMutation(
    '/api/company/profile',
    postProfileApiCall,
  );

  const { startUpload, isUploading } = useUploadThing('avatarUploader');

  const company = data?.data;

  if (!isLoading && !company) {
    redirect('/dashboard');
  }

  const [editContent, setEditContent] = useState<boolean>(false);

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: initialCompanyValues,
    values: company,
  });

  const toggleEdit = () => {
    setEditContent((prev) => !prev);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const res = await startUpload([file]);
    if (!res?.[0]?.ufsUrl) {
      toast.error('Failed to upload avatar');
      return;
    }

    await axios.post('/api/company/profile', { profile_pic: res[0].ufsUrl });
    toast.success('Avatar updated');
    mutate(); // revalidate SWR
  };

  const onSubmit = async (payload: CompanyProfile) => {
    postProfileTrigger({ payload });
    setEditContent(false);
  };

  const onCancelChanges = () => {
    form.reset();
    setEditContent(() => false);
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="h-full w-full p-5 sm:p-7 md:px-10 lg:px-5"
    >
      <div className="flex w-full">
        <h1 className="text-2xl font-semibold">Company Profile</h1>
      </div>
      <div className="mt-5 max-w-4xl space-y-5">
        <Card className="py-4 sm:py-5 lg:py-6">
          <CardContent className="px-4 sm:px-5 lg:px-6">
            <div className="flex">
              <div className="mb-3 flex items-center gap-2 sm:gap-3 lg:gap-4">
                <div className="relative">
                  <Avatar className="size-16 border lg:size-20">
                    <AvatarImage
                      src={company?.profile_pic ?? ''}
                      alt={company?.name}
                    />
                    <AvatarFallback>
                      <span className="font-sans text-xl font-bold lg:text-5xl">
                        {formatInitials((company?.name as string) || '')}
                      </span>
                    </AvatarFallback>
                  </Avatar>

                  <label className="border-primary bg-background hover:bg-background/80 absolute right-0 bottom-0 z-10 flex size-6 cursor-pointer items-center justify-center rounded-full border p-0.5 shadow-sm transition">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={isUploading}
                    />
                    <span className="rounded-full">
                      {isUploading ? (
                        <Spinner className="text-primary" />
                      ) : (
                        <>
                          <IconPencil className="text-primary size-full" />
                        </>
                      )}
                    </span>
                  </label>
                </div>

                <div className="space-y-0.5">
                  <div className="text-lg font-bold lg:text-xl">
                    {company?.name}
                  </div>
                  <div className="flex gap-2 font-medium">
                    <Badge className="border-primary text-primary bg-primary/10 rounded-xl">
                      {company?.company_type}
                    </Badge>
                    <Badge className="border-primary text-primary bg-primary/10 hidden rounded-xl sm:block">
                      {companySizeMap.get(company?.size || '') || '0'}
                    </Badge>
                    <Badge className="border-primary text-primary bg-primary/10 hidden rounded-xl sm:block">
                      Founded {company?.founding_year}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mx-auto flex flex-1 justify-end py-4">
                {editContent ? (
                  <>
                    <div className="hidden space-x-3 sm:block">
                      <Button type="submit">Save</Button>
                      <Button
                        type="button"
                        onClick={onCancelChanges}
                        variant={'destructive'}
                      >
                        Cancel
                      </Button>
                    </div>
                    <div className="space-x-1 sm:hidden">
                      <Button
                        type="submit"
                        size="icon-sm"
                        className="rounded-full"
                      >
                        <IconDeviceFloppy />
                      </Button>
                      <Button
                        onClick={onCancelChanges}
                        size="icon-sm"
                        className="rounded-full"
                        type="button"
                        variant={'destructive'}
                      >
                        <IconX />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Button
                      className="hidden sm:block"
                      type="button"
                      onClick={toggleEdit}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      onClick={toggleEdit}
                      className="rounded-full sm:hidden"
                    >
                      <IconPencil />
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div>
              <Controller
                name="bio"
                control={form.control}
                render={({ field, fieldState: { error, invalid } }) => (
                  <Textarea
                    {...field}
                    rows={4}
                    label="Description"
                    placeholder="Description"
                    aria-invalid={invalid}
                    name="bio"
                    className="text-neutral-500"
                    value={field.value ? String(field.value) : ''}
                    disabled={!editContent}
                    error={error ? error.message : ''}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>
        <Card className="py-4 sm:py-5 lg:py-6">
          <CardContent className="px-4 sm:px-5 lg:px-6">
            <Heading variant="h4" className="mb-3">
              Contact Information
            </Heading>
            <div className="grid grid-cols-2 gap-5">
              <Controller
                name="contact_no"
                control={form.control}
                render={({ field, fieldState: { error, invalid } }) => (
                  <Input
                    {...field}
                    label="Contact No"
                    aria-invalid={invalid}
                    placeholder="Email"
                    disabled={!editContent}
                    error={error ? error.message : ''}
                  />
                )}
              />
              <Controller
                name="address"
                control={form.control}
                render={({ field, fieldState: { error, invalid } }) => (
                  <Input
                    {...field}
                    label="Location"
                    aria-invalid={invalid}
                    placeholder="Location"
                    disabled={!editContent}
                    error={error ? error.message : ''}
                  />
                )}
              />
              <Controller
                name="website"
                control={form.control}
                render={({ field, fieldState: { error, invalid } }) => (
                  <Input
                    {...field}
                    label="Website"
                    aria-invalid={invalid}
                    placeholder="Location"
                    value={field.value ? String(field.value) : ''}
                    disabled={!editContent}
                    error={error ? error.message : ''}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>
        <Card className="py-4 sm:py-5 lg:py-6">
          <CardContent className="px-4 sm:px-5 lg:px-6">
            <div className="flex"></div>
            <Heading variant="h4" className="mb-3">
              Social Media
            </Heading>
            <div className="grid grid-cols-2 gap-5">
              <Controller
                name="linkedIn"
                control={form.control}
                render={({ field, fieldState: { error, invalid } }) => (
                  <Input
                    {...field}
                    label="LinkedIn"
                    aria-invalid={invalid}
                    placeholder="Linked In"
                    value={field.value ? String(field.value) : ''}
                    disabled={!editContent}
                    error={error ? error.message : ''}
                  />
                )}
              />
              <Controller
                name="twitter"
                control={form.control}
                render={({ field, fieldState: { error, invalid } }) => (
                  <Input
                    {...field}
                    label="Twitter"
                    aria-invalid={invalid}
                    placeholder="Twitter"
                    value={field.value ? String(field.value) : ''}
                    disabled={!editContent}
                    error={error ? error.message : ''}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="py-4 sm:py-5 lg:py-6">
          <CardContent className="px-4 sm:px-5 lg:px-6">
            <div className="flex"></div>
            <Heading variant="h4" className="mb-3">
              Company Details
            </Heading>
            <div className="grid grid-cols-2 gap-5">
              <Controller
                name="company_type"
                control={form.control}
                render={({ field, fieldState: { error, invalid } }) => (
                  <Input
                    {...field}
                    label="Industry/Domain"
                    aria-invalid={invalid}
                    placeholder="Industry/Domain"
                    value={field.value ? String(field.value) : ''}
                    disabled={!editContent}
                    error={error ? error.message : ''}
                  />
                )}
              />
              <Controller
                name="size"
                control={form.control}
                render={({ field, fieldState: { invalid } }) => (
                  <CustomSelect
                    {...field}
                    label="Company Size"
                    aria-invalid={invalid}
                    disabled={!editContent}
                    value={String(field.value)}
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

              <Controller
                name="founding_year"
                control={form.control}
                render={({ field, fieldState: { error, invalid } }) => (
                  <Input
                    {...field}
                    label="Year Founded"
                    type="number"
                    aria-invalid={invalid}
                    placeholder="Year founded"
                    disabled={!editContent}
                    onChange={(e) => field.onChange(+e.target.value)}
                    error={error ? error.message : ''}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
