import { useContext } from 'react';
import { UserContext } from '@/contexts/user';

export default function CompanyProfile() {
  const { userData } = useContext(UserContext);

  return (
    <div className='p-8'>
      <h1 className='pb-3 font-semibold text-2xl'>Company Profile</h1>
      <div className='grid grid-cols-2 place-content-center w-1/2 mx-auto mt-42 gap-3'>
        <div>Company Name</div>
        <div>{userData?.name}</div>
        <div>Year Founded</div>
        <div>{userData?.founding_year}</div>
        <div>Company Type</div>
        <div>{userData?.company_type}</div>
        <div>Email</div>
        <div>{userData?.email}</div>
        <div>Phone No</div>
        <div>{userData?.contact_no}</div>
        <div>Website</div>
        <div>{userData?.website}</div>
        <div>State</div>
        <div>{userData?.state}</div>
        <div>Company Size</div>
        <div>{userData?.size}</div>
        <div>Company Bio</div>
        <div>{userData?.bio}</div>
      </div>
    </div>
  )
}

