import Jobs from "@/components/jobs"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import PostedJobs from "@/components/posted-jobs"

const Dashboard = async () => {
  const session = await getServerSession(authOptions)
  const role = session?.user?.user_type
  return (
    <>
      {role === "student" ? <Jobs /> : <PostedJobs />}
    </>
  )
}

export default Dashboard
