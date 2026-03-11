import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Resume } from "@/mock/resume";

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
          i === idx ? value : desc
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
        descriptions: [...data.skills.descriptions, ""],
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-1">Skills</h2>
      <p className="text-sm text-gray-500 mb-6">Tags for quick scanning, categories for detail</p>
      <div className="space-y-3 w-full">
        <label className="block text-xs font-medium w-full">Skills</label>
        {data.skills.descriptions.map((desc, idx) => (
          <div key={idx} className="flex gap-3 items-center">
            <Textarea
              value={desc}
              onChange={e => handleAddSkill(idx, e.target.value)}
              placeholder="Skill Category"
              className="w-full"
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-white hover:bg-red-500 transition-all"
              onClick={() => handleRemoveEntry(idx)}
            >×</Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={handleAddEntry}>Add</Button>
      </div>
    </div>
  );
};
