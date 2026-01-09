// ResumeTemplate.tsx
import { Resume } from "@/mock/resume";
import React from "react";

interface Props {
  data: Resume;
}

const ResumeViewer: React.FC<Props> = ({ data }) => {
  const {
    profile,
    workExperiences,
    educations,
    projects,
    skills,
    custom
  } = data;

  return (
    <div className="max-w-4xl mx-auto p-8 font-sans text-gray-800">
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
        <h2 className="text-xl font-semibold border-b mb-4">
          Work Experience
        </h2>
        {workExperiences.map((exp, index) => (
          <div key={index} className="mb-6">
            <div className="flex justify-between">
              <h3 className="font-medium">
                {exp.jobTitle} — {exp.company}
              </h3>
              <span className="text-sm text-gray-500">{exp.date}</span>
            </div>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              {exp.descriptions.map((desc, i) => (
                <li key={i}>{desc}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Projects */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold border-b mb-4">
          Projects
        </h2>
        {projects.map((project, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between">
              <h3 className="font-medium">{project.project}</h3>
              <span className="text-sm text-gray-500">
                {project.date}
              </span>
            </div>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              {project.descriptions.map((desc, i) => (
                <li key={i}>{desc}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Skills */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold border-b mb-4">Skills</h2>

        <div className="flex flex-wrap gap-2 mb-4">
          {skills.featuredSkills.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 text-sm bg-gray-200 rounded-full"
            >
              {skill.skill}
            </span>
          ))}
        </div>

        <ul className="list-disc ml-5 space-y-1">
          {skills.descriptions.map((desc, index) => (
            <li key={index}>{desc}</li>
          ))}
        </ul>
      </section>

      {/* Education */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold border-b mb-4">
          Education
        </h2>
        {educations.map((edu, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between">
              <h3 className="font-medium">
                {edu.degree}, {edu.school}
              </h3>
              <span className="text-sm text-gray-500">
                {edu.date}
              </span>
            </div>
            <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
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
          <h2 className="text-xl font-semibold border-b mb-4">
            Additional
          </h2>
          <ul className="list-disc ml-5 space-y-1">
            {custom.descriptions.map((desc, index) => (
              <li key={index}>{desc}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default ResumeViewer;
