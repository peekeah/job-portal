"use client";

import CompanyProfile from '@/components/company-profile/page';
import StudentProfile from '@/components/student-profile/student-profile';
import React from 'react'

const Profile = () => {
  const userType = "student";
  return (
    <div>
      {
        userType === 'company' ? <CompanyProfile /> : <StudentProfile />
      }
    </div>
  )
}

export default Profile
