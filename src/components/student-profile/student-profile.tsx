import { fetcher } from "@/lib/fetcher";
import { ChangeEventHandler, useEffect, useState } from "react";
import useSWR from "swr";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import axios from "axios";

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


  return (
    <div className='p-5'>
      <h1 className='py-1 text-2xl font-semibold'>Student Profile</h1>
      <div className='w-1/2 mx-auto flex justify-center'>
        {
          editContent ?
            <Button onClick={onSave}>Save</Button> :
            <Button onClick={toggleEdit}>Edit</Button>
        }
      </div>
      {
        !isLoading && userData ?
          <>
            {
              editContent ?
                <div className='grid grid-cols-2 gap-3 w-1/2 mx-auto pt-42'>
                  <div>Name</div>
                  <Input
                    value={formData?.name}
                    name="name"
                    onChange={onInputChange}
                  />
                  <div>Mobile</div>
                  <Input
                    name="mobile"
                    value={formData?.mobile}
                    onChange={onInputChange}
                  />
                  <div>Email</div>
                  <Input
                    name="email"
                    value={formData?.email}
                    onChange={onInputChange}
                  />
                  <div>College Name</div>
                  <Input
                    name="college_name"
                    value={formData?.college_name}
                    onChange={onInputChange}
                  />
                  <div>College Branch</div>
                  <Input
                    name="college_branch"
                    value={formData?.college_branch}
                    onChange={onInputChange}
                  />
                  <div>College Joining Year</div>
                  <Input
                    name="college_joining_year"
                    value={formData?.college_joining_year}
                    onChange={onInputChange}
                  />
                </div> :
                <div className='grid grid-cols-2 gap-3 w-1/2 mx-auto pt-42'>
                  <div>Name</div>
                  <div>{formData?.name}</div>
                  <div>Mobile</div>
                  <div>{formData?.email}</div>
                  <div>Email</div>
                  <div>{formData?.mobile}</div>
                  <div>College Name</div>
                  <div>{formData?.college_name}</div>
                  <div>College Branch</div>
                  <div>{formData?.college_branch}</div>
                  <div>College Joining Year</div>
                  <div>{formData?.college_joining_year}</div>
                </div>
            }
          </>
          : null
      }
    </div>
  )
}

export default StudentProfile
