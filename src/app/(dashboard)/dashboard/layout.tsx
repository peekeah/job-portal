import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full bg-slate-200 min-h-screen flex">
      <Card className="rounded-none">
        <CardContent className="flex flex-col gap-3">
          <Link href={"/dashboard"} className="text-xl px-3 py-1.5 cursor-pointer">Dashboard</Link>
          <Link href={"/dashboard/applied-jobs"} className="text-xl px-3 py-1.5 cursor-pointer">Applied Jobs</Link>
          <Link href={"/dashboard/profile"} className="text-xl px-3 py-1.5 cursor-pointer">Profile</Link>
          <Link href={"/dashboard"} className="text-xl px-3 py-1.5 cursor-pointer">Logout</Link>
        </CardContent>
      </Card>
      <div className="flex-1">{children}</div>
    </div>
  )
}

export default Layout
