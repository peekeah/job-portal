import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {

  return (
    <div className="flex items-center justify-center gap-4 h-full">
      <Button>
        <Link href={"/login"}>Login</Link>
      </Button>
      <Button>
        <Link href={"/signup"}>Signup</Link>
      </Button>
    </div>
  );
}
