"use client";

import { useState, useRef, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen = "landing" | "chat" | "wisdom";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface WisdomCard {
  insight: string;
  traditions: string[];
  practice: string;
  reflection: string;
}

interface Challenge {
  id: string;
  label: string;
  icon: string;
  opening: string;
}

// ─── Challenge Categories ─────────────────────────────────────────────────────

const CHALLENGES: Challenge[] = [
  {
    id: "grief",
    label: "Grief & Loss",
    icon: "◌",
    opening:
      "I'm here to sit with you in this. Grief touches everyone differently — there is no single way to move through loss. What are you carrying right now?",
  },
  {
    id: "anxiety",
    label: "Anxiety & Uncertainty",
    icon: "◎",
    opening:
      "Uncertainty is one of the oldest teachers. Many wisdom traditions have grappled with exactly this — the discomfort of not knowing. What is weighing on you?",
  },
  {
    id: "anger",
    label: "Anger & Conflict",
    icon: "◉",
    opening:
      "Anger is a signal, not a verdict. Philosophy has much to say about the fires within us and how to work with them wisely. What is the conflict you're navigating?",
  },
  {
    id: "decisions",
    label: "Life Decisions",
    icon: "◈",
    opening:
      "Standing at a crossroads is one of the most human experiences there is. Good decisions emerge from clarity, not certainty. What choice is before you?",
  },
  {
    id: "identity",
    label: "Identity & Purpose",
    icon: "◇",
    opening:
      "The question of who we are and why we're here has occupied thinkers for millennia. You're in good company. What is stirring in you around this?",
  },
  {
    id: "relationships",
    label: "Relationships",
    icon: "◊",
    opening:
      "We are relational beings — our connections are both our greatest joy and our most fertile ground for growth. What is alive for you in your relationships?",
  },
];

// ─── Markdown-lite renderer (bold only) ───────────────────────────────────────

function renderMessage(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .split("\n\n")
    .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

// ─── Landing Screen ───────────────────────────────────────────────────────────

function LandingScreen({
  onSelect,
}: {
  onSelect: (challenge: Challenge) => void;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center pt-20 pb-12 px-6 text-center">
        <div
          className="text-[#c9a84c] text-3xl mb-4 gold-pulse"
          aria-hidden="true"
        >
          ◯
        </div>
        <h1
          className="font-playfair text-6xl md:text-7xl font-bold tracking-wide mb-4"
          style={{ color: "#c9a84c", fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          Equanima
        </h1>
        <p
          className="text-xl md:text-2xl font-light tracking-widest uppercase"
          style={{ color: "#c8bfaf", letterSpacing: "0.25em", fontFamily: "var(--font-inter), sans-serif" }}
        >
          Where ancient wisdom meets modern challenges
        </p>
        <div
          className="mt-8 w-24 h-px"
          style={{ background: "linear-gradient(to right, transparent, #c9a84c, transparent)" }}
        />
      </div>

      {/* Challenge Cards */}
      <div className="flex-1 px-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <p
            className="text-center text-sm uppercase tracking-widest mb-8"
            style={{ color: "#a8863a" }}
          >
            Choose your challenge
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CHALLENGES.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelect(c)}
                className="group relative text-left p-6 rounded-lg border transition-all duration-300"
                style={{
                  background: "#2a2a2e",
                  borderColor: "#3a3a3e",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#c9a84c";
                  (e.currentTarget as HTMLButtonElement).style.background = "#242428";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#3a3a3e";
                  (e.currentTarget as HTMLButtonElement).style.background = "#2a2a2e";
                }}
              >
                <div
                  className="text-2xl mb-3 transition-transform duration-300 group-hover:scale-110"
                  style={{ color: "#c9a84c" }}
                >
                  {c.icon}
                </div>
                <h3
                  className="font-semibold text-lg mb-1"
                  style={{ color: "#f5f0e8", fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {c.label}
                </h3>
                <div
                  className="mt-3 w-8 h-px transition-all duration-300 group-hover:w-16"
                  style={{ background: "#c9a84c" }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="text-center py-6 text-xs tracking-wide"
        style={{ color: "#6b6460", borderTop: "1px solid #2a2a2e" }}
      >
        Built for Encode Club Hackathon · Powered by Claude
      </footer>
    </div>
  );
}

// ─── Chat Screen ──────────────────────────────────────────────────────────────

function ChatScreen({
  challenge,
  messages,
  onBack,
  onSend,
  onGenerateWisdom,
  isStreaming,
  streamingText,
}: {
  challenge: Challenge;
  messages: Message[];
  onBack: () => void;
  onSend: (text: string) => void;
  onGenerateWisdom: () => void;
  isStreaming: boolean;
  streamingText: string;
}) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const userMessages = messages.filter((m) => m.role === "user").length;
  const showWisdomButton = userMessages >= 2 && !isStreaming;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    onSend(text);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#1c1c1e" }}>
      {/* Header */}
      <div
        className="flex items-center gap-4 px-4 py-4 sticky top-0 z-10"
        style={{ background: "#1c1c1e", borderBottom: "1px solid #2a2a2e" }}
      >
        <button
          onClick={onBack}
          className="text-sm px-3 py-1.5 rounded transition-colors"
          style={{ color: "#c9a84c", border: "1px solid #3a3a3e" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#2a2a2e";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          ← Back
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span style={{ color: "#c9a84c" }}>{challenge.icon}</span>
            <h2
              className="font-semibold"
              style={{ color: "#f5f0e8", fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              {challenge.label}
            </h2>
          </div>
          <p className="text-xs" style={{ color: "#6b6460" }}>
            Equanima · Philosophical Companion
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="flex flex-col gap-1 max-w-[85%]">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs font-semibold tracking-widest uppercase"
                      style={{ color: "#c9a84c" }}
                    >
                      ◯ Equanima
                    </span>
                  </div>
                  <div
                    className="ai-prose text-sm leading-relaxed rounded-lg px-4 py-3"
                    style={{
                      background: "#242428",
                      color: "#f5f0e8",
                      border: "1px solid #2a2a2e",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: renderMessage(msg.content),
                    }}
                  />
                </div>
              )}
              {msg.role === "user" && (
                <div
                  className="max-w-[75%] text-sm leading-relaxed rounded-lg px-4 py-3"
                  style={{
                    background: "#c9a84c",
                    color: "#1c1c1e",
                    fontWeight: 500,
                  }}
                >
                  {msg.content}
                </div>
              )}
            </div>
          ))}

          {/* Streaming message */}
          {isStreaming && streamingText && (
            <div className="flex justify-start">
              <div className="flex flex-col gap-1 max-w-[85%]">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs font-semibold tracking-widest uppercase"
                    style={{ color: "#c9a84c" }}
                  >
                    ◯ Equanima
                  </span>
                </div>
                <div
                  className="ai-prose text-sm leading-relaxed rounded-lg px-4 py-3 typing-cursor"
                  style={{
                    background: "#242428",
                    color: "#f5f0e8",
                    border: "1px solid #2a2a2e",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: renderMessage(streamingText),
                  }}
                />
              </div>
            </div>
          )}

          {/* Streaming dots when waiting for first token */}
          {isStreaming && !streamingText && (
            <div className="flex justify-start">
              <div className="flex flex-col gap-1">
                <span
                  className="text-xs font-semibold tracking-widest uppercase mb-1"
                  style={{ color: "#c9a84c" }}
                >
                  ◯ Equanima
                </span>
                <div
                  className="flex items-center gap-1 px-4 py-3 rounded-lg"
                  style={{ background: "#242428", border: "1px solid #2a2a2e" }}
                >
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: "#c9a84c",
                        animation: `blink 1.2s ${i * 0.2}s ease-in-out infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Wisdom Button */}
      {showWisdomButton && (
        <div className="px-4 pt-2 pb-1">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={onGenerateWisdom}
              className="w-full py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 tracking-wide"
              style={{
                background: "linear-gradient(135deg, #c9a84c, #a8863a)",
                color: "#1c1c1e",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.opacity = "1";
              }}
            >
              ✦ Generate Wisdom Card
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div
        className="px-4 pb-4 pt-3"
        style={{ borderTop: "1px solid #2a2a2e" }}
      >
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share what's on your mind…"
              rows={1}
              disabled={isStreaming}
              className="flex-1 resize-none text-sm rounded-lg px-4 py-3 outline-none transition-all"
              style={{
                background: "#2a2a2e",
                color: "#f5f0e8",
                border: "1px solid #3a3a3e",
                maxHeight: "120px",
                lineHeight: "1.5",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#c9a84c";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#3a3a3e";
              }}
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              className="px-4 py-3 rounded-lg text-sm font-semibold transition-all"
              style={{
                background:
                  isStreaming || !input.trim() ? "#3a3a3e" : "#c9a84c",
                color: isStreaming || !input.trim() ? "#6b6460" : "#1c1c1e",
                cursor: isStreaming || !input.trim() ? "not-allowed" : "pointer",
              }}
            >
              Send
            </button>
          </form>
          <p className="text-center text-xs mt-2" style={{ color: "#4a4448" }}>
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Wisdom Card Screen ───────────────────────────────────────────────────────

function WisdomCardScreen({
  card,
  challenge,
  onNewSession,
}: {
  card: WisdomCard;
  challenge: Challenge;
  onNewSession: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = `✦ Equanima Wisdom Card — ${challenge.label}

"${card.insight}"

Traditions: ${card.traditions.join(" · ")}

Practice: ${card.practice}

Reflection: ${card.reflection}

— Equanima: Where ancient wisdom meets modern challenges`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-3xl mb-3" style={{ color: "#c9a84c" }}>
            ◯
          </div>
          <h2
            className="text-3xl font-bold mb-1"
            style={{
              color: "#c9a84c",
              fontFamily: "var(--font-playfair), Georgia, serif",
            }}
          >
            Wisdom Card
          </h2>
          <p className="text-sm" style={{ color: "#6b6460" }}>
            {challenge.icon} {challenge.label}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-xl p-8 mb-8"
          style={{
            background: "#242428",
            border: "1px solid #3a3a3e",
            boxShadow: "0 0 40px rgba(201, 168, 76, 0.08)",
          }}
        >
          {/* Gold top line */}
          <div
            className="w-full h-px mb-8"
            style={{
              background:
                "linear-gradient(to right, transparent, #c9a84c, transparent)",
            }}
          />

          {/* Insight */}
          <blockquote
            className="text-xl font-medium leading-relaxed text-center mb-8 italic"
            style={{
              color: "#f5f0e8",
              fontFamily: "var(--font-playfair), Georgia, serif",
            }}
          >
            &ldquo;{card.insight}&rdquo;
          </blockquote>

          {/* Traditions */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {card.traditions.map((t) => (
              <span
                key={t}
                className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase"
                style={{
                  background: "rgba(201, 168, 76, 0.12)",
                  color: "#c9a84c",
                  border: "1px solid rgba(201, 168, 76, 0.3)",
                }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* Divider */}
          <div
            className="w-full h-px mb-6"
            style={{ background: "#2a2a2e" }}
          />

          {/* Practice */}
          <div className="mb-6">
            <h4
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "#a8863a" }}
            >
              Suggested Practice
            </h4>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "#c8bfaf" }}
            >
              {card.practice}
            </p>
          </div>

          {/* Reflection */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "#a8863a" }}
            >
              Reflection
            </h4>
            <p
              className="text-sm leading-relaxed italic"
              style={{ color: "#c8bfaf" }}
            >
              {card.reflection}
            </p>
          </div>

          {/* Gold bottom line */}
          <div
            className="w-full h-px mt-8"
            style={{
              background:
                "linear-gradient(to right, transparent, #c9a84c, transparent)",
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 rounded-lg text-sm font-semibold transition-all"
            style={{
              border: "1px solid #c9a84c",
              color: "#c9a84c",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(201, 168, 76, 0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
            }}
          >
            {copied ? "✓ Copied!" : "Copy to Clipboard"}
          </button>
          <button
            onClick={onNewSession}
            className="flex-1 py-3 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: "linear-gradient(135deg, #c9a84c, #a8863a)",
              color: "#1c1c1e",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "1";
            }}
          >
            New Session
          </button>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "#4a4448" }}>
          Equanima · Where ancient wisdom meets modern challenges
        </p>
      </div>
    </div>
  );
}

// ─── Root Page ────────────────────────────────────────────────────────────────

export default function Page() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [wisdomCard, setWisdomCard] = useState<WisdomCard | null>(null);
  const [isGeneratingWisdom, setIsGeneratingWisdom] = useState(false);

  async function startChat(c: Challenge) {
    setChallenge(c);
    setMessages([]);
    setWisdomCard(null);
    setScreen("chat");

    // Auto-send the opening message as the assistant
    await sendToAPI([], c.opening, true);
  }

  async function sendToAPI(
    history: Message[],
    assistantOpening: string,
    isOpening: boolean
  ): Promise<void>;
  async function sendToAPI(
    history: Message[],
    userText: string
  ): Promise<void>;
  async function sendToAPI(
    history: Message[],
    text: string,
    isOpening = false
  ): Promise<void> {
    if (isOpening) {
      // Opening: set it as an assistant message directly
      const openingMsg: Message = { role: "assistant", content: text };
      setMessages([openingMsg]);
      return;
    }

    const userMsg: Message = { role: "user", content: text };
    const updatedMessages = [...history, userMsg];
    setMessages(updatedMessages);
    setIsStreaming(true);
    setStreamingText("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              accumulated += parsed.text;
              setStreamingText(accumulated);
            } catch {
              // Skip malformed lines
            }
          }
        }
      }

      const assistantMsg: Message = {
        role: "assistant",
        content: accumulated,
      };
      setMessages([...updatedMessages, assistantMsg]);
    } finally {
      setIsStreaming(false);
      setStreamingText("");
    }
  }

  function handleUserSend(text: string) {
    sendToAPI(messages, text);
  }

  async function handleGenerateWisdom() {
    setIsGeneratingWisdom(true);
    try {
      const res = await fetch("/api/wisdom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      const card: WisdomCard = await res.json();
      setWisdomCard(card);
      setScreen("wisdom");
    } finally {
      setIsGeneratingWisdom(false);
    }
  }

  function handleNewSession() {
    setScreen("landing");
    setChallenge(null);
    setMessages([]);
    setWisdomCard(null);
    setStreamingText("");
  }

  if (screen === "landing") {
    return <LandingScreen onSelect={startChat} />;
  }

  if (screen === "chat" && challenge) {
    return (
      <>
        {isGeneratingWisdom && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(28, 28, 30, 0.9)" }}
          >
            <div className="text-center">
              <div
                className="text-4xl mb-4 gold-pulse"
                style={{ color: "#c9a84c" }}
              >
                ◯
              </div>
              <p
                className="text-sm tracking-widest uppercase"
                style={{ color: "#c9a84c" }}
              >
                Distilling wisdom…
              </p>
            </div>
          </div>
        )}
        <ChatScreen
          challenge={challenge}
          messages={messages}
          onBack={handleNewSession}
          onSend={handleUserSend}
          onGenerateWisdom={handleGenerateWisdom}
          isStreaming={isStreaming}
          streamingText={streamingText}
        />
      </>
    );
  }

  if (screen === "wisdom" && wisdomCard && challenge) {
    return (
      <WisdomCardScreen
        card={wisdomCard}
        challenge={challenge}
        onNewSession={handleNewSession}
      />
    );
  }

  return null;
}
