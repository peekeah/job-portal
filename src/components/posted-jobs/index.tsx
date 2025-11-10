"use client"
import { fetcher } from "@/lib/fetcher"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { Job } from "../jobs";
import { useRouter } from "next/navigation";

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
    <div className="flex justify-center p-6">
      <Card className="w-full max-w-6xl shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-800">
            Posted Jobs
          </CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Spinner className="h-6 w-6 animate-spin text-gray-500" />
              <span className="ml-2 text-gray-500">Loading...</span>
            </div>
          ) : jobs && jobs?.length > 0 ? (
            <Table className="w-full min-h-44">
              <TableCaption>A list of all jobs you’ve applied for.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Job Role</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>CTC</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Applied Candidates</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {
                  jobs.map((job, index) => {
                    return (
                      <TableRow
                        className="cursor-pointer transition-all"
                        onClick={() => router.push("/dashboard/job/" + job.id)}
                        key={job.id || index}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{job.company_name}</TableCell>
                        <TableCell>{job?.job_role}</TableCell>
                        <TableCell>{job?.description}</TableCell>
                        <TableCell>{job?.ctc}</TableCell>
                        <TableCell>{job?.location}</TableCell>
                        <TableCell>{job?._count.applied_jobs}</TableCell>
                      </TableRow>
                    )
                  })
                }
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No applied jobs found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PostedJobs
