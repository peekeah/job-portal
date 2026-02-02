"use client";
import { useState } from "react";
import useSWR from "swr";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import axios from "axios";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Upload } from "lucide-react";
import { fetcher } from "@/lib/fetcher";

import { Resume } from "@prisma/client"
import ResumeViewer from "../resume-viewer";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Profile, profileSchema } from "./schema";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useSWRMutation from "swr/mutation";

const initialProfile: Profile = {
  id: "",
  name: "",
  email: "",
  mobile: "",
  profile_pic: "",
  college_name: "",
  college_branch: "",
  college_joining_year: "",
  resume: [],
};

const postProfileApiCall = async (url: string, { arg: { payload: payload } }: { arg: { payload: Profile } }) => {
  try {
    const res = await axios.post(url, payload)

    if (!res?.data?.status) {
      throw new Error(res?.data?.error || "error while saving")
    }

    alert("successfully saved data")

  } catch (err) {
    console.log("err:", err)
  }
}

function StudentProfile() {

  const [selectResumeToDisplay, setSelectResumeToDisplay] = useState<Resume | null>(null)

  const { data, isLoading, mutate } = useSWR<{ data: Profile }>("/api/student/profile", fetcher)
  const { trigger: postProfileTrigger, isMutating: postProfileLoading } = useSWRMutation("/api/student/profile", postProfileApiCall)

  const userData = data?.data;

  const [editContent, setEditContent] = useState<boolean>(false)
  const [isUploadingResume, setIsUploadingResume] = useState<boolean>(false)

  const form = useForm<Profile>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialProfile,
    values: userData
  })

  const toggleEdit = () => {
    setEditContent((prev) => !prev)
  }

  const onCancel = () => {
    form.reset()
    setEditContent(() => false);
  }

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!validTypes.includes(file.type)) {
      alert("Only PDF and Word documents are allowed");
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File size must be less than 5MB");
      return;
    }

    setIsUploadingResume(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await axios.post("/api/student/resume", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!res?.data?.status) {
        throw new Error(res?.data?.error || "Failed to upload resume");
      }

      alert("Resume uploaded successfully");
      mutate();
    } catch (err) {
      console.error("Error uploading resume:", err);
      alert("Failed to upload resume");
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleResumeDelete = async (resumeId: string) => {

    try {
      const res = await axios.delete("/api/student/resume/" + resumeId)

      if (!res?.data?.status) {
        throw new Error(res?.data?.error || "Failed to delete resume");
      }

      alert("Resume deleted successfully");
      mutate();
    } catch (err) {
      console.error("Error deleting resume:", err);
      alert("Failed to delete resume");
    }
  };

  const onSubmit = (payload: Profile) => {
    postProfileTrigger({ payload })
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className='p-5 sm:p-7 md:px-10 lg:px-5 h-full w-full'>
      <div className="flex w-full">
        <h1 className='text-2xl font-semibold'>Student Profile</h1>
        <div className='mx-auto flex justify-end flex-1'>
          {
            editContent ?
              <div className="space-x-3">
                <Button type="submit">Save</Button>
                <Button
                  onClick={onCancel}
                  type="button"
                  variant={"destructive"}
                >Cancel</Button>
              </div> :
              <Button type="button" onClick={toggleEdit}>Edit</Button>
          }
        </div>
      </div>
      {
        !isLoading && userData ?
          <Card className="p-5 mt-5 md:p-7 lg:p-5 max-w-4xl">
            <CardContent className="mb-4">
              <div className="flex mb-5 gap-5 items-center">
                <Avatar className='size-28'>
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                  <AvatarFallback>Job</AvatarFallback>
                </Avatar>

                <div className='space-y-2'>
                  <div className='text-2xl font-bold'>{userData.name}</div>
                  <div>
                    <Button variant={"outline"}>Change Image</Button>
                  </div>
                </div>
              </div>
              <div className='grid md:grid-cols-2 gap-5 mx-auto'>
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
                      error={
                        error ? error.message : ""
                      }
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
                      error={
                        error ? error.message : ""
                      }
                    />
                  )}
                />
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState: { error, invalid } }) => (
                    <Input
                      {...field}
                      label="Email"
                      aria-invalid={invalid}
                      placeholder="Email"
                      disabled={!editContent}
                      error={
                        error ? error.message : ""
                      }
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
                      error={
                        error ? error.message : ""
                      }
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
                      error={
                        error ? error.message : ""
                      }
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
                      error={
                        error ? error.message : ""
                      }
                    />
                  )}
                />

                <div className="md:col-span-2 border-t pt-5 mt-5">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Resume</h3>
                    <label className="relative flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeUpload}
                        disabled={isUploadingResume}
                        className="hidden"
                      />
                      <div className="text-center space-y-2">
                        <Upload className="size-8 mx-auto text-gray-400" />
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
                        {
                          userData.resume.map(el => (
                            <div key={el.id} className="space-y-3">
                              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {el.title}
                                  </p>
                                </div>
                                {
                                  !selectResumeToDisplay ?
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => setSelectResumeToDisplay(el)}
                                    >Show PDF</Button> : null
                                }
                                <Button
                                  onClick={() => handleResumeDelete(el.id)}
                                  variant="destructive"
                                  size="sm"
                                  className="gap-2"
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          ))
                        }
                      </>
                    ) : null}

                    {selectResumeToDisplay &&
                      <Dialog
                        open={true}
                        onOpenChange={
                          () => setSelectResumeToDisplay(null)
                        }>
                        <DialogContent className="min-w-4xl max-h-[90vh]">
                          <DialogHeader className="hidden">
                            <DialogTitle>title</DialogTitle>
                          </DialogHeader>
                          <ResumeViewer
                            resume={selectResumeToDisplay}
                          />
                        </DialogContent>
                      </Dialog>
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          : null
      }
    </form>
  )
}

export default StudentProfile
