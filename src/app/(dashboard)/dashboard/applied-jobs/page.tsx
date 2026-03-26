'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heading, Text } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { formatInitials } from '@/lib/formater';

export type Job = {
  id: string;
  job_role: string;
  description: string;
  ctc: number;
  stipend: number;
  location: string;
  skills_required: string[];
  company: {
    id: string;
    name: string;
    type: string;
    profile_pic?: string;
    address: string;
    website: string;
    size: string;
    state: string;
  };
};

type AppliedJob = {
  id: string;
  status: string;
  job: Job;
};

export type ApiResponse = {
  data: AppliedJob[];
};

const badgeClasses = new Map([
  ['applied', 'text-primary bg-primary/10 border-primary'],
  ['shortlisted', 'bg-yellow-50 text-yellow-400 border-yellow-400'],
  ['hired', 'bg-green-50 text-green-400 border-green-400'],
]);

function AppliedJobs() {
  const { data, error, isLoading } = useSWR<ApiResponse>(
    '/api/student/applied-jobs',
    fetcher,
  );

  const appliedJobs = data?.data ?? [];

  if (error) {
    return <div>error while fetching data</div>;
  }

  return (
    <div className="h-full w-full p-5 sm:p-7 md:px-10 lg:px-5">
      <CardTitle className="mb-3 text-2xl font-semibold text-gray-800">
        Applied Jobs
      </CardTitle>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Spinner className="h-6 w-6 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading...</span>
        </div>
      ) : appliedJobs?.length > 0 ? (
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {appliedJobs?.map((el) => {
            const job = el.job;
            const company = el.job.company;
            const status = el.status;

            return (
              <Card key={job.id} className='py-4 md:py-6'>
                <Link href={`job/${job.id}`}>
                  <CardContent className='px-4 md:px-6'>
                    <div className="flex justify-between">
                      <div className="mb-3 flex items-center gap-2 md:gap-4">
                        <Avatar className="size-12">
                          <AvatarImage
                            src={job.company.profile_pic}
                            alt="profile"
                          />
                          <AvatarFallback>{formatInitials(job.company.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-md">{company.name}</div>
                          <div className="text-sm text-neutral-500">
                            {company.address}
                          </div>
                        </div>
                      </div>
                      <div>
                        <Badge
                          className={cn(
                            'rounded-full',
                            badgeClasses.get(status),
                          )}
                        >
                          {status[0].toUpperCase() + status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <Heading variant="h4">{job.job_role}</Heading>
                    <Text className="line-clamp-2 text-neutral-500">
                      {job.description}
                    </Text>
                    <Text className="my-2 font-semibold">$ {job.ctc}k/year</Text>
                    <Text className="space-x-1 text-neutral-500">
                      {job?.skills_required.map((el) => (
                        <Badge key={el} variant={'outline'} className='rounded-xl border-primary text-primary bg-primary/10'>
                          {el}
                        </Badge>
                      ))}
                    </Text>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="py-10 text-center text-gray-500">
          No applied jobs found.
        </div>
      )}
    </div>
  );
}

export default AppliedJobs;
