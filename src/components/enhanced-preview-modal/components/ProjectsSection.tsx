import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Resume } from "@/mock/resume";

type Props = {
  data: Resume;
  setData: (resume: Resume) => void;
};

export const ProjectsSection = ({ data, setData }: Props) => {
  const handleProjectChange = (idx: number, field: string, value: string) => {
    const updated = data.projects.map((project, i) =>
      i === idx ? { ...project, [field]: value } : project
    );
    setData({ ...data, projects: updated });
  };

  const handleDescChange = (idx: number, descIdx: number, value: string) => {
    const updated = data.projects.map((project, i) =>
      i === idx
        ? {
            ...project,
            descriptions: project.descriptions.map((desc, j) =>
              j === descIdx ? value : desc
            ),
          }
        : project
    );
    setData({ ...data, projects: updated });
  };

  const handleAddProject = () => {
    setData({
      ...data,
      projects: [
        ...data.projects,
        { project: "", date: "", descriptions: [""] }
      ]
    });
  };

  const handleRemoveProject = (idx: number) => {
    setData({
      ...data,
      projects: data.projects.filter((_, i) => i !== idx)
    });
  };

  const handleAddDesc = (idx: number) => {
    const updated = data.projects.map((project, i) =>
      i === idx
        ? { ...project, descriptions: [...project.descriptions, ""] }
        : project
    );
    setData({ ...data, projects: updated });
  };

  const handleRemoveDesc = (idx: number, descIdx: number) => {
    const updated = data.projects.map((project, i) =>
      i === idx
        ? { ...project, descriptions: project.descriptions.filter((_, j) => j !== descIdx) }
        : project
    );
    setData({ ...data, projects: updated });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-1">Projects</h2>
      <p className="text-sm text-gray-500 mb-6">Highlight your most impactful work</p>
      {data.projects.map((project, idx) => (
        <div key={idx} className="border rounded-lg p-4 mb-4 bg-white shadow-sm relative">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Project {idx + 1}</span>
            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleRemoveProject(idx)}>Remove</Button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1">Project Name</label>
              <Input
                value={project.project}
                onChange={e => handleProjectChange(idx, "project", e.target.value)}
                placeholder="Project name / title"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Date</label>
              <Input
                value={project.date}
                onChange={e => handleProjectChange(idx, "date", e.target.value)}
                placeholder="Date"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Description</label>
              {project.descriptions.map((desc, descIdx) => (
                <div key={descIdx} className="flex items-center gap-2 mb-2">
                  <Textarea
                    value={desc}
                    onChange={e => handleDescChange(idx, descIdx, e.target.value)}
                    placeholder="Description"
                    className="flex-1"
                  />
                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleRemoveDesc(idx, descIdx)}>×</Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={() => handleAddDesc(idx)}>+ Add Description</Button>
            </div>
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={handleAddProject}>+ Add Project</Button>
    </div>
  );
};
