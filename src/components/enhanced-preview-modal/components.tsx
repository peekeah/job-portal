import { Separator } from '../ui/separator';
import { AdditionalSection } from './components/AdditionalSection';
import { EducationSection } from './components/EducationSection';
import { ExperienceSection } from './components/ExperienceSection';
import { PersonalSection } from './components/PersonalSection';
import { ProjectsSection } from './components/ProjectsSection';
import { SkillsSection } from './components/SkillsSection';

export function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      {subtitle && (
        <p className="text-muted-foreground mt-0.5 text-sm">{subtitle}</p>
      )}
      <Separator className="mt-3" />
    </div>
  );
}

export {
  AdditionalSection,
  EducationSection,
  ExperienceSection,
  PersonalSection,
  ProjectsSection,
  SkillsSection,
};
