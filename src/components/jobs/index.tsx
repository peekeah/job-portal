"use client"
import axios, { AxiosError } from 'axios';
import React from 'react'
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export type Company = {
  _id: string;
  name: string;
  founding_year: number;
  company_type: string;
  email: string;
};

export type Job = {
  _id: string;
  company: Company;
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

  return (
    <div className='p-10'>
      <h1 className='text-xl'>Jobs</h1>
      <Card className='w-full py-10 px-5'>
        <CardContent>
          <div className='divide-y-2 divide-gray-300 max-w-2xl mx-auto'>
            {
              jobs?.map((job) => (
                <div className='p-5 flex justify-between items-center' key={job._id}>
                  <div >
                    <div>{job.company.name}</div>
                    <div>{job.job_role}</div>
                    <div>{job.ctc}</div>
                    <div>{job.description}</div>
                  </div>
                  <div><Button onClick={() => handleApplyJob(job._id)}>Apply</Button></div>
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
