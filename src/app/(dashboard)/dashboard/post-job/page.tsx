"use client"
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";

export default function PostJob() {
  const [skills, setSkills] = useState<string[]>([""]);
  const [formData, setFormData] = useState({
    job_role: "",
    description: "",
    ctc: "",
    stipend: "",
    location: "",
  });

  const router = useRouter();

  const addSkill = () => setSkills((prev) => [...prev, ""]);
  const removeSkill = (index: number) =>
    setSkills((prev) => prev.filter((_, i) => i !== index));
  const handleSkillChange = (index: number, value: string) => {
    const updated = [...skills];
    updated[index] = value;
    setSkills(updated);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...formData, skills_required: skills };
      const res = await axios.post("/api/jobs", payload);
      alert(res.data.data);
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="flex min-h-screen bg-muted/10">
      <div className="flex-1 p-6 flex justify-center">
        <Card className="w-full max-w-3xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Post a Job</CardTitle>
          </CardHeader>

          {/* <Separator className="my-2" /> */}

          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Job Role"
                name="job_role"
                value={formData.job_role}
                onChange={handleChange}
                placeholder="e.g. Frontend Developer"
              />
              <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Remote / Bangalore"
              />
            </div>

            <Textarea
              label="Description"
              name="description"
              rows={10}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the job role and requirements..."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="CTC"
                name="ctc"
                type="number"
                value={formData.ctc}
                onChange={handleChange}
                placeholder="Enter CTC"
              />
              <Input
                label="Stipend"
                name="stipend"
                type="number"
                value={formData.stipend}
                onChange={handleChange}
                placeholder="Enter stipend"
              />
            </div>

            <div className="space-y-3 mt-2">
              <h4 className="text-sm font-medium text-foreground">
                Skills Required
              </h4>
              {skills.map((skill, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={skill}
                    onChange={(e) => handleSkillChange(index, e.target.value)}
                    placeholder="Enter a skill (e.g. React, Node.js)"
                  />
                  {skills.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeSkill(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-fit"
                onClick={addSkill}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Skill
              </Button>
            </div>

            <div className="pt-4">
              <Button className="w-full" onClick={handleSubmit}>
                Submit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

