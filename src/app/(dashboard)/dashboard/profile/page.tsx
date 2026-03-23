'use client';

import CompanyProfile from '@/components/company-profile/page';
import StudentProfile from '@/components/student-profile/student-profile';
import { useSession } from 'next-auth/react';

const Profile = () => {
  const { data } = useSession();
  const role = data?.user?.user_type;

  return <>{role === 'company' ? <CompanyProfile /> : <StudentProfile />}</>;
};

export default Profile;
