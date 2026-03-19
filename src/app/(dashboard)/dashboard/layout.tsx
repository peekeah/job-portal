"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconMenu2 as MenuIcon, IconX as CloseIcon } from "@tabler/icons-react";

import Container from "@/components/container";
import SignOutButton from "@/components/signout";
import { Role } from "@/lib/auth-middleware";
import { cn } from "@/lib/utils";

const studentNavLinks = [
  {
    title: "Dashboard",
    href: "/dashboard",
  },
  {
    title: "Appplied Jobs",
    href: "/applied-jobs",
  },
  {
    title: "Profile",
    href: "/profile",
  },
  {
    title: "Logout",
    href: "/logout",
  },
];

const companyNavLinks = [
  {
    title: "Dashboard",
    href: "/dashboard",
  },
  {
    title: "Posted Jobs",
    href: "/posted-jobs",
  },
  {
    title: "Profile",
    href: "/profile",
  },
  {
    title: "Logout",
    href: "/logout",
  },
];

const links = ["/dashboard", "/post-job", "/profile", "/logout"];

const getSelectedLink = (path: string): string => {
  const link = path.split("/dashboard")[1] ?? "";
  return links.includes(link) ? link : "";
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { data } = useSession();
  const role = data?.user?.user_type as Role;

  const path = usePathname();
  const selectedLink = getSelectedLink(path);
  const [openMenu, setOpenMenu] = useState(false);

  const navlinks = role === "applicant" ? studentNavLinks : companyNavLinks;

  return (
    <Container className="relative max-w-7xl w-full h-screen flex">
      <div className="hidden lg:block h-screen px-5">
        <div className="py-6">Logo</div>
        <div className="flex flex-col gap-3 ">
          <Link
            href={"/dashboard"}
            className={cn(
              "text-lg px-3 py-1.5 cursor-pointer transition-all",
              "hover:bg-primary hover:text-white hover:rounded-md",
              selectedLink === "" ? "bg-primary text-white rounded-md" : null,
            )}
          >
            Dashboard
          </Link>
          {role === "applicant" ? (
            <Link
              href={"/dashboard/applied-jobs"}
              className={cn(
                "text-lg px-3 py-1.5 cursor-pointer transition-all",
                "hover:bg-primary hover:text-white hover:rounded-md",
                selectedLink === "/applied-jobs"
                  ? "bg-primary text-white rounded-md"
                  : null,
              )}
            >
              Applied Jobs
            </Link>
          ) : (
            <Link
              href={"/dashboard/post-job"}
              className={cn(
                "text-lg px-3 py-1.5 cursor-pointer transition-all",
                "hover:bg-primary hover:text-white hover:rounded-md",
                selectedLink === "/post-job"
                  ? "bg-primary text-white rounded-md"
                  : null,
              )}
            >
              Post Job
            </Link>
          )}
          <Link
            href={"/dashboard/profile"}
            className={cn(
              "text-lg px-3 py-1.5 cursor-pointer transition-all",
              "hover:bg-primary hover:text-white hover:rounded-md",
              selectedLink === "/profile"
                ? "bg-primary text-white rounded-md"
                : null,
            )}
          >
            Profile
          </Link>
          <SignOutButton />
        </div>
      </div>
      <div className="block absolute top-5 right-3 lg:hidden z-10">
        <MenuIcon className="z-20" onClick={() => setOpenMenu(true)} />
      </div>
      {openMenu ? (
        <div className="block lg:hidden absolute z-20 h-screen w-screen backdrop-blur-md transition-all duration-300">
          <div className="relative p-5">
            <CloseIcon
              className="z-20 absolute top-5 right-3"
              onClick={() => setOpenMenu(false)}
            />
            <div className="flex flex-col gap-3">
              {navlinks.map((link) => (
                <Link
                  key={link.title}
                  className={cn(
                    "text-xl",
                    selectedLink === link.title ? "text-primary" : null,
                  )}
                  href={link.href}
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </Container>
  );
};

export default Layout;
