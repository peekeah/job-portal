"use client"
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, DollarSign, Building2, BookmarkPlus, Share2 } from 'lucide-react';
import useSWR, { useSWRConfig } from 'swr';
import z from 'zod';
import { companySchema, jobSchema } from '@/lib/schema';
import { fetcher } from '@/lib/fetcher';
import { companySizeMap } from '@/components/company-profile/page';
import { useParams } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import EnhancedjobIdPreviewModal from '../enhanced-preview-modal';
import { useState } from 'react';
import useSWRMutation from 'swr/mutation';
import { Card } from '../ui/card';

type Job = z.infer<typeof jobSchema> & {
  id: string;
  company: z.infer<typeof companySchema>;
}

export type ResJob = {
  id: string;
  job_role: string;
  description: string;
  ctc: number;
  stipend: number;
  location: string;
  company: {
    name: string;
    company_founding_year: number;
    company_type: string;
    address: string;
  }
  skills_required: string[];
};

export type Response = {
  status: boolean;
  data: ResJob[]
}

type ApplyJobPaylod  = {
  jobId: string;
  resumeId: string;
}

const applyJobApiCall = async (url: string, { arg: { jobId, resumeId } }: { arg: ApplyJobPaylod }) => {
  try {
    const payload = resumeId ? { resumeId } : {}
    const response = await axios.post(url + jobId, payload);
    alert(response.data.data);
    return response.data
  } catch (err) {
    if (err instanceof AxiosError) {
      alert(err?.response?.data?.message)
    } else {
      alert("something went wrong")
    }
    console.log(err);
  }
}

export function JobDetails() {

  const formatCompanySize = (size: string) => {
    return companySizeMap.get(size) + " " + "employees"
  };

  const getCompanyInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const { mutate } = useSWRConfig()
  const { trigger: handleApplyJob, isMutating: applying } = useSWRMutation(`/api/jobs/apply/`, applyJobApiCall)
  const [enahncePreviewJobId, setEnahancePreviewJobId] = useState<string>("")

  const { jobId } = useParams<{ jobId: string }>();

  const { data: jobRes, isLoading } = useSWR<{ data: Job }>('/api/jobs/' + jobId, fetcher)
  const jobData = jobRes?.data

  const applyWithEdits = async (jobId: string, resumeId: string) => {
    if (!enahncePreviewJobId) return;
    mutate("/api/jobs",
      (currentData?: Response) => {
        if (!currentData) return currentData;

        return {
          ...currentData,
          data: currentData.data.filter(
            (job: ResJob) => job.id !== jobId
          ),
        };
      },
      false
    );
    try {
      await handleApplyJob({ jobId, resumeId });
    } catch (err) {
      mutate("/api/jobs");
    }

    setEnahancePreviewJobId("");
  }

  return (
    <>{
      jobData ?
        <div className="min-h-screen flex py-4 sm:py-8 lg:py-12 px-3 sm:px-4 lg:px-6">
          <div className="max-w-4xl w-full">
            <Card>
              {/* Header */}
              <div className="space-y-4 sm:space-y-6 pb-6 sm:pb-8 px-4 sm:px-6 pt-6">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex gap-3 sm:gap-5 w-full sm:w-auto">
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg sm:text-xl lg:text-2xl font-bold ring-2 sm:ring-4 ring-white shadow-lg">
                        {getCompanyInitials(jobData.company.name)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-green-500 w-5 h-5 sm:w-7 sm:h-7 rounded-full border-2 sm:border-4 border-white"></div>
                    </div>
                    <div className="space-y-2 sm:space-y-3 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                        <Building2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="font-semibold text-gray-900 truncate">{jobData.company.name}</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 sm:py-1 rounded-full font-medium whitespace-nowrap">Actively hiring</span>
                      </div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent leading-tight">
                        {jobData.job_role}
                      </h1>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                        <div className="flex items-center gap-1 sm:gap-1.5 text-gray-600">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">{jobData.location}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-1.5 text-gray-600">
                          <Building2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">{jobData.company.company_type}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-1.5 text-gray-600">
                          <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">{formatCompanySize(jobData.company.size!)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 self-end sm:self-start">
                    <button className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-gray-300 hover:bg-gray-100 flex items-center justify-center">
                      <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-gray-300 hover:bg-gray-100 flex items-center justify-center">
                      <BookmarkPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-6 sm:space-y-8 pb-6 sm:pb-8 px-4 sm:px-6">
                {/* CTC Card */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="w-full sm:w-auto">
                    <div className="flex items-center gap-2 text-blue-100 mb-2">
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-xs sm:text-sm font-medium">Annual Compensation</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold">₹{jobData.ctc} LPA</p>
                    {jobData.stipend > 0 && (
                      <p className="text-xs sm:text-sm text-blue-100 mt-1">+ ₹{jobData.stipend} stipend</p>
                    )}
                  </div>
                  <div className='space-x-3'>
                    {/* // FIXME: Update api call to latest */}
                    <Button
                      className="lg:p-5 lg:text-md bg-white text-blue-600 hover:bg-blue-50 font-semibold transition-colors"
                      onClick={() => handleApplyJob({ jobId: jobData?.id, resumeId: "1" })}
                    >
                      Apply
                    </Button>
                    <Button
                      className="lg:p-5 lg:text-md bg-white text-blue-600 hover:bg-blue-50 font-semibold transition-colors"
                      onClick={() => setEnahancePreviewJobId(jobData.id)}
                    >
                      Enhance & Apply
                    </Button>
                  </div>
                </div>

                {/* About the Role */}
                <div className="space-y-3 sm:space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold">About the Role</h2>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                    {jobData.description}
                  </p>
                </div>

                <hr className="border-gray-200" />

                {/* Company Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Company Founded</p>
                    <p className="font-semibold text-base sm:text-lg">{jobData.company.founding_year}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Company Size</p>
                    <p className="font-semibold text-base sm:text-lg">{formatCompanySize(jobData.company.size!)}</p>
                  </div>
                  <div className="sm:col-span-2 md:col-span-1">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Location</p>
                    <p className="font-semibold text-base sm:text-lg break-words">{jobData.company.address}</p>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* About Company */}
                <div className="space-y-3 sm:space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold">About {jobData.company.name}</h2>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                    {jobData.company.bio}
                  </p>

                  {jobData.company.website && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <span>🌐</span>
                      <a
                        href={jobData.company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {jobData.company.website}
                      </a>
                    </div>
                  )}
                </div>

                <hr className="border-gray-200" />

                {/* Required Skills */}
                <div className="space-y-4 sm:space-y-5">
                  <h2 className="text-xl sm:text-2xl font-bold">Required Skills</h2>

                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {jobData.skills_required.map((skill, index) => (
                      <span
                        key={index}
                        className="flex items-center rounded-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-sm sm:text-base bg-blue-50 text-blue-600 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div> : null
    }

      {
        enahncePreviewJobId && (
          <EnhancedjobIdPreviewModal
            jobId={enahncePreviewJobId}
            applying={applying}
            onApplyAction={applyWithEdits}
            onCloseAction={() => { setEnahancePreviewJobId(""); }}
          />
        )
      }
    </>

  );
}

