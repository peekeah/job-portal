import { fetcher } from "@/lib/fetcher";
import { ChangeEventHandler, useEffect, useState } from "react";
import useSWR from "swr";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import axios from "axios";

type Profile = {
  _id: string;
  name: string;
  email: string;
  mobile: number;
  profile_pic: string;
  college: {
    name: string;
    branch: string;
    joining_year: string;
  };
  applied_jobs: {
    [key: string]: any;
  }[];
}

const initialProfile: Profile = {
  _id: "",
  name: "",
  email: "",
  mobile: 0,
  profile_pic: "",
  college: {
    name: "",
    branch: "",
    joining_year: ""
  },
  applied_jobs: [],
};


function StudentProfile() {

  const { data, isLoading, error } = useSWR<{ data: Profile }>("/api/student/profile", fetcher)
  const userData = data?.data;

  const [editContent, setEditContent] = useState<boolean>(false)
  const [formData, setFormData] = useState<Profile>(initialProfile)

  useEffect(() => {
    if (!isLoading && userData) {
      setFormData(prev => (userData))
    }
  }, [isLoading])

  const toggleEdit = () => {
    setEditContent((prev) => !prev)
  }


  type CollegeKeys = keyof typeof formData.college

  const onInputChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
    let { name, value } = e.target;
    setFormData((prev) => {
      if (name.includes("college")) {
        const [, key] = name.split(".")

        const collegeKey = key as CollegeKeys

        return ({
          ...prev,
          college: {
            ...prev.college,
            [collegeKey]: value
          }
        })
      } else {
        return ({
          ...prev,
          [name]: value
        })
      }
    })
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
                    name="college.name"
                    value={formData?.college.name}
                    onChange={onInputChange}
                  />
                  <div>College Branch</div>
                  <Input
                    name="college.branch"
                    value={formData?.college?.branch}
                    onChange={onInputChange}
                  />
                  <div>College Joining Year</div>
                  <Input
                    name="college.joining_year"
                    value={formData?.college?.joining_year}
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
                  <div>{formData?.college.name}</div>
                  <div>College Branch</div>
                  <div>{formData?.college?.branch}</div>
                  <div>College Joining Year</div>
                  <div>{formData?.college?.joining_year}</div>
                </div>
            }
          </>
          : null
      }

    </div>
  )
}

export default StudentProfile
