"use client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

const Login = () => {

  const [user, setUser] = useState({
    email: '',
    password: '',
  });

  const router = useRouter()

  const handleSubmit = async () => {

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: user.email,
        password: user.password,
      })

      if (res?.error) {
        return alert(res?.error)
      }

      router.push("/dashboard")
    } catch (err: any) {
      alert(err?.response?.data?.error || "something went wrong")
      console.log(err);
    }
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
