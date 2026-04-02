'use client';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/core/lib/styles/index.css';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components//ui/dialog';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import ResumeViewer from '@/components//resume-viewer';
import { initialResume, Resume } from '@/mock/resume';
import { Tabs, TabsList, TabsTrigger } from '@/components//ui/tabs';
import {
  AdditionalSection,
  EducationSection,
  ExperienceSection,
  PersonalSection,
  ProjectsSection,
  SkillsSection,
} from './components';
import { Resume as ResumeDBEntry } from '@prisma/client';

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
  isEnhancing: boolean;
  enhancedResume: ResumeDBEntry | null;
  onCloseAction: () => void;
  onApplyAction: (
    jobId: string,
    editedResumeId: string,
    editedResume: Resume,
  ) => void;
  applying: boolean;
};

export default function EnhancedJobPreviewModal({
  onApplyAction,
  onCloseAction,
  jobId,
  applying,
  isEnhancing,
  enhancedResume,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedResume, setEditedResume] = useState<Resume>(initialResume);

  useEffect(() => {
    if (enhancedResume?.json) {
      setEditedResume(JSON.parse(enhancedResume?.json as string));
    }
  }, [enhancedResume]);

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedResume(JSON.parse(enhancedResume?.json as string));
    setIsEditing(false);
  };

  return (
    <Dialog open={true}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[86vh] min-w-4xl flex-col overflow-auto"
      >
        <DialogHeader>
          <DialogTitle className="mx-auto text-3xl">Resume Preview</DialogTitle>
        </DialogHeader>
        {isEnhancing || !editedResume ? (
          <div className="mt-52 flex justify-center">
            <Spinner className='size-8' />
          </div>
        ) : (
          <>
            <div className="flex-1">
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
                        enhancedResume?.id as string,
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
  setData: Dispatch<SetStateAction<Resume>>;
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
            <TabsTrigger
              key={s}
              value={s}
              className="flex-1 cursor-pointer text-xs"
            >
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
