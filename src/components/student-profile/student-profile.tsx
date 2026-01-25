"use client";
import { ChangeEventHandler, useEffect, useState } from "react";
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

type Profile = {
  id: string;
  name: string;
  email: string;
  mobile: number;
  profile_pic: string;
  college_name: string;
  college_branch: string;
  college_joining_year: string;
  resume: Resume[]
  applied_jobs: {
    [key: string]: unknown;
  }[];
}

const initialProfile: Profile = {
  id: "",
  name: "",
  email: "",
  mobile: 0,
  profile_pic: "",
  college_name: "",
  college_branch: "",
  college_joining_year: "",
  resume: [],
  applied_jobs: [],
};


function StudentProfile() {

  const [selectResumeToDisplay, setSelectResumeToDisplay] = useState<Resume | null>(null)

  const { data, isLoading, mutate } = useSWR<{ data: Profile }>("/api/student/profile", fetcher)
  const userData = data?.data;

  const [editContent, setEditContent] = useState<boolean>(false)
  const [formData, setFormData] = useState<Profile>(initialProfile)
  const [isUploadingResume, setIsUploadingResume] = useState<boolean>(false)

  useEffect(() => {
    if (userData) {
      setFormData(() => (userData))
    }
  }, [userData])

  const toggleEdit = () => {
    setEditContent((prev) => !prev)
  }

  const onInputChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  const onSave = async () => {

    try {
      const res = await axios.post("/api/student/profile", formData)

      if (!res?.data?.status) {
        throw new Error(res?.data?.error || "error while saving")
      }

      alert("successfully saved data")
      toggleEdit()

    } catch (err) {
      console.log("err:", err)
    }
  }

  const onCancel = () => {
    setFormData(() => userData!);
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
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("resume", file);

      // Upload to backend
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

  return (
    <div className='p-5 md:p-7'>
      <div className="flex w-full pb-3">
        <h1 className='py-1 text-2xl font-semibold'>Student Profile</h1>
        <div className='mx-auto flex justify-end flex-1'>
          {
            editContent ?
              <div className="space-x-3">
                <Button onClick={onSave}>Save</Button>
                <Button
                  onClick={onCancel}
                  variant={"destructive"}
                >Cancel</Button>
              </div> :
              <Button onClick={toggleEdit}>Edit</Button>
          }
        </div>
      </div>
      {
        !isLoading && userData ?
          <Card className="p-5 mt-3 md:p-7 lg:p-5 max-w-4xl">
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
                <Input
                  label="Name"
                  value={formData?.name}
                  name="name"
                  onChange={onInputChange}
                  disabled={!editContent}
                />
                <Input
                  label="Contact"
                  name="mobile"
                  value={formData?.mobile}
                  onChange={onInputChange}
                  disabled={!editContent}
                />
                <Input
                  label="Email"
                  name="email"
                  value={formData?.email}
                  onChange={onInputChange}
                  disabled={!editContent}
                />
                <Input
                  label="College Name"
                  name="college_name"
                  value={formData?.college_name}
                  onChange={onInputChange}
                  disabled={!editContent}
                />
                <Input
                  label="College Branch"
                  name="college_branch"
                  value={formData?.college_branch}
                  onChange={onInputChange}
                  disabled={!editContent}
                />
                <Input
                  label="College Joining Year"
                  name="college_joining_year"
                  value={formData?.college_joining_year}
                  onChange={onInputChange}
                  disabled={!editContent}
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

                    {formData?.resume.length ? (
                      <>
                        {
                          formData.resume.map(el => (
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
    </div>
  )
}

export default StudentProfile
