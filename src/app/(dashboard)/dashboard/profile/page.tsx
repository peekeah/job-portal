"use client";

import CompanyProfile from '@/components/company-profile/page';
import StudentProfile from '@/components/student-profile/student-profile';
import { useSession } from 'next-auth/react';
import React from 'react'

const Profile = () => {
  const { data } = useSession()
  const role = data?.user?.user_type

  return (
    <div>
      {
        role === 'company' ? <CompanyProfile /> : <StudentProfile />
      }
    </div>
  )
}

export default Profile
