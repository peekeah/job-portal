"use client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import axios from "axios"
import { redirect } from "next/navigation"
import { useContext, useState } from "react"
import { UserContext, UserType } from "@/contexts/user"
import { CustomSelect, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select"

type User = {
  email: string;
  password: string;
  userType: Exclude<UserType, null>;
}

const Login = () => {

  const uri = "http://localhost:3000/api";

  const { handleLogin, auth } = useContext(UserContext);

  const [user, setUser] = useState<User>({
    email: '',
    password: '',
    userType: 'student'
  });

  const handleSubmit = async () => {
    let host = uri;

    if (user.userType === 'student') {
      host += '/student/login'
    } else {
      host += '/company/login'
    }

    try {
      const response = await axios.post(host, user);
      const token = response.data.data.token;
      handleLogin(token, user.userType);

      // Redirect to dashboard
      redirect("/dashboard");

    } catch (err: any) {
      alert(err.response.data.error)
      console.log(err);
    }
  }

  const handleReset = () => {
    setUser({
      email: '',
      password: '',
      userType: 'student'
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  }

  return (
    <div className="w-full grid grid-cols-2 gap-10 items-center">
      <div className="grid place-content-center">
        <div className="text-5xl">Login</div>
      </div>
      <div className="space-y-5">
        <CustomSelect
          placeholder="User type"
          label="User type"
          options={[
            { value: "user", label: "User" },
            { value: "company", label: "Company" },
          ]}
        />

        <Input
          name="email"
          label="Email"
          onChange={handleInputChange}
        />
        <Input
          name="password"
          label="Password"
          type="password"
          onChange={handleInputChange}
        />
        <Button 
        className="my-3"
        onClick={handleSubmit}
        >Login</Button>
      </div>
    </div>
  )
}

export default Login
