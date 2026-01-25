import { BookOpen } from 'lucide-react';

const Diary = () => {
  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <BookOpen className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold mb-3">Diary</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Your trading diary will be displayed here. Record your thoughts, emotions, and lessons learned.
        </p>
      </div>
    </div>
  );
};

export default Diary;
