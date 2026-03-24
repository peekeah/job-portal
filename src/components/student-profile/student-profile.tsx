'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import axios, { AxiosError } from 'axios';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Upload } from 'lucide-react';
import { fetcher } from '@/lib/fetcher';

import ResumeViewer from '../resume-viewer';
import { Dialog } from '@radix-ui/react-dialog';
import { DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Profile, profileSchema } from './schema';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useSWRMutation from 'swr/mutation';
import { Resume } from '@/mock/resume';
import { toast } from 'sonner';
import { useUploadThing } from '@/lib/uploadthing-client';
import { formatInitials } from '@/lib/formater';
import { Spinner } from '../ui/spinner';

const initialProfile: Profile = {
  id: '',
  name: '',
  email: '',
  mobile: '',
  profile_pic: '',
  college_name: '',
  college_branch: '',
  college_joining_year: '',
  resume: [],
};

const postProfileApiCall = async (
  url: string,
  { arg: { payload: payload } }: { arg: { payload: Profile } },
) => {
  try {
    const res = await axios.post(url, payload);

    if (!res?.data?.status) {
      throw new Error(res?.data?.error || 'error while saving');
    }

    toast.success('Successfully saved data');
  } catch (_err) {
    toast.error('Something went wrong, try again!');
  }
};

