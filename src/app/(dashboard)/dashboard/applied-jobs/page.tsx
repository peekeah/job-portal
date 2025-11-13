"use client"

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heading, Text } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Job = {
  id: string;
  job_role: string;
  description: string;
  ctc: number;
  stipend: number;
  location: string;
  skills_required: string[];
  company: {
    id: string;
    name: string;
    type: string;
    address: string;
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

const badgeClasses = new Map([
  ["applied", "bg-blue-100 text-blue-400"],
  ["shortlisted", "bg-yellow-100 text-yellow-400"],
  ["hired", "bg-green-100 text-green-400"],
])

function AppliedJobs() {

  const { data, error, isLoading } = useSWR<ApiResponse>("/api/student/applied-jobs", fetcher)

  const appliedJobs = data?.data ?? []

  if (error) {
    return (
      <div>error while fetching data</div>
    )
  }

  return (
    <div className="flex flex-col gap-5 justify-center p-10">
      <CardTitle className="text-2xl font-semibold text-gray-800">
        Applied Jobs
      </CardTitle>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Spinner className="h-6 w-6 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading...</span>
        </div>
      ) : appliedJobs?.length > 0 ? (
        <div className="grid grid-cols-2 gap-5">
          {
            appliedJobs?.map(el => {
              const job = el.job;
              const company = el.job.company;
              const status = el.status;

              return (
                <Card key={job.id}>
                  <CardContent>
                    <div className="flex justify-between">
                      <div className='flex gap-4 items-center mb-3'>
                        <Avatar className='size-12'>
                          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                          <AvatarFallback>Company</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className='font-medium'>{company.name}</div>
                          <div className='text-sm text-neutral-500'>{company.address}</div>
                        </div>
                      </div>
                      <div>
                        <Badge className={
                          cn(
                            "text-sm rounded-full px-2 py-1.5",
                            badgeClasses.get(status))
                        }>{status}</Badge>
                      </div>
                    </div>
                    <Heading variant='h4'>{job.job_role}</Heading>
                    <Text className='line-clamp-2 text-neutral-500'>{job.description}</Text>
                    <Text className='my-2'>$ {job.ctc}k/year</Text>
                    <Text className='text-neutral-500 space-x-1'>{job?.skills_required.map(el => (
                      <Badge variant={"outline"}>{el}</Badge>
                    ))}</Text>
                    <div className='mt-4 space-x-3'>
                      <Button variant={"outline"}>View Job</Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          }
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          No applied jobs found.
        </div>
      )
      }
    </div >
  )
}

export default AppliedJobs
