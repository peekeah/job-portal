"use client"
import { useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Text } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";

type Skill = {
  id: number;
  value: string;
};

export default function PostJob() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [formData, setFormData] = useState({
    job_role: "",
    description: "",
    ctc: "",
    stipend: "",
    location: "",
    skill: ""
  });

  const router = useRouter();

  const addSkill = () => {
    setSkills((prev) => [...prev, {
      id: Math.floor(Math.random() * 100 + 100),
      value: formData.skill
    }]);

    setFormData((prev) => ({ ...prev, skill: "" }))
  }

  const removeSkill = (skillId: number) => {
    setSkills((prev) => prev.filter((skill) => skill.id !== skillId));
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...formData, skills_required: skills.map(el => el.value) };
      const res = await axios.post("/api/jobs", payload);
      alert(res.data.data);
      router.push("/dashboard");
    } catch (err: unknown) {
      let msg = "Something went wrong";
      if (err instanceof AxiosError) {
        msg = err.response?.data?.error;
      }
      console.error(err);
      alert(msg);
    }
  };

  return (
    <div className="flex mx-10 my-5 bg-muted/10 justify-center">
      <div className="">
        <Text className="text-2xl my-5 font-semibold">Post a Job</Text>
        <Card className="w-full py-10 px-2 min-w-2xl max-w-3xl shadow-sm">
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
              <div className="flex gap-3">
                <Input
                  name="skill"
                  value={formData.skill}
                  onChange={handleChange}
                  placeholder="Enter a skill (e.g. React, Node.js)"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="transition-all cursor-pointer"
                  onClick={addSkill}
                  disabled={!Boolean(formData.skill)}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
              <div className="flex gap-3 my-5">
                {skills.map((skill) => (
                  <Badge
                    key={skill.id}
                    className="flex items-center rounded-full px-3 py-2 text-base bg-primary/10 text-primary"
                  >
                    <p>{skill.value}</p>
                    <button
                      className="cursor-pointer"
                      onClick={() => removeSkill(skill.id)}
                    ><X className="size-4" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <Button className="w-full" onClick={handleSubmit}>
                Submit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div >
  );
}

