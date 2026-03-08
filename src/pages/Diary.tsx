import { motion } from 'framer-motion';
import { PageHeader } from '@/components/layout/PageHeader';
import { DiaryFolderSidebar } from '@/components/diary/DiaryFolderSidebar';
import { DiaryNotesList } from '@/components/diary/DiaryNotesList';
import { DiaryNoteEditor } from '@/components/diary/DiaryNoteEditor';

const Diary = () => {
  return (
    <div className="h-[calc(100vh-8rem)]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <PageHeader title="Diary" tooltip="Record your thoughts, emotions, and lessons to build self-awareness over time." />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl overflow-hidden h-[calc(100%-4rem)]"
      >
        <div className="grid grid-cols-[220px_280px_1fr] h-full">
          {/* Left Column - Folder Navigation */}
          <DiaryFolderSidebar />
          
          {/* Middle Column - Notes List */}
          <DiaryNotesList />
          
          {/* Right Column - Note Editor */}
          <DiaryNoteEditor />
        </div>
      </motion.div>
    </div>
  );
};

export default Diary;
