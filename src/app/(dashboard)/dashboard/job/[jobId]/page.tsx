"use client"
import ApplicantsTable from "@/components/applicants-table/page";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetcher } from "@/lib/fetcher";
import { useParams } from "next/navigation"
import { useCallback } from "react";
import useSWR from "swr";

type Applicant = {
  id: string;
  name: string;
  mobile: number;
  email: string;
  profile_pic: string;
  college_name: string;
  college_branch: string;
  college_joining_year: string;
};

export type Applicants = {
  id: string;
  jobId: string;
  applicant: Applicant;
}

type ApiResponse = {
  status: true;
  data: {
    applied: Applicants[],
    shortlisted: Applicants[],
    hired: Applicants[],
  }
}

export type ApplicantType = keyof ApiResponse["data"];

const JobDetails = () => {
  const { jobId } = useParams<{ jobId: string }>();

  const { data, isLoading, error, mutate } = useSWR<ApiResponse>(`/api/jobs/${jobId}`, fetcher);

  const getApplicants = useCallback((type: ApplicantType) => {
    if (data?.data) {
      const applicants = data?.data[type] ? data?.data[type] : []
      return applicants;
    }
    return []
  }, [data?.data])

  const refetch = () => {
    mutate(undefined, { revalidate: true })
  }

  return (
    <div className="p-10">
      <Tabs defaultValue={"applied"} className="w-full">
        <TabsList>
          <TabsTrigger
            className="cursor-pointer"
            value="applied"
          >Applied</TabsTrigger>
          <TabsTrigger
            className="cursor-pointer"
            value="shortlisted"
          >Shortlisted</TabsTrigger>
          <TabsTrigger
            className="cursor-pointer"
            value="hired"
          >Hired</TabsTrigger>
        </TabsList>
        {
          isLoading ?
            <div className="flex items-center justify-center py-10">
              <Spinner className="h-6 w-6 animate-spin text-gray-500" />
              <span className="ml-2 text-gray-500">Loading...</span>
            </div> :
            <>
              <TabsContent value="applied" className="my-5">
                <ApplicantsTable
                  type="applied"
                  jobId={jobId}
                  applicants={getApplicants("applied")}
                  refetch={refetch}
                />
              </TabsContent>
              <TabsContent value="shortlisted" className="my-5">
                <ApplicantsTable
                  type="shortlisted"
                  jobId={jobId}
                  applicants={getApplicants("shortlisted")}
                  refetch={refetch}
                />
              </TabsContent>
              <TabsContent value="hired" className="my-5">
                <ApplicantsTable
                  type="hired"
                  jobId={jobId}
                  applicants={getApplicants("hired")}
                  refetch={refetch}
                />
              </TabsContent>
            </>
        }
      </Tabs>
    </div>
  )
}

export default JobDetails
