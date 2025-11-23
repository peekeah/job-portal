import { fetcher } from "@/lib/fetcher";
import { ChangeEventHandler, useEffect, useState } from "react";
import useSWR from "swr";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import axios from "axios";
import { Card, CardContent } from "../ui/card";
import { Heading } from "../ui/typography";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type Profile = {
  id: string;
  name: string;
  email: string;
  mobile: number;
  profile_pic: string;
  college_name: string;
  college_branch: string;
  college_joining_year: string;
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
  applied_jobs: [],
};


function StudentProfile() {

  const { data, isLoading } = useSWR<{ data: Profile }>("/api/student/profile", fetcher)
  const userData = data?.data;

  const [editContent, setEditContent] = useState<boolean>(false)
  const [formData, setFormData] = useState<Profile>(initialProfile)

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

  return (
    <div className='p-5 md:p-7 lg:p-5 max-w-4xl mx-auto'>
      <h1 className='py-1 text-2xl font-semibold'>Student Profile</h1>
      <div className='mx-auto flex justify-end mb-5'>
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
      {
        !isLoading && userData ?
          <Card>
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
              </div>
            </CardContent>
          </Card>
          : null
      }
    </div>
  )
}

export default StudentProfile
