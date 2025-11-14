"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";

import Container from "@/components/container";
import SignOutButton from "@/components/signout";
import { Role } from "@/lib/token";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const links = ["/dashboard", "/post-job", "/profile", "/logout"];

const getSelectedLink = (path: string): string => {
  const link = path.split("/dashboard")[1] ?? "";
  return links.includes(link) ? link : "";
}

const Layout = ({ children }: { children: React.ReactNode }) => {

  const { data } = useSession()
  const role = data?.user?.user_type as Role;

  const path = usePathname();
  const selectedLink = getSelectedLink(path);

  return (
    <Container className="max-w-7xl w-full bg-neutral-100 h-screen flex">
      <div className="h-screen">
        <div className="py-6">Logo</div>
        <div className="flex flex-col gap-3 ">
          <Link
            href={"/dashboard"}
            className={
              cn(
                "text-lg px-3 py-1.5 cursor-pointer transition-all",
                "hover:bg-primary hover:text-white hover:rounded-md",
                selectedLink === "" ? "bg-primary text-white rounded-md" : null
              )
            }>Dashboard</Link>
          {
            role === "applicant" ?
              <Link href={"/dashboard/applied-jobs"} className={
                cn(
                  "text-lg px-3 py-1.5 cursor-pointer transition-all",
                  "hover:bg-primary hover:text-white hover:rounded-md",
                  selectedLink === "/applied-jobs" ? "bg-primary text-white rounded-md" : null
                )
              }
              >Applied Jobs</Link> :
              <Link
                href={"/dashboard/post-job"}
                className={
                  cn(
                    "text-lg px-3 py-1.5 cursor-pointer transition-all",
                    "hover:bg-primary hover:text-white hover:rounded-md",
                    selectedLink === "/post-job" ? "bg-primary text-white rounded-md" : null
                  )
                }
              >Post Job</Link>
          }
          <Link
            href={"/dashboard/profile"}
            className={
              cn(
                "text-lg px-3 py-1.5 cursor-pointer transition-all",
                "hover:bg-primary hover:text-white hover:rounded-md",
                selectedLink === "/profile" ? "bg-primary text-white rounded-md" : null
              )
            }
          >Profile</Link>
          <SignOutButton />

        </div>
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </Container >
  )
}

export default Layout
