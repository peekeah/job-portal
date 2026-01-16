import { ReactNode } from "react";
import Container from "@/components/container";
import { Navbar } from "@/components/nav";

const Layout = async function ({ children }: { children: ReactNode }) {

  return (
    <>
      <Navbar hideLinks={true} />
      <Container className="h-full flex flex-col">
        <div className="flex-1 py-5">{children}</div>
      </Container>
    </>
  )
}

export default Layout;
