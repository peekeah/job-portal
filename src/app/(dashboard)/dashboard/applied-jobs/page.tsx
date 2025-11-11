"use client"

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";


export type Job = {
  id: string;
  job_role: string;
  description: string;
  ctc: number;
  stipend: number;
  location: string;
  skills: string[];
  company: {
    id: string;
    name: string;
    type: string;
    website: string;
    size: string;
    state: string;
  };
};

type AppliedJob = {
  id: string;
  status: string;
  job: Job
}

export type ApiResponse = {
  data: AppliedJob[]
}

function AppliedJobs() {

  const { data, error, isLoading } = useSWR<ApiResponse>("/api/student/applied-jobs", fetcher)

  const appliedJobs = data?.data ?? []

  if (error) {
    return (
      <div>error while fetching data</div>
    )
  }

  return (
    <div className="flex justify-center p-6">
      <Card className="w-full max-w-6xl shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-800">
            Applied Jobs
          </CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Spinner className="h-6 w-6 animate-spin text-gray-500" />
              <span className="ml-2 text-gray-500">Loading...</span>
            </div>
          ) : appliedJobs?.length > 0 ? (
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
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {
                  appliedJobs.map((el, index) => {
                    const job = el.job;
                    return (
                      <TableRow key={job.id || index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{job.company?.name}</TableCell>
                        <TableCell>{job?.job_role}</TableCell>
                        <TableCell>{job?.description}</TableCell>
                        <TableCell>{job?.ctc}</TableCell>
                        <TableCell>{job?.location}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${el?.status === "applied"
                              ? "bg-blue-100 text-blue-800"
                              : el.status === "shortlisted"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                              }`}
                          >
                            {el.status}
                          </span>
                        </TableCell>
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
      </Card >
    </div >

  )
}

export default AppliedJobs
