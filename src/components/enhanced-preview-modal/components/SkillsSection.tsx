import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Resume } from '@/mock/resume';

type Props = {
  data: Resume;
  setData: (resume: Resume) => void;
};

export const SkillsSection = ({ data, setData }: Props) => {
  const handleAddSkill = (idx: number, value: string) => {
    setData({
      ...data,
      skills: {
        ...data.skills,
        featuredSkills: data.skills.featuredSkills,
        descriptions: data.skills.descriptions.map((desc, i) =>
          i === idx ? value : desc,
        ),
      },
    });
  };

  const handleRemoveEntry = (idx: number) => {
    setData({
      ...data,
      skills: {
        ...data.skills,
        featuredSkills: data.skills.featuredSkills,
        descriptions: data.skills.descriptions.filter((_, i) => i !== idx),
      },
    });
  };

  const handleAddEntry = () => {
    setData({
      ...data,
      skills: {
        ...data.skills,
        featuredSkills: data.skills.featuredSkills,
        descriptions: [...data.skills.descriptions, ''],
      },
    });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-1 text-2xl font-semibold">Skills</h2>
      <p className="mb-6 text-sm text-gray-500">
        Tags for quick scanning, categories for detail
      </p>
      <div className="w-full space-y-3">
        <label className="block w-full text-xs font-medium">Skills</label>
        {data.skills.descriptions.map((desc, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <Textarea
              value={desc}
              onChange={(e) => handleAddSkill(idx, e.target.value)}
              placeholder="Skill Category"
              className="w-full"
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 transition-all hover:bg-red-500 hover:text-white"
              onClick={() => handleRemoveEntry(idx)}
            >
              ×
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={handleAddEntry}>
          Add
        </Button>
      </div>
    </div>
  );
};
