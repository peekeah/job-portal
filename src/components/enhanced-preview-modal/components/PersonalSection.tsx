import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Resume } from "@/mock/resume";

type Props = {
  data: Resume;
  setData: (resume: Resume) => void;
};

export const PersonalSection = ({ data, setData }: Props) => {
  const handleChange = (field: keyof Resume["profile"], value: string) => {
    setData({
      ...data,
      profile: {
        ...data.profile,
        [field]: value,
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-1">Personal Info</h2>
      <p className="text-sm text-gray-500 mb-6">
        Your basic contact and identity details
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium mb-1">Full Name</label>
          <Input
            value={data.profile.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Location</label>
          <Input
            value={data.profile.location}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="City, Country"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Email</label>
          <Input
            value={data.profile.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="Email"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Phone</label>
          <Input
            value={data.profile.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="+91 00000 00000"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium mb-1">
            Portfolio / LinkedIn URL
          </label>
          <Input
            value={data.profile.url}
            onChange={(e) => handleChange("url", e.target.value)}
            placeholder="https://yoursite.com"
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-xs font-medium mb-1">
          Professional Summary
        </label>
        <Textarea
          value={data.profile.summary}
          onChange={(e) => handleChange("summary", e.target.value)}
          placeholder="Brief summary about yourself"
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
};
