import { useState } from "react";
import { useApp } from "../../../context/AppContext";
import { assistantReply } from "../../../utility/assistantReply";

interface Message {
  role: "user" | "bot";
  text: string;
  source?: string;
  screen?: string;
  tab?: string;
  freshness?: string;
}

export default function AssistantPanel() {
  const { state, dispatch } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Ask me about portfolios, funds, fees, risk limits, the rebalance proposal, upcoming events, managers, or today's brief.",
      freshness: "Demo data · 19 Nov 2026"
    },
  ]);
  const [input, setInput] = useState("");

  function send() {
    const trimmed = input.trim();
    if (!trimmed) return;
    const reply = assistantReply(trimmed, state.selectedCalendarDate);
    setMessages((prev) => [
      ...prev,
      { role: "user", text: trimmed },
      { role: "bot", text: reply.text, source: reply.source, screen: reply.screen, tab: reply.tab, freshness: reply.freshness },
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
            <div className="assistant-bubble-text">{m.text}</div>
            {m.role === "bot" && (m.source || m.freshness) && (
              <div className="assistant-bubble-meta">
                {m.source && m.screen ? (
                  <button
                    className="assistant-screen-link"
                    onClick={() =>
                      m.tab
                        ? dispatch({ type: "SET_SECTION_AND_TAB", id: m.screen!, tab: m.tab })
                        : dispatch({ type: "SET_SECTION", id: m.screen! })
                    }
                  >
                    {m.source} →
                  </button>
                ) : m.source ? (
                  <span className="assistant-source">{m.source}</span>
                ) : null}
                {m.freshness && <span className="assistant-freshness">{m.freshness}</span>}
              </div>
            )}
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
