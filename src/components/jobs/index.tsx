"use client"
import axios, { AxiosError } from 'axios';
import React from 'react'
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { Spinner } from '../ui/spinner';


export type Job = {
  id: string;
  company_name: string;
  company_founding_year: number;
  company_type: string;
  job_role: string;
  description: string;
  ctc: number;
  stipend: number;
  location: string;
  skills_required: string[];
};

export type Response = {
  status: boolean;
  data: Job[]
}

const Jobs = () => {

  const { data: resData, error, isLoading } = useSWR<Response>('/api/jobs', fetcher)
  const jobs = resData?.data;

  const handleApplyJob = async (jobId: string) => {
    try {
      const response = await axios.post(`/api/jobs/apply/${jobId}`, {});
      alert(response.data.data);

    } catch (err) {
      if (err instanceof AxiosError) {
        alert(err?.response?.data?.error)
      } else {
        alert("something went wrong")
      }
      console.log(err);
    }
  }

  if (error) {
    return (
      <div className='h-full w-full grid mx-auto mt-32'>
        <span className='text-xl font-bold'>Error while fetching data</span>
      </div>
    )
  }

  return (
    <div className='p-10 h-full'>
      <h1 className='text-xl'>Jobs</h1>
      <Card className='w-full h-full py-10 px-5'>
        <CardContent>
          <div className='divide-y-2 divide-gray-300 max-w-2xl mx-auto'>
            {
              isLoading ?
                <div className="flex items-center justify-center py-10">
                  <Spinner className="h-6 w-6 animate-spin text-gray-500" />
                  <span className="ml-2 text-gray-500">Loading...</span>
                </div>
                :
                jobs?.map((job) => (
                  <div className='p-5 flex justify-between items-center' key={job.id}>
                    <div >
                      <div>{job.company_name}</div>
                      <div>{job.job_role}</div>
                      <div>{job.ctc}</div>
                      <div>{job.description}</div>
                    </div>
                    <div><Button onClick={() => handleApplyJob(job.id)}>Apply</Button></div>
                  </div>
                ))
            }
          </div>
        </CardContent>
      </Card>

    </div>
  )
}

export default Jobs 
