"use client"
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Text } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobSchema as initialJobSchama } from "@/lib/schema";
import z from "zod";
import clsx from "clsx";

type Job = z.infer<typeof schema>

const updatedSchema = initialJobSchama.omit({ skills_required: true })

const schema = updatedSchema.extend({
  ctc: z.string().min(1, "CTC is required"),
  stipend: z.string(),
  skill: z.string(),
  skills_required: z.array(
    z.object({
      id: z.number(),
      value: z.string()
    })).min(1, "Atleast 1 skill is required")
})

const initialJobValues: Job = {
  job_role: "",
  description: "",
  ctc: "",
  stipend: "",
  location: "",
  skill: "",
  skills_required: []
}

export default function PostJob() {

  const form = useForm<Job>({
    resolver: zodResolver(schema),
    defaultValues: initialJobValues,
  })


  const skill = form.watch("skill")
  form.watch("skills_required")

  const router = useRouter();

  const addSkill = () => {
    const skills = form.getValues("skills_required")
    const skill = form.getValues("skill")
    form.setValue("skills_required", skills.concat({
      id: Date.now(),
      value: skill
    }))
    form.resetField("skill")
    form.clearErrors("skills_required")
  }

  const removeSkill = (skillId: number) => {
    const filteredSkills = form.getValues("skills_required")
      .filter(el => el.id !== skillId)
    form.setValue("skills_required", filteredSkills)
    if (form.formState.isSubmitted) {
      form.trigger("skills_required")
    }
  }

  const handleSubmit = async (formData: Job) => {
    try {
      const payload = {
        ...formData,
        skills_required: formData.skills_required.map(el => el.value)
      };
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
    <div className="p-5 sm:p-7 md:px-10 lg:px-5 h-full w-full">
      <Text className="text-2xl font-semibold">Post Job</Text>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex mx-10 my-5 bg-muted/10 justify-center mt-24"
      >
        <Card className="w-full py-10 px-2 min-w-2xl max-w-3xl shadow-sm">
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="job_role"
                control={form.control}
                render={({ field, fieldState: { error, invalid } }) => (
                  <Input
                    {...field}
                    label="Job Role"
                    aria-invalid={invalid}
                    placeholder="e.g. Frontend Developer"
                    error={
                      error ? error.message : ""
                    }
                  />
                )}
              />
              <Controller
                name="location"
                control={form.control}
                render={({ field, fieldState: { error, invalid } }) => (
                  <Input
                    {...field}
                    label="Location"
                    placeholder="e.g. Remote / Bangalore"
                    aria-invalid={invalid}
                    error={
                      error ? error.message : ""
                    }
                  />
                )}
              />
            </div>
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState: { error, invalid } }) => (
                <Textarea
                  {...field}
                  label="Description"
                  rows={10}
                  placeholder="Describe the job role and requirements..."
                  aria-invalid={invalid}
                  error={
                    error ? error.message : ""
                  }
                />
              )}
            />


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="ctc"
                control={form.control}
                render={({ field, fieldState: { error, invalid } }) => (
                  <Input
                    {...field}
                    label="CTC"
                    type="number"
                    placeholder="Enter CTC"
                    aria-invalid={invalid}
                    error={
                      error ? error.message : ""
                    }
                  />
                )}
              />
              <Controller
                name="stipend"
                control={form.control}
                render={({ field, fieldState: { error, invalid } }) => (
                  <Input
                    {...field}
                    label="Stipend"
                    type="number"
                    placeholder="Enter stipend"
                    aria-invalid={invalid}
                    error={
                      error ? error.message : ""
                    }
                  />
                )}
              />
            </div>

            <div className="space-y-3 mt-2">
              <div>
                <div className="flex items-end gap-3">
                  <Controller
                    name="skill"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Skills Required"
                        placeholder="Enter skill"
                        aria-invalid={Boolean(form.formState.errors["skills_required"])}
                      />
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="transition-all cursor-pointer"
                    onClick={addSkill}
                    disabled={!Boolean(skill)}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
                {
                  form.formState.errors["skills_required"] &&
                  <span className="text-sm text-destructive">{form.formState.errors["skills_required"]?.message || ""}</span>
                }
              </div>
              <div className={clsx(
                "flex gap-3 my-5",
                !form.getValues("skills_required").length && "hidden"
              )}
              >
                {form.getValues("skills_required")
                  .map((skill) => (
                    <Badge
                      key={skill.id}
                      className="flex items-center rounded-full px-3 py-2 text-base bg-primary/10 text-primary"
                    >
                      <p>{skill.value}</p>
                      <button
                        className="cursor-pointer"
                        type="button"
                        onClick={() => removeSkill(skill.id)}
                      ><X className="size-4" />
                      </button>
                    </Badge>
                  ))}
              </div>
            </div>

            <div className="pt-4">
              <Button className="w-full" type="submit" >
                Submit
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div >
  );
}

