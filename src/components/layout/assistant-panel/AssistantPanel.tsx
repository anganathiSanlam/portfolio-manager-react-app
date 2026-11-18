import { useState } from "react";
import { useApp } from "../../../context/AppContext";
import { assistantReply } from "../../../utility/assistantReply";

interface Message {
  role: "user" | "bot";
  text: string;
}

export default function AssistantPanel() {
  const { state, dispatch } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hello! I'm your AI assistant. Ask me about your portfolio, meetings, or any action items." },
  ]);
  const [input, setInput] = useState("");

  function send() {
    const trimmed = input.trim();
    if (!trimmed) return;
    const reply = assistantReply(trimmed, state.selectedCalendarDate);
    setMessages((prev) => [
      ...prev,
      { role: "user", text: trimmed },
      { role: "bot", text: reply },
    ]);
    setInput("");
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <aside className={`assistant-panel${state.assistantOpen ? " open" : ""}`}>
      <div className="assistant-header">
        <span className="assistant-title">AI Assistant</span>
        <button
          className="icon-btn assistant-close"
          onClick={() => dispatch({ type: "SET_ASSISTANT_OPEN", open: false })}
        >
          ✕
        </button>
      </div>

      <div className="assistant-messages">
        {messages.map((m, i) => (
          <div key={i} className={`assistant-bubble ${m.role}`}>
            {m.text}
          </div>
        ))}
      </div>

      <div className="assistant-input-row">
        <textarea
          className="assistant-input"
          rows={2}
          placeholder="Ask something…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
        />
        <button className="assistant-send" onClick={send}>→</button>
      </div>
    </aside>
  );
}