function StudentProfile() {
  const [selectResumeToDisplay, setSelectResumeToDisplay] =
    useState<Resume | null>(null);

  const { data, isLoading, mutate } = useSWR<{ data: Profile }>(
    '/api/student/profile',
    fetcher,
  );
  const { trigger: postProfileTrigger } = useSWRMutation(
    '/api/student/profile',
    postProfileApiCall,
  );

  const userData = data?.data;

  const { startUpload, isUploading } = useUploadThing('avatarUploader');

  const [editContent, setEditContent] = useState<boolean>(false);
  const [isUploadingResume, setIsUploadingResume] = useState<boolean>(false);

  const form = useForm<Profile>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialProfile,
    values: userData,
  });

  const toggleEdit = () => {
    setEditContent((prev) => !prev);
  };

  const onCancel = () => {
    form.reset();
    setEditContent(() => false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const res = await startUpload([file]);
    if (!res?.[0]?.ufsUrl) {
      toast.error('Failed to upload avatar');
      return;
    }

    // Save URL to profile
    await axios.post('/api/student/profile', { profile_pic: res[0].url });
    toast.success('Avatar updated');
    mutate(); // revalidate SWR
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!validTypes.includes(file.type)) {
      toast.error('Only PDF and Word documents are allowed');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploadingResume(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await axios.post('/api/student/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!res?.data?.status) {
        throw new Error(res?.data?.error || 'Failed to upload resume');
      }

      toast.success('Resume uploaded successfully');
      mutate();
    } catch (_err) {
      toast.error('Failed to upload resume');
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleResumeDelete = async (resumeId: string) => {
    let type: 'error' | 'success' = 'error';
    let msg = 'Failed to delete resume';

    try {
      const res = await axios.delete(`/api/student/resume/${resumeId}`);
      if (res?.data?.status) {
        type = 'success';
        msg = 'Resume deleted successfully';
        mutate();
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        msg = err?.response?.data?.message || msg;
      }
    } finally {
      toast[type](msg);
    }
  };

  const onSubmit = (payload: Profile) => {
    postProfileTrigger({ payload });
    setEditContent(false);
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="h-full w-full p-5 sm:p-7 md:px-10 lg:px-5"
    >
      <div className="flex w-full">
        <h1 className="text-2xl font-semibold">Student Profile</h1>
      </div>
      {!isLoading && userData ? (
        <Card className="mt-5 max-w-4xl p-5 md:p-7 lg:p-5">
          <CardContent className="mb-4">
            <div className="flex items-start justify-center">
              <div className="mb-5 flex items-center gap-5">
                <Avatar className="size-28">
                  <AvatarImage
                    src={userData?.profile_pic ?? ''}
                    alt={userData?.name}
                  />
                  <AvatarFallback>
                    <span className="font-sans text-5xl font-bold">
                      {formatInitials(userData?.name)}
                    </span>
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-2">
                  <div className="text-2xl font-bold">{userData.name}</div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={isUploading}
                    />
                    <Button type="button" asChild>
                      <span>
                        {isUploading ? (
                          <span className="flex items-center gap-1.5">
                            <Spinner className="text-white" /> Loading
                          </span>
                        ) : (
                          'Change Logo'
                        )}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
              <div className="mx-auto flex flex-1 justify-end pt-4">
                {editContent ? (
                  <div className="space-x-3">
                    <Button type="submit">Save</Button>
                    <Button
                      onClick={onCancel}
                      type="button"
                      variant={'destructive'}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button type="button" onClick={toggleEdit}>
                    Edit
                  </Button>
                )}
              </div>
            </div>
            <div className="mx-auto grid gap-5 md:grid-cols-2">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState: { error, invalid } }) => (
                  <Input
                    {...field}
                    label="Name"
                    aria-invalid={invalid}
                    placeholder="Name"
                    disabled={!editContent}
                    error={error ? error.message : ''}
                  />
                )}
              />
              <Controller
                name="mobile"
                control={form.control}
                render={({ field, fieldState: { error, invalid } }) => (
                  <Input
                    {...field}
                    label="Contact"
                    aria-invalid={invalid}
                    placeholder="Contact"
                    disabled={!editContent}
                    error={error ? error.message : ''}
                  />
                )}
              />
              <Controller
                name="college_name"
                control={form.control}
                render={({ field, fieldState: { error, invalid } }) => (
                  <Input
                    {...field}
                    label="College Name"
                    aria-invalid={invalid}
                    placeholder="College Name"
                    disabled={!editContent}
                    error={error ? error.message : ''}
                  />
                )}
              />
              <Controller
                name="college_branch"
                control={form.control}
                render={({ field, fieldState: { error, invalid } }) => (
                  <Input
                    {...field}
                    label="College Branch"
                    aria-invalid={invalid}
                    placeholder="College Branch"
                    disabled={!editContent}
                    error={error ? error.message : ''}
                  />
                )}
              />
              <Controller
                name="college_joining_year"
                control={form.control}
                render={({ field, fieldState: { error, invalid } }) => (
                  <Input
                    {...field}
                    label="College Joining Year"
                    aria-invalid={invalid}
                    placeholder="College Joining Year"
                    disabled={!editContent}
                    error={error ? error.message : ''}
                  />
                )}
              />

              <div className="mt-5 border-t pt-5 md:col-span-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Resume</h3>
                  <label className="relative flex w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 transition hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-900">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      disabled={isUploadingResume}
                      className="hidden"
                    />
                    <div className="space-y-2 text-center">
                      <Upload className="mx-auto size-8 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Click to upload resume
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PDF or Word documents (Max 5MB)
                        </p>
                      </div>
                    </div>
                  </label>

                  {userData?.resume.length ? (
                    <>
                      {userData.resume.map((el) => (
                        <div key={el.id} className="space-y-3">
                          <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {el.title}
                              </p>
                            </div>
                            {!selectResumeToDisplay ? (
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                  setSelectResumeToDisplay(
                                    el?.json ? JSON.parse(el.json) : el,
                                  )
                                }
                              >
                                Show
                              </Button>
                            ) : null}
                            <Button
                              type="button"
                              onClick={() => handleResumeDelete(el.id)}
                              variant="destructive"
                              size="sm"
                              className="gap-2"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : null}

                  {selectResumeToDisplay && (
                    <Dialog
                      open={true}
                      onOpenChange={() => setSelectResumeToDisplay(null)}
                    >
                      <DialogContent className="max-h-[90vh] min-w-4xl">
                        <DialogHeader className="hidden">
                          <DialogTitle>title</DialogTitle>
                        </DialogHeader>
                        <ResumeViewer resume={selectResumeToDisplay} />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </form>
  );
}

export default StudentProfile;
