import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"
import { Resume } from "@/mock/resume";

type Props = {
  data: Resume;
  setData: (resume: Resume) => void;
};

export const AdditionalSection = ({ data, setData }: Props) => {
  const handleDescChange = (idx: number, value: string) => {
    setData({
      ...data,
      custom: {
        ...data.custom,
        descriptions: data.custom.descriptions.map((desc, i) =>
          i === idx ? value : desc
        ),
      },
    });
  };

  const handleAddDesc = () => {
    setData({
      ...data,
      custom: {
        ...data.custom,
        descriptions: [...data.custom.descriptions, ""],
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-1">Additional Section</h2>
      <p className="text-sm text-gray-500 mb-6">Add additionl information here</p>
      {data.custom.descriptions.map((desc, idx) => (
        <Textarea
          key={idx}
          value={desc}
          onChange={e => handleDescChange(idx, e.target.value)}
          placeholder="Description"
        />
      ))}
      <Button variant="ghost" size="sm" className="mt-4" onClick={handleAddDesc}>Add Entry</Button>
    </div>
  );
};
