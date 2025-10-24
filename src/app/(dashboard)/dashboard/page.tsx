import axios from 'axios';
import React, { useContext } from 'react'
import { UserContext } from '@/contexts/user'
import { DataTable } from '@/components/data-table/data-table';
import { Card, CardContent } from '@/components/ui/card';
import { getJobColumns } from '@/components/data-table/job-columns';
import { jobMockData } from '@/mock/job-mock';
import { Button } from '@/components/ui/button';

const getData = async () => {
  const res = await fetch(process.env.BACKEND_URI + "/api/jobs")
  if (!res.ok) {
    return {}
    // throw new Error("Failed to fetch data")
  }
  return res.json()
}

const Dashboard = async () => {
  const res = await fetch(process.env.BACKEND_URI + "/api/jobs")
  console.log("rr:", res)

  // const columns = getJobColumns("student")

  const applyJob = async (e) => {
    try {
      const jobId = e.target.name;
      const url = process.env.REACT_APP_BACKEND_URL;
      const response = await axios.post(`${url}/job/apply/${jobId}`, {});
      alert(response.data.data);

    } catch (err) {
      alert(err.response.data.error)
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
              jobMockData?.map((job) => (
                <div className='p-5 flex justify-between items-center' key={job.id}>
                  <div >
                    <div>{job.companyName}</div>
                    <div>{job.jobRole}</div>
                    <div>{job.ctc}</div>
                    <div>{job.description}</div>
                  </div>
                  <div><Button>Apply</Button></div>
                </div>
              ))
            }
          </div>
          {/*
          <DataTable
            className="h-72"
            columns={columns}
            // data={jobs?.length ? jobs : []}
            data={jobMockData}
          />
          */}
        </CardContent>
      </Card>

    </div>
  )
}

export default Dashboard
