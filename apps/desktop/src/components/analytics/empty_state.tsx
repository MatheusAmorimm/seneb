import { Inbox } from "lucide-react";

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-slate-400 dark:text-slate-500">
      <Inbox size={28} className="opacity-60" />
      <p className="text-sm">{text}</p>
    </div>
  );
}
