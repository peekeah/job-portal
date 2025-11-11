import { ReactNode } from "react";
import Container from "@/components/container";

const Layout = async function ({ children }: { children: ReactNode }) {

  return (
    <Container className="h-full flex flex-col">
      <div className="py-5 text-xl">Navbar</div>
      <div className="flex-1 py-5">{children}</div>
    </Container>
  )
}

export default Layout;
