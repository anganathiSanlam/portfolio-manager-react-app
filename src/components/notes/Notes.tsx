import { useApp } from "../../context/AppContext";
import { pageData } from "../../data";

export default function Notes() {
  const { state, dispatch } = useApp();
  const data = pageData["notes"];

  const activeNote = state.noteRecords.find((n) => n.id === state.selectedNoteId);
  const draft = state.noteDrafts[state.selectedNoteId];

  const displayNote = draft
    ? { ...activeNote!, title: draft.title, meetingRecord: draft.meetingRecord }
    : activeNote;

  function handleTitleChange(val: string) {
    if (!activeNote) return;
    dispatch({
      type: "SAVE_NOTE_DRAFT",
      noteId: activeNote.id,
      draft: {
        title: val,
        talkingPoints: draft?.talkingPoints ?? activeNote.talkingPoints,
        meetingRecord: draft?.meetingRecord ?? activeNote.meetingRecord,
        actionItems: draft?.actionItems ?? activeNote.actionItems,
      },
    });
  }

  function handleBodyChange(val: string) {
    if (!activeNote) return;
    dispatch({
      type: "SAVE_NOTE_DRAFT",
      noteId: activeNote.id,
      draft: {
        title: draft?.title ?? activeNote.title,
        talkingPoints: draft?.talkingPoints ?? activeNote.talkingPoints,
        meetingRecord: val,
        actionItems: draft?.actionItems ?? activeNote.actionItems,
      },
    });
  }

  return (
    <div style={{ padding: 0 }}>
      <div className="page-heading" style={{ padding: "24px 28px 0" }}>
        <div className="page-heading-text">
          <h1>{data.title}</h1>
          <p className="page-heading-sub">{data.subtitle}</p>
        </div>
        <div className="page-heading-actions">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => dispatch({ type: "FINALISE_NOTE", noteId: state.selectedNoteId })}
            disabled={activeNote?.finalised}
          >
            {activeNote?.finalised ? "Finalised" : "Finalise"}
          </button>
        </div>
      </div>

      <div className="notes-layout">
        <div className="notes-list">
          {state.noteRecords.map((n) => (
            <div
              key={n.id}
              className={`note-list-item${n.id === state.selectedNoteId ? " active" : ""}`}
              onClick={() => dispatch({ type: "SET_NOTE_ID", id: n.id })}
            >
              <div className="note-list-title">{n.label}</div>
              <div className="note-list-date">{n.date}</div>
              <div className="note-list-preview">{n.talkingPoints[0] ?? ""}</div>
            </div>
          ))}
        </div>

        <div className="note-editor">
          {displayNote ? (
            <>
              <input
                className="note-editor-title"
                value={draft?.title ?? displayNote.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                disabled={displayNote.finalised}
              />
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
                {displayNote.context}
              </div>

              <div style={{ fontSize: 13, fontWeight: 650, marginBottom: 8 }}>Talking points</div>
              {displayNote.talkingPoints.map((tp, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: "var(--green)" }}>•</span>
                  <span>{tp}</span>
                </div>
              ))}

              <div style={{ fontSize: 13, fontWeight: 650, margin: "16px 0 8px" }}>Meeting record</div>
              <textarea
                className="note-textarea"
                value={draft?.meetingRecord ?? displayNote.meetingRecord}
                onChange={(e) => handleBodyChange(e.target.value)}
                disabled={displayNote.finalised}
                rows={4}
              />

              <div style={{ fontSize: 13, fontWeight: 650, margin: "16px 0 8px" }}>Action items</div>
              {displayNote.actionItems.map((ai, i) => (
                <div key={i} style={{ fontSize: 13, padding: "5px 0", borderBottom: "1px solid var(--line-soft)" }}>
                  {ai}
                </div>
              ))}
            </>
          ) : (
            <p style={{ color: "var(--muted)", fontSize: 13 }}>Select a note to view it.</p>
          )}
        </div>
      </div>
    </div>
  );
}
