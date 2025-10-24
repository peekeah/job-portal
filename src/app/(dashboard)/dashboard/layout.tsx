import SignOutButton from "@/components/signout"
import { Card, CardContent } from "@/components/ui/card"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import Link from "next/link"

const Layout = async ({ children }: { children: React.ReactNode }) => {

  const session = await getServerSession(authOptions)
  const role = session?.user?.user_type

  return (
    <div className="w-full bg-slate-200 min-h-screen flex">
      <Card className="rounded-none">
        <CardContent className="flex flex-col gap-3 h-full">
          <Link href={"/dashboard"} className="text-xl px-3 py-1.5 cursor-pointer">Dashboard</Link>
          {
            role === "student" ?
              <Link href={"/dashboard/applied-jobs"} className="text-xl px-3 py-1.5 cursor-pointer">Applied Jobs</Link> :
              <Link href={"/dashboard/posted-jobs"} className="text-xl px-3 py-1.5 cursor-pointer">Post Job</Link>
          }
          <Link href={"/dashboard/profile"} className="text-xl px-3 py-1.5 cursor-pointer">Profile</Link>
          <SignOutButton />
        </CardContent>
      </Card>
      <div className="flex-1">{children}</div>
    </div>
  )
}

export default Layout
