"use client";

import CompanyProfile from '@/components/company-profile/page';
import StudentProfile from '@/components/student-profile/student-profile';
import { UserContext } from '@/contexts/user';
import React, { useContext } from 'react'

const Profile = () => {
  const { userType } = useContext(UserContext);
  return (
    <div>
      {
        userType === 'student' ? <StudentProfile /> : <CompanyProfile />
      }
    </div>
  )
}

export default Profile