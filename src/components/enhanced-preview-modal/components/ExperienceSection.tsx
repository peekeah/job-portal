import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Resume } from '@/mock/resume';

type Props = {
  data: Resume;
  setData: (resume: Resume) => void;
};

export const ExperienceSection = ({ data, setData }: Props) => {
  const handleExpChange = (idx: number, field: string, value: string) => {
    const updated = data.workExperiences.map((exp, i) =>
      i === idx ? { ...exp, [field]: value } : exp,
    );
    setData({ ...data, workExperiences: updated });
  };

  const handleDescChange = (idx: number, descIdx: number, value: string) => {
    const updated = data.workExperiences.map((exp, i) =>
      i === idx
        ? {
            ...exp,
            descriptions: exp.descriptions.map((desc, j) =>
              j === descIdx ? value : desc,
            ),
          }
        : exp,
    );
    setData({ ...data, workExperiences: updated });
  };

  const handleAddExp = () => {
    setData({
      ...data,
      workExperiences: [
        ...data.workExperiences,
        { jobTitle: '', company: '', date: '', descriptions: [''] },
      ],
    });
  };

  const handleRemoveExp = (idx: number) => {
    setData({
      ...data,
      workExperiences: data.workExperiences.filter((_, i) => i !== idx),
    });
  };

  const handleAddDesc = (idx: number) => {
    const updated = data.workExperiences.map((exp, i) =>
      i === idx ? { ...exp, descriptions: [...exp.descriptions, ''] } : exp,
    );
    setData({ ...data, workExperiences: updated });
  };

  const handleRemoveDesc = (idx: number, descIdx: number) => {
    const updated = data.workExperiences.map((exp, i) =>
      i === idx
        ? {
            ...exp,
            descriptions: exp.descriptions.filter((_, j) => j !== descIdx),
          }
        : exp,
    );
    setData({ ...data, workExperiences: updated });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-1 text-2xl font-semibold">Work Experience</h2>
      <p className="mb-6 text-sm text-gray-500">
        Add your roles in reverse chronological order
      </p>
      {data.workExperiences.map((exp, idx) => (
        <div
          key={idx}
          className="relative mb-4 rounded-lg border bg-white p-4 shadow-sm"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="font-semibold">Position {idx + 1}</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500"
              onClick={() => handleRemoveExp(idx)}
            >
              Remove
            </Button>
          </div>
          <div className="mb-2 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium">
                Job Title
              </label>
              <Input
                value={exp.jobTitle}
                onChange={(e) =>
                  handleExpChange(idx, 'jobTitle', e.target.value)
                }
                placeholder="Job Title"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Company</label>
              <Input
                value={exp.company}
                onChange={(e) =>
                  handleExpChange(idx, 'company', e.target.value)
                }
                placeholder="Company"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium">
                Date Range
              </label>
              <Input
                value={exp.date}
                onChange={(e) => handleExpChange(idx, 'date', e.target.value)}
                placeholder="JAN 2022 – AUG 2024"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">
              Bullet Points
            </label>
            {exp.descriptions.map((desc, descIdx) => (
              <div key={descIdx} className="mb-2 flex items-center gap-2">
                <Textarea
                  value={desc}
                  onChange={(e) =>
                    handleDescChange(idx, descIdx, e.target.value)
                  }
                  placeholder="Bullet point"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500"
                  onClick={() => handleRemoveDesc(idx, descIdx)}
                >
                  ×
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAddDesc(idx)}
            >
              + Add Bullet
            </Button>
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={handleAddExp}>
        + Add Position
      </Button>
    </div>
  );
};
