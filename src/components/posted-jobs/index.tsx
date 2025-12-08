"use client"
import { fetcher } from "@/lib/fetcher"
import useSWR from "swr"
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Job } from "../jobs";
import { useRouter } from "next/navigation";
import { Heading, Text } from "../ui/typography";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface CompanyJob extends Job {
  _count: {
    applied_jobs: number;
  }
}

const PostedJobs = () => {
  const router = useRouter();
  const { data, error, isLoading } = useSWR<{ data: CompanyJob[] }>('/api/company/posted-jobs', fetcher)
  const jobs = data?.data;

  if (error) {
    return (<div>error</div>)
  }

  return (
    <div className="responsive-box max-w-6xl">
      <Text className="text-2xl my-5 font-semibold text-gray-800">
        Posted Jobs
      </Text>
      <div>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner className="h-6 w-6 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">Loading...</span>
          </div>
        ) : jobs && jobs?.length > 0 ? (
          <div className="w-full min-h-44 grid grid-cols-2 gap-5">
            {
              jobs.map((job) => {
                return (
                  <Card key={job.id}>
                    <CardContent>
                      <Heading variant='h4'>{job.job_role}</Heading>
                      <Text className='line-clamp-2 text-neutral-500'>{job.description}</Text>
                      <Text className='my-2'>$ {job.ctc}k/year</Text>
                      <Badge className="bg-green-100 text-green-400 my-2 px-3 py-1.5 rounded-full">{job?._count.applied_jobs} applicant{job?._count.applied_jobs > 1 ? "s" : null} </Badge>
                      <Text className='text-neutral-500 space-x-1'>{job.skills_required.map(el => (
                        <Badge key={el} variant={"outline"}>{el}</Badge>
                      ))}</Text>
                      <div className='mt-4 space-x-3'>
                        <Button onClick={() => router.push("/dashboard/job/" + job.id)}>View Applicants</Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            }
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            No data found.
          </div>
        )}
      </div>
    </div>
  )
}

export default PostedJobs
