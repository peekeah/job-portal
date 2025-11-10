import Jobs from "@/components/jobs"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import PostedJobs from "@/components/posted-jobs"
import { Role } from "@/lib/token"

const Dashboard = async () => {
  const session = await getServerSession(authOptions)
  const role = session?.user?.user_type as Role;
  return (
    <>
      {role === "applicant" ? <Jobs /> : <PostedJobs />}
    </>
  )
}

export default Dashboard
