'use client';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/core/lib/styles/index.css';
import useSWRMutation from 'swr/mutation';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components//ui/dialog';
import axios from 'axios';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import ResumeViewer from '@/components//resume-viewer';
import { Resume } from '@/mock/resume';
import { Tabs, TabsList, TabsTrigger } from '@/components//ui/tabs';
import {
  AdditionalSection,
  EducationSection,
  ExperienceSection,
  PersonalSection,
  ProjectsSection,
  SkillsSection,
} from './components';
import { toast } from 'sonner';

const SECTIONS = [
  'Personal',
  'Experience',
  'Projects',
  'Skills',
  'Education',
  'Additional',
];

type Props = {
  jobId: string;
  onCloseAction: () => void;
  onApplyAction: (
    jobId: string,
    editedResumeId: string,
    editedResume: Resume,
  ) => void;
  applying: boolean;
};

const getEnhancededitedResume = async (
  url: string,
  { arg }: { arg: string },
) => {
  const res = await axios.post(url + arg);
  return res.data;
};

export default function EnhancedJobPreviewModal({
  onApplyAction,
  onCloseAction,
  applying,
  jobId,
}: Props) {
  const {
    data: enhancededitedResumeRes,
    trigger: getEnhancededitedResumeAction,
    isMutating: isLoading,
    error,
  } = useSWRMutation('/api/jobs/enhance-resume/', getEnhancededitedResume);
  const [isEditing, setIsEditing] = useState(false);
  const [editedResume, setEditedResume] = useState<Resume | null>(null);

  useEffect(() => {
    if (jobId) {
      getEnhancededitedResumeAction(jobId);
    }
  }, [jobId]);

  useEffect(() => {
    if (enhancededitedResumeRes?.data?.json && !isEditing) {
      const raweditedResume = enhancededitedResumeRes.data.json as string;
      setEditedResume(JSON.parse(raweditedResume));
    }
  }, [enhancededitedResumeRes?.data]);

  if (error) {
    onCloseAction();
    const errMsg = error?.response?.data?.message || 'Something went wrong';
    toast.error(errMsg);
  }

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (enhancededitedResumeRes?.data?.json) {
      const raweditedResume = enhancededitedResumeRes.data.json as string;
      setEditedResume(JSON.parse(raweditedResume));
    }
    setIsEditing(false);
  };

  return (
    <Dialog open={true}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] min-w-4xl overflow-auto"
      >
        <DialogHeader>
          <DialogTitle className="mx-auto text-3xl">Resume Preview</DialogTitle>
        </DialogHeader>
        {isLoading || !editedResume ? (
          <div className="flex h-screen items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <>
            <div>
              {!isEditing ? (
                <ResumeViewer resume={editedResume} />
              ) : (
                <EditResume
                  editedResume={editedResume}
                  setEditedResume={setEditedResume}
                />
              )}
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={onCloseAction}>
                Close
              </Button>
              {!isEditing ? (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() =>
                      onApplyAction(
                        jobId,
                        enhancededitedResumeRes.data.id,
                        editedResume,
                      )
                    }
                    disabled={applying}
                  >
                    {applying ? <Spinner /> : 'Apply'}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save</Button>
                </>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

type RendererProps = {
  activeComponent: string;
  data: Resume;
  setData: () => void;
};

const RenderComponent = ({ activeComponent, data, setData }: RendererProps) => {
  switch (activeComponent) {
    case 'Personal':
      return <PersonalSection data={data} setData={setData} />;
    case 'Experience':
      return <ExperienceSection data={data} setData={setData} />;
    case 'Projects':
      return <ProjectsSection data={data} setData={setData} />;
    case 'Skills':
      return <SkillsSection data={data} setData={setData} />;
    case 'Education':
      return <EducationSection data={data} setData={setData} />;
    case 'Additional':
      return <AdditionalSection data={data} setData={setData} />;
    default:
      return <PersonalSection data={data} setData={setData} />;
  }
};

const EditResume = ({
  editedResume,
  setEditedResume,
}: {
  editedResume: Resume;
  setEditedResume: Dispatch<SetStateAction<Resume>>;
}) => {
  const [activeSection, setActiveSection] = useState('Personal');

  return (
    <div>
      <Tabs
        value={activeSection}
        onValueChange={(val) => setActiveSection(val)}
        className="mb-8"
      >
        <TabsList className="w-full">
          {SECTIONS.map((s) => (
            <TabsTrigger key={s} value={s} className="flex-1 text-xs">
              {s}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Active section form */}
      <RenderComponent
        data={editedResume}
        setData={setEditedResume}
        activeComponent={activeSection}
      />
    </div>
  );
};
