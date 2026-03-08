import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PageHeaderProps {
  title: string;
  tooltip: string;
}

export const PageHeader = ({ title, tooltip }: PageHeaderProps) => {
  return (
    <div className="flex items-center gap-2">
      <h1 className="text-3xl font-bold text-foreground">{title}</h1>
      <Tooltip>
        <TooltipTrigger>
          <Info className="h-4 w-4 text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[280px]">
          <p className="text-sm">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
