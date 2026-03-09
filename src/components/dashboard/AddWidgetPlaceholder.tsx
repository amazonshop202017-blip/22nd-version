import { Plus } from 'lucide-react';

interface AddWidgetPlaceholderProps {
  onClick: () => void;
}

export const AddWidgetPlaceholder = ({ onClick }: AddWidgetPlaceholderProps) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 min-h-[200px] rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 hover:bg-muted/40 hover:border-primary/40 transition-all cursor-pointer group"
    >
      <div className="h-10 w-10 rounded-full border-2 border-dashed border-muted-foreground/40 group-hover:border-primary/60 flex items-center justify-center transition-colors">
        <Plus className="h-5 w-5 text-muted-foreground/60 group-hover:text-primary/80 transition-colors" />
      </div>
      <span className="text-sm text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
        Click to add widget
      </span>
    </button>
  );
};
