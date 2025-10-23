"use client"
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '@/contexts/user'
import { DataTable } from '@/components/data-table/data-table';
import { Card, CardContent } from '@/components/ui/card';
import { getJobColumns } from '@/components/data-table/job-columns';
import { jobMockData } from '@/mock/job-mock';


const Dashboard = () => {

  const [jobs, setJobs] = useState([]);

  const { config, userType, auth } = useContext(UserContext);

  useEffect(() => {

    const url = process.env.NEXT_PUBLIC_BACKEND_URL;

    const getJobs = async () => {
      try {
        const response = await axios.get(`${url}/job`);
        setJobs(response.data.data);
      } catch (err) {
        console.log(err);
      }
    }

    getJobs();
  }, [])

  const columns = getJobColumns("student")

  const applyJob = async (e) => {
    try {
      const jobId = e.target.name;
      const url = process.env.REACT_APP_BACKEND_URL;
      const response = await axios.post(`${url}/job/apply/${jobId}`, {}, config);
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
          <DataTable
            className="h-72"
            columns={columns}
            // data={jobs?.length ? jobs : []}
            data={jobMockData}
          />
        </CardContent>
      </Card>

    </div>
  )
}

export default Dashboard
