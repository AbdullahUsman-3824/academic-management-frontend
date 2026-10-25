import { useState } from "react";
import {
  useSections,
  useCreateSection,
  useUpdateSection,
  useDeleteSection,
} from "../hooks/useAcademicQueries";

export function SectionManager({ batchId }: { batchId: string }) {
  const { data, isLoading } = useSections(batchId);
  const sections = data ?? [];

  const createMutation = useCreateSection();
  const updateMutation = useUpdateSection();
  const deleteMutation = useDeleteSection();

  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createMutation.mutate(
      { batchId, dto: { name: newName.trim() || undefined } },
      {
        onSuccess: () => setNewName(""),
        onError: (err) =>
          setError((err as Error)?.message ?? "Failed to create section."),
      },
    );
  };

  const startRename = (id: string, current: string) => {
    setRenamingId(id);
    setRenameValue(current);
  };

  const submitRename = (id: string) => {
    if (!renameValue.trim()) return;
    setError(null);
    updateMutation.mutate(
      { batchId, sectionId: id, dto: { name: renameValue.trim() } },
      {
        onSuccess: () => setRenamingId(null),
        onError: (err) =>
          setError((err as Error)?.message ?? "Failed to rename section."),
      },
    );
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Delete section "${name}"? This only works if it has no students.`)) {
      return;
    }
    setError(null);
    deleteMutation.mutate(
      { batchId, sectionId: id },
      {
        onError: (err) =>
          setError((err as Error)?.message ?? "Failed to delete section."),
      },
    );
  };

  return (
    <div style={{ padding: "16px 20px" }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
        Sections in this batch
      </div>

      {error && (
        <p style={{ color: "crimson", fontSize: 12.5, marginBottom: 10 }}>
          {error}
        </p>
      )}

      {isLoading ? (
        <p style={{ color: "var(--ink-faint)", fontSize: 13 }}>Loading sections…</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
          {sections.length === 0 && (
            <p style={{ color: "var(--ink-faint)", fontSize: 13 }}>
              No sections yet — the first student registered into this batch will
              auto-create section "A".
            </p>
          )}
          {sections.map((s) => (
            <div
              key={s.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                border: "1px solid var(--line)",
                borderRadius: 6,
                padding: "4px 8px",
                background: "#fff",
              }}
            >
              {renamingId === s.id ? (
                <>
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitRename(s.id);
                      if (e.key === "Escape") setRenamingId(null);
                    }}
                    style={{
                      width: 60,
                      padding: "2px 6px",
                      border: "1px solid var(--line)",
                      borderRadius: 4,
                      fontSize: 12.5,
                    }}
                  />
                  <button
                    type="button"
                    className="btn"
                    style={{ padding: "2px 8px", fontSize: 11 }}
                    onClick={() => submitRename(s.id)}
                    disabled={updateMutation.isPending}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn secondary"
                    style={{ padding: "2px 8px", fontSize: 11 }}
                    onClick={() => setRenamingId(null)}
                  >
                    ✕
                  </button>
                </>
              ) : (
                <>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</span>
                  <button
                    type="button"
                    className="btn secondary"
                    style={{ padding: "2px 8px", fontSize: 11 }}
                    onClick={() => startRename(s.id, s.name)}
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    className="btn secondary"
                    style={{ padding: "2px 8px", fontSize: 11, color: "crimson" }}
                    disabled={sections.length <= 1 || deleteMutation.isPending}
                    title={
                      sections.length <= 1
                        ? "Can't delete the only section in a batch"
                        : "Delete (fails if students are assigned)"
                    }
                    onClick={() => handleDelete(s.id, s.name)}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleCreate} style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Name (optional — leave blank for auto A/B/C…)"
          maxLength={10}
          style={{
            padding: "6px 10px",
            borderRadius: 5,
            border: "1px solid var(--line)",
            fontSize: 13,
            width: 280,
          }}
        />
        <button type="submit" className="btn" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Adding…" : "+ Add Section"}
        </button>
      </form>
    </div>
  );
}