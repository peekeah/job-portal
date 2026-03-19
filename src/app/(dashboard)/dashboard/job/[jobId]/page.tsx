import { JobDetails as CompanyJobDetails } from '@/components/job/company-job';
import { JobDetails } from '@/components/job/job-page';
import { authOptions } from '@/lib/auth';
import { Role } from '@/lib/auth-middleware';
import { getServerSession } from 'next-auth';

const Job = async () => {
  const session = await getServerSession(authOptions);
  const role = session?.user?.user_type as Role;

  return <>{role === 'company' ? <CompanyJobDetails /> : <JobDetails />}</>;
};

export default Job;
