import { cn } from '@/lib/utils';
import { IconBriefcaseFilled } from '@tabler/icons-react';

type LogoProps = {
  className?: string;
};

export const Logo = (props: LogoProps) => {
  const { className } = props;
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <IconBriefcaseFilled size={18} className="text-primary" />
      <span className="text-foreground leadingnone text-lg font-semibold tracking-tight">
        Next<span className="text-primary">Hire</span>
      </span>
    </div>
  );
};
