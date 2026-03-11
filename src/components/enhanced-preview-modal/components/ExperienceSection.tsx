import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Resume } from "@/mock/resume";

type Props = {
  data: Resume;
  setData: (resume: Resume) => void;
};

export const ExperienceSection = ({ data, setData }: Props) => {
  const handleExpChange = (idx: number, field: string, value: string) => {
    const updated = data.workExperiences.map((exp, i) =>
      i === idx ? { ...exp, [field]: value } : exp
    );
    setData({ ...data, workExperiences: updated });
  };

  const handleDescChange = (idx: number, descIdx: number, value: string) => {
    const updated = data.workExperiences.map((exp, i) =>
      i === idx
        ? {
            ...exp,
            descriptions: exp.descriptions.map((desc, j) =>
              j === descIdx ? value : desc
            ),
          }
        : exp
    );
    setData({ ...data, workExperiences: updated });
  };

  const handleAddExp = () => {
    setData({
      ...data,
      workExperiences: [
        ...data.workExperiences,
        { jobTitle: "", company: "", date: "", descriptions: [""] }
      ]
    });
  };

  const handleRemoveExp = (idx: number) => {
    setData({
      ...data,
      workExperiences: data.workExperiences.filter((_, i) => i !== idx)
    });
  };

  const handleAddDesc = (idx: number) => {
    const updated = data.workExperiences.map((exp, i) =>
      i === idx
        ? { ...exp, descriptions: [...exp.descriptions, ""] }
        : exp
    );
    setData({ ...data, workExperiences: updated });
  };

  const handleRemoveDesc = (idx: number, descIdx: number) => {
    const updated = data.workExperiences.map((exp, i) =>
      i === idx
        ? { ...exp, descriptions: exp.descriptions.filter((_, j) => j !== descIdx) }
        : exp
    );
    setData({ ...data, workExperiences: updated });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-1">Work Experience</h2>
      <p className="text-sm text-gray-500 mb-6">Add your roles in reverse chronological order</p>
      {data.workExperiences.map((exp, idx) => (
        <div key={idx} className="border rounded-lg p-4 mb-4 bg-white shadow-sm relative">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Position {idx + 1}</span>
            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleRemoveExp(idx)}>Remove</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <div>
              <label className="block text-xs font-medium mb-1">Job Title</label>
              <Input
                value={exp.jobTitle}
                onChange={e => handleExpChange(idx, "jobTitle", e.target.value)}
                placeholder="Job Title"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Company</label>
              <Input
                value={exp.company}
                onChange={e => handleExpChange(idx, "company", e.target.value)}
                placeholder="Company"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium mb-1">Date Range</label>
              <Input
                value={exp.date}
                onChange={e => handleExpChange(idx, "date", e.target.value)}
                placeholder="JAN 2022 – AUG 2024"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Bullet Points</label>
            {exp.descriptions.map((desc, descIdx) => (
              <div key={descIdx} className="flex items-center gap-2 mb-2">
                <Textarea
                  value={desc}
                  onChange={e => handleDescChange(idx, descIdx, e.target.value)}
                  placeholder="Bullet point"
                  className="flex-1"
                />
                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleRemoveDesc(idx, descIdx)}>×</Button>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => handleAddDesc(idx)}>+ Add Bullet</Button>
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={handleAddExp}>+ Add Position</Button>
    </div>
  );
};
