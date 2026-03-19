'use client';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/core/lib/styles/index.css';

import { Viewer, Worker } from '@react-pdf-viewer/core';
import { Resume as ResumeResponse } from '@prisma/client';
import { Resume } from '@/mock/resume';

const JsonViewer: React.FC<{ data: Resume }> = ({ data }) => {
  const { profile, workExperiences, educations, projects, skills, custom } =
    data;

  return (
    <div className="mx-auto max-w-4xl p-3 font-sans text-gray-800">
      {/* Profile */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{profile.name}</h1>
        <p className="text-sm text-gray-600">
          {profile.location} · {profile.email} · {profile.phone}
        </p>
        <a
          href={profile.url}
          className="text-sm text-blue-600 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {profile.url}
        </a>
        <p className="mt-4">{profile.summary}</p>
      </header>

      {/* Work Experience */}
      <section className="mb-8">
        <h2 className="mb-4 border-b text-xl font-semibold">Work Experience</h2>
        {workExperiences.map((exp, index) => (
          <div key={index} className="mb-6">
            <div className="flex justify-between">
              <h3 className="font-medium">
                {exp.jobTitle} — {exp.company}
              </h3>
              <span className="text-sm text-gray-500">{exp.date}</span>
            </div>
            <ul className="mt-2 ml-5 list-disc space-y-1">
              {exp.descriptions.map((desc, i) => (
                <li key={i}>{desc}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Projects */}
      <section className="mb-8">
        <h2 className="mb-4 border-b text-xl font-semibold">Projects</h2>
        {projects.map((project, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between">
              <h3 className="font-medium">{project.project}</h3>
              <span className="text-sm text-gray-500">{project.date}</span>
            </div>
            <ul className="mt-2 ml-5 list-disc space-y-1">
              {project.descriptions.map((desc, i) => (
                <li key={i}>{desc}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Skills */}
      <section className="mb-8">
        <h2 className="mb-4 border-b text-xl font-semibold">Skills</h2>

        <div className="mb-4 flex flex-wrap gap-2">
          {skills.featuredSkills.map((skill, index) => (
            <span
              key={index}
              className="rounded-full bg-gray-200 px-3 py-1 text-sm"
            >
              {skill.skill}
            </span>
          ))}
        </div>

        <ul className="ml-5 list-disc space-y-1">
          {skills.descriptions.map((desc, index) => (
            <li key={index}>{desc}</li>
          ))}
        </ul>
      </section>

      {/* Education */}
      <section className="mb-8">
        <h2 className="mb-4 border-b text-xl font-semibold">Education</h2>
        {educations.map((edu, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between">
              <h3 className="font-medium">
                {edu.degree}, {edu.school}
              </h3>
              <span className="text-sm text-gray-500">{edu.date}</span>
            </div>
            <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>
            <ul className="mt-2 ml-5 list-disc space-y-1">
              {edu.descriptions.map((desc, i) => (
                <li key={i}>{desc}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Custom Section */}
      {custom.descriptions.length > 0 && (
        <section>
          <h2 className="mb-4 border-b text-xl font-semibold">Additional</h2>
          <ul className="ml-5 list-disc space-y-1">
            {custom.descriptions.map((desc, index) => (
              <li key={index}>{desc}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

type Props = {
  resume: ResumeResponse | Resume;
  onClose?: () => void;
};

function isResumeResponse(
  resume: ResumeResponse | Resume,
): resume is ResumeResponse {
  return 'type' in resume && 'url' in resume;
}

const ResumeViewer = ({ resume, onClose }: Props) => {
  const isPdfResume =
    isResumeResponse(resume) && resume.type === 'pdf' && resume.url;

  return (
    <>
      {isPdfResume ? (
        <div
          className="relative rounded-lg border bg-white dark:bg-gray-900"
          style={{ height: '750px' }}
        >
          {onClose ? (
            <button
              onClick={onClose}
              className="absolute top-0 right-8 z-10 cursor-pointer"
            >
              X
            </button>
          ) : null}
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
            <Viewer fileUrl={resume.url as string} />
          </Worker>
        </div>
      ) : isResumeResponse(resume) ? null : (
        <JsonViewer data={resume} />
      )}
    </>
  );
};

export default ResumeViewer;
