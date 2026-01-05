import { useDroppable } from "@dnd-kit/core";

export function UnassignedDrop({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: "unassigned",
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        rounded-2xl border p-4 min-h-[140px]
        ${isOver ? "bg-red-50 border-red-400" : "bg-white"}
      `}
    >
      <h3 className="font-semibold mb-3">未対応</h3>
      <div
        className="space-y-2
        grid gap-3
        grid-cols-1
        md:grid-cols-3"
      >
        {children}
      </div>
    </div>
  );
}
