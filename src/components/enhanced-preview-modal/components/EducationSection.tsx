import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Resume } from '@/mock/resume';

type Props = {
  data: Resume;
  setData: (resume: Resume) => void;
};

export const EducationSection = ({ data, setData }: Props) => {
  const handleEduChange = (idx: number, field: string, value: string) => {
    const updated = data.educations.map((edu, i) =>
      i === idx ? { ...edu, [field]: value } : edu,
    );
    setData({ ...data, educations: updated });
  };

  const handleDescChange = (idx: number, descIdx: number, value: string) => {
    const updated = data.educations.map((edu, i) =>
      i === idx
        ? {
            ...edu,
            descriptions: edu.descriptions.map((desc, j) =>
              j === descIdx ? value : desc,
            ),
          }
        : edu,
    );
    setData({ ...data, educations: updated });
  };

  const handleAddEdu = () => {
    setData({
      ...data,
      educations: [
        ...data.educations,
        { degree: '', school: '', date: '', gpa: '', descriptions: [''] },
      ],
    });
  };

  const handleRemoveEdu = (idx: number) => {
    setData({
      ...data,
      educations: data.educations.filter((_, id) => id !== idx),
    });
  };

  const handleAddDesc = (idx: number) => {
    const updated = data.educations.map((edu, i) =>
      i === idx ? { ...edu, descriptions: [...edu.descriptions, ''] } : edu,
    );
    setData({ ...data, educations: updated });
  };

  const handleRemoveDesc = (idx: number, descIdx: number) => {
    const updated = data.educations.map((exp, i) =>
      i === idx
        ? {
            ...exp,
            descriptions: exp.descriptions.filter((_, j) => j !== descIdx),
          }
        : exp,
    );
    setData({ ...data, educations: updated });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-1 text-2xl font-semibold">Education</h2>
      <p className="mb-6 text-sm text-gray-500">
        Add your education in reverse chronological order
      </p>
      {data.educations.map((edu, idx) => (
        <div
          key={idx}
          className="relative mb-4 space-y-2 rounded-lg border p-4 shadow-sm"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="font-semibold">Education {idx + 1}</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500"
              onClick={() => handleRemoveEdu(idx)}
            >
              Remove
            </Button>
          </div>

          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                value={edu.date}
                onChange={(e) => handleEduChange(idx, 'date', e.target.value)}
                placeholder="Date"
                label="Date"
                labelClass="text-xs"
              />
              <Input
                value={edu.gpa}
                onChange={(e) => handleEduChange(idx, 'gpa', e.target.value)}
                placeholder="GPA"
                label="GPA"
                labelClass="text-xs"
              />
            </div>
            <Input
              value={edu.degree}
              onChange={(e) => handleEduChange(idx, 'degree', e.target.value)}
              placeholder="Degree"
              label="Degree"
              labelClass="text-xs"
            />
            <Input
              value={edu.school}
              onChange={(e) => handleEduChange(idx, 'school', e.target.value)}
              placeholder="School"
              label="School"
              labelClass="text-xs"
            />

            <div>
              <label className="mb-1 block text-xs font-medium">
                Bullet Points
              </label>
              {edu.descriptions.map((desc, descIdx) => (
                <div key={descIdx} className="mb-2 flex items-center gap-2">
                  <Textarea
                    key={descIdx}
                    value={desc}
                    onChange={(e) =>
                      handleDescChange(idx, descIdx, e.target.value)
                    }
                    placeholder="Description"
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
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => handleAddDesc(idx)}>
            Add Bullet
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={handleAddEdu}>
        Add Education
      </Button>
    </div>
  );
};
