"use client";

import { useState, useRef, useEffect } from "react";
import {
  Moon, Wind, Flame, Compass, Fingerprint, Users,
  Flower2, Telescope, Sprout,
  Heart, Zap, Wrench,
  ArrowLeft, Timer, Mic, Scale, Sparkles,
  SlidersHorizontal, History, Copy, Download, X,
  Share2, Bookmark, FileDown, Bell, BellOff, RefreshCw,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen = "landing" | "mood" | "transitioning" | "chat" | "wisdom";

interface Message {
  role: "user" | "assistant";
  content: string;
  isCounterpoint?: boolean;
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
  opening: string;
}

interface SessionRecord {
  id: string;
  challengeLabel: string;
  challengeIcon: string;
  challengeId: string;
  mood: string;
  timestamp: number;
  messageCount: number;
  preview: string;
  messages?: Message[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CHALLENGES: Challenge[] = [
  { id: "grief", label: "Grief & Loss", opening: "I'm here to sit with you in this. Grief touches everyone differently — there is no single way to move through loss. What are you carrying right now?" },
  { id: "anxiety", label: "Anxiety & Uncertainty", opening: "Uncertainty is one of the oldest teachers. Many wisdom traditions have grappled with exactly this — the discomfort of not knowing. What is weighing on you?" },
  { id: "anger", label: "Anger & Conflict", opening: "Anger is a signal, not a verdict. Philosophy has much to say about the fires within us and how to work with them wisely. What is the conflict you're navigating?" },
  { id: "decisions", label: "Life Decisions", opening: "Standing at a crossroads is one of the most human experiences there is. Good decisions emerge from clarity, not certainty. What choice is before you?" },
  { id: "identity", label: "Identity & Purpose", opening: "The question of who we are and why we're here has occupied thinkers for millennia. You're in good company. What is stirring in you around this?" },
  { id: "relationships", label: "Relationships", opening: "We are relational beings — our connections are both our greatest joy and our most fertile ground for growth. What is alive for you in your relationships?" },
  { id: "meaning", label: "Meaning & Fulfilment", opening: "Some of the most profound questions arise not from suffering but from abundance — when life is fine on the surface, yet something deeper still calls out. What is it you're reaching for?" },
  { id: "curiosity", label: "Curiosity & Wonder", opening: "Philosophy began not in crisis but in wonder — the simple refusal to take the world for granted. You don't need a problem to explore ideas. What has been occupying your thinking lately?" },
  { id: "growth", label: "Growth & Change", opening: "The desire to become is one of the most vital forces in human life. Wisdom traditions have much to say about how we change well — with intention rather than mere circumstance. What are you growing toward?" },
];

const MOODS = [
  { id: "comfort", label: "I need comfort", description: "Gentle, compassionate wisdom. Meet me where I am." },
  { id: "challenge", label: "Challenge me", description: "Push my thinking. Don't just validate — help me grow." },
  { id: "practical", label: "Just give me tools", description: "Concrete practices I can use today. Keep it grounded." },
];

const TRADITIONS = [
  { id: "Stoicism", label: "Stoicism", group: "Western" },
  { id: "Existentialism", label: "Existentialism", group: "Western" },
  { id: "Epicureanism", label: "Epicureanism", group: "Western" },
  { id: "Aristotelian ethics", label: "Aristotle", group: "Western" },
  { id: "Buddhism", label: "Buddhism", group: "Eastern" },
  { id: "Taoism", label: "Taoism", group: "Eastern" },
  { id: "Advaita Vedanta", label: "Vedanta", group: "Eastern" },
  { id: "Zen", label: "Zen", group: "Eastern" },
];

const ONBOARDING_LEVELS = [
  { id: "beginner", label: "Complete beginner", desc: "Philosophy is new to me" },
  { id: "explorer", label: "Curious explorer", desc: "I've read a little, want to know more" },
  { id: "practitioner", label: "Regular practitioner", desc: "I engage with philosophy regularly" },
  { id: "academic", label: "Academic / professional", desc: "Philosophy is my field" },
];

const PLACEHOLDERS = [
  "Begin anywhere…",
  "What brings you here today?",
  "Say it plainly — we'll find the wisdom in it.",
  "What's present for you right now?",
  "Share what's stirring in you…",
];

const DAILY_REFLECTIONS = [
  "What would you do today if you knew it was already enough?",
  "Which belief have you held the longest without ever examining it?",
  "What are you tolerating that you could simply choose to end?",
  "If your current suffering had a lesson, what would it be teaching you?",
  "What would equanimity look like for you in this moment?",
  "Where in your life are you running from stillness?",
  "What does the wisest version of you already know?",
  "Which of your fears is actually wisdom in disguise?",
  "What would you do differently if you truly believed this moment was impermanent?",
  "Where are you seeking control where surrender would serve you better?",
  "What relationship in your life most needs the courage of honest speech?",
  "If you stripped away all your roles, who remains?",
  "What are you calling a problem that might actually be a teacher?",
  "How much of your suffering is the event, and how much is the story about it?",
  "What would it mean to truly accept what cannot be changed?",
  "Where are you borrowing tomorrow's suffering to live today?",
  "What habit of thought is most keeping you from peace?",
  "If you trusted the process of your life, what would you stop fighting?",
  "What have you been putting off that your deeper self is calling you toward?",
  "In what area of life are you being invited to trust the unknown?",
  "What would radical self-honesty reveal that you've been avoiding?",
  "Where are you performing virtue rather than living it?",
  "What in your past are you still punishing yourself for?",
  "If your emotions were messengers, what are they trying to tell you?",
  "What would it look like to live your values, not just hold them?",
  "Which relationship would most benefit from your full presence today?",
  "What small act of courage have you been postponing?",
  "Where is your mind most often when your body is here?",
  "What are you afraid would happen if you stopped being so hard on yourself?",
  "If you had to choose one thing to let go of today, what would it be?",
  "What does your body know that your mind hasn't accepted yet?",
  "Where have you confused busyness with meaning?",
  "What would it mean to treat yourself with the compassion you offer others?",
  "What truth have you known for a long time but not yet acted on?",
  "Where are you living in reaction rather than intention?",
  "What would change if you truly believed you were enough, right now?",
  "Which virtue are you most called to cultivate this season?",
  "What are you holding onto that is holding you back?",
  "Where has certainty become a prison rather than a foundation?",
  "What would your life look like if fear had less power than love?",
  "In what area are you a harsher judge of yourself than you'd be of anyone else?",
  "What does 'home' mean to you beyond a physical place?",
  "Where are you seeking external validation for something only you can confirm?",
  "What conversation have you been putting off that needs to happen?",
  "If you could only work on one thing about yourself this year, what would matter most?",
  "Where are you living according to someone else's definition of a good life?",
  "What story about yourself are you most ready to release?",
  "How would your choices change if you truly believed in your own impermanence?",
  "What would it mean to be a good ancestor to those who will come after you?",
  "Where in your life does discipline feel like freedom rather than constraint?",
  "What would change in your relationships if you assumed positive intent?",
  "What are you calling weakness that might actually be sensitivity?",
  "Where does your ambition come from — fear or genuine calling?",
  "What have you learned from your greatest failure?",
  "What in your life has grown precisely because of, not despite, difficulty?",
  "Where are you mistaking comfort for happiness?",
  "What does your ideal ordinary Tuesday look like?",
  "What are you most grateful for that you rarely acknowledge?",
  "Where do you feel most like yourself?",
  "What question are you most afraid to sit with?",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDailyReflection(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return DAILY_REFLECTIONS[dayOfYear % DAILY_REFLECTIONS.length];
}

const BASE_SYSTEM_PROMPT = `You are Equanima, a philosophical companion that helps people navigate life's challenges by drawing on the deepest wisdom traditions of both East and West. You are not a therapist, not a life coach, not a generic AI assistant. You draw on: Western traditions (Stoicism, Aristotelian ethics, Existentialism, Epicureanism) and Eastern traditions (Buddhism, Taoism, Advaita Vedanta, Zen). When relevant, briefly note connections to modern psychology or neuroscience, but always lead with the philosophical tradition. Listen deeply first. Offer dual perspectives - one Western, one Eastern, labelled clearly. Be specific not platitudinous. Offer a practice not just ideas. Speak with warmth and gravitas. Bold philosophical concepts when first introduced. Keep responses to 2-4 paragraphs. End with a reflection question or practice. Never diagnose mental health conditions or replace professional therapy.`;

function buildSystemPrompt(mood: string, traditions: string[], level: string): string {
  let prompt = BASE_SYSTEM_PROMPT;
  if (traditions.length > 0) {
    prompt += `\n\nFocus primarily on these philosophical traditions: ${traditions.join(", ")}. Still try to offer dual perspectives within these constraints where possible.`;
  }
  const moodMap: Record<string, string> = {
    comfort: "The person needs gentle comfort. Lead with compassion and validation before any challenge. Make them feel heard first.",
    challenge: "The person wants to be intellectually challenged. Push their thinking, question assumptions, don't just validate — invite growth.",
    practical: "The person wants concrete tools above theory. Lead with a specific practice they can do today. Every response must include something actionable.",
  };
  if (moodMap[mood]) prompt += `\n\n${moodMap[mood]}`;
  const levelMap: Record<string, string> = {
    beginner: "This person is new to philosophy. Explain concepts clearly, avoid unexplained jargon, build from everyday experience.",
    explorer: "This person is philosophically curious. You can introduce concepts but briefly explain them in context.",
    practitioner: "This person has philosophical practice experience. Use technical terms and go deeper without over-explaining.",
    academic: "This person has academic or professional philosophy background. Engage at that level.",
  };
  if (levelMap[level]) prompt += `\n\n${levelMap[level]}`;
  return prompt;
}

function renderMessage(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .split("\n\n")
    .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d === 1) return "yesterday";
  return `${d} days ago`;
}

function ChallengeIcon({ id, size = 22, color = "#c9a84c" }: { id: string; size?: number; color?: string }) {
  const props = { size, color, strokeWidth: 1.5 };
  switch (id) {
    case "grief": return <Moon {...props} />;
    case "anxiety": return <Wind {...props} />;
    case "anger": return <Flame {...props} />;
    case "decisions": return <Compass {...props} />;
    case "identity": return <Fingerprint {...props} />;
    case "relationships": return <Users {...props} />;
    case "meaning": return <Flower2 {...props} />;
    case "curiosity": return <Telescope {...props} />;
    case "growth": return <Sprout {...props} />;
    default: return <Sparkles {...props} />;
  }
}

function MoodIcon({ id, size = 22, color = "#c9a84c" }: { id: string; size?: number; color?: string }) {
  const props = { size, color, strokeWidth: 1.5 };
  switch (id) {
    case "comfort": return <Heart {...props} />;
    case "challenge": return <Zap {...props} />;
    case "practical": return <Wrench {...props} />;
    default: return <Sparkles {...props} />;
  }
}

function TransitionScreen({ challenge }: { challenge: Challenge }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center fade-in"
      style={{ background: "#1c1c1e" }}>
      <div className="text-center">
        <div className="mb-6 flex justify-center fade-in-up delay-100">
          <ChallengeIcon id={challenge.id} size={52} />
        </div>
        <h2 className="text-2xl font-bold mb-3 fade-in-up delay-200"
          style={{ color: "#f5f0e8", fontFamily: "var(--font-playfair), Georgia, serif" }}>
          {challenge.label}
        </h2>
        <p className="text-xs tracking-widest uppercase fade-in-up delay-300" style={{ color: "#6b6460" }}>
          Preparing your space
        </p>
        <div className="mt-10 flex justify-center fade-in-up delay-400">
          <div className="gentle-pulse">
            <Sparkles size={18} color="#c9a84c" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </div>
  );
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D, text: string, x: number,
  startY: number, maxWidth: number, lineHeight: number
): number {
  const words = text.split(" ");
  let line = "";
  let y = startY;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth && line !== "") {
      ctx.fillText(line.trim(), x, y);
      line = word + " ";
      y += lineHeight;
    } else {
      line = test;
    }
  }
  if (line.trim()) { ctx.fillText(line.trim(), x, y); y += lineHeight; }
  return y;
}

function generateCardImage(card: WisdomCard, challenge: Challenge): string {
  const canvas = document.createElement("canvas");
  canvas.width = 1200; canvas.height = 630;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#1c1c1e";
  ctx.fillRect(0, 0, 1200, 630);

  // Dot texture
  ctx.fillStyle = "rgba(201,168,76,0.04)";
  for (let x = 20; x < 1200; x += 40)
    for (let y = 20; y < 630; y += 40) {
      ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
    }

  // Gold top/bottom bars
  const lg = ctx.createLinearGradient(0, 0, 1200, 0);
  lg.addColorStop(0, "transparent"); lg.addColorStop(0.25, "#c9a84c");
  lg.addColorStop(0.75, "#c9a84c"); lg.addColorStop(1, "transparent");
  ctx.fillStyle = lg;
  ctx.fillRect(0, 0, 1200, 3); ctx.fillRect(0, 627, 1200, 3);

  // Heading
  ctx.fillStyle = "#c9a84c"; ctx.font = "bold 22px Georgia"; ctx.textAlign = "center";
  ctx.fillText("◯  EQUANIMA", 600, 62);
  ctx.fillStyle = "#6b6460"; ctx.font = "14px Arial";
  ctx.fillText(challenge.label, 600, 88);

  // Separator
  const sg = ctx.createLinearGradient(0, 0, 1200, 0);
  sg.addColorStop(0, "transparent"); sg.addColorStop(0.5, "rgba(201,168,76,0.25)"); sg.addColorStop(1, "transparent");
  ctx.fillStyle = sg; ctx.fillRect(0, 108, 1200, 1);

  // Insight
  ctx.fillStyle = "#f5f0e8"; ctx.font = "italic 32px Georgia"; ctx.textAlign = "center";
  const insightEndY = drawWrappedText(ctx, `\u201C${card.insight}\u201D`, 600, 175, 950, 46);

  // Traditions
  ctx.fillStyle = "#c9a84c"; ctx.font = "13px Arial";
  ctx.fillText(card.traditions.join("  ·  "), 600, insightEndY + 10);

  // Separator 2
  ctx.fillStyle = sg; ctx.fillRect(200, insightEndY + 30, 800, 1);

  // Practice
  ctx.fillStyle = "#a8863a"; ctx.font = "bold 11px Arial";
  ctx.fillText("PRACTICE", 600, insightEndY + 56);
  ctx.fillStyle = "#c8bfaf"; ctx.font = "15px Arial";
  drawWrappedText(ctx, card.practice, 600, insightEndY + 80, 800, 22);

  // Branding
  ctx.fillStyle = "#3a3a3e"; ctx.font = "11px Arial";
  ctx.fillText("equanima · Where ancient wisdom meets modern challenges", 600, 612);

  return canvas.toDataURL("image/png");
}

// ─── Storage ──────────────────────────────────────────────────────────────────


function loadLevel(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("equanima_level") || "";
}

function saveLevel(level: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("equanima_level", level);
}

function loadTraditions(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("equanima_traditions") || "[]"); }
  catch { return []; }
}

function saveTraditions(t: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("equanima_traditions", JSON.stringify(t));
}

// ── Streak ────────────────────────────────────────────────────────────────────
function loadStreak(): { count: number; lastDate: string } {
  if (typeof window === "undefined") return { count: 0, lastDate: "" };
  try { return JSON.parse(localStorage.getItem("equanima_streak") || '{"count":0,"lastDate":""}'); }
  catch { return { count: 0, lastDate: "" }; }
}
function updateStreak(): number {
  if (typeof window === "undefined") return 0;
  const today = new Date().toDateString();
  const s = loadStreak();
  if (s.lastDate === today) return s.count;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const count = s.lastDate === yesterday ? s.count + 1 : 1;
  localStorage.setItem("equanima_streak", JSON.stringify({ count, lastDate: today }));
  return count;
}

// ── Challenge visit counts ─────────────────────────────────────────────────────
function loadVisitCounts(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("equanima_visit_counts") || "{}"); }
  catch { return {}; }
}
function incrementVisitCount(id: string): Record<string, number> {
  if (typeof window === "undefined") return {};
  const counts = loadVisitCounts();
  counts[id] = (counts[id] || 0) + 1;
  localStorage.setItem("equanima_visit_counts", JSON.stringify(counts));
  return counts;
}
const RELATED_CHALLENGES: Record<string, string[]> = {
  grief:         ["meaning", "identity"],
  anxiety:       ["decisions", "growth"],
  anger:         ["relationships", "identity"],
  decisions:     ["anxiety", "growth"],
  identity:      ["meaning", "relationships"],
  relationships: ["identity", "anger"],
  meaning:       ["curiosity", "growth"],
  curiosity:     ["meaning", "identity"],
  growth:        ["decisions", "meaning"],
};
function getSuggestedChallenge(counts: Record<string, number>): Challenge | null {
  const visited = Object.keys(counts);
  if (visited.length < 2) return null;
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const topId = sorted[0][0];
  for (const id of (RELATED_CHALLENGES[topId] || [])) {
    if (!counts[id]) return CHALLENGES.find(c => c.id === id) || null;
  }
  return null;
}

// ── Favourites ────────────────────────────────────────────────────────────────
function loadFavourites(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("equanima_favourites") || "[]"); }
  catch { return []; }
}
function toggleFavouriteStored(content: string): string[] {
  const key = content.slice(0, 120);
  const favs = loadFavourites();
  const idx = favs.indexOf(key);
  const next = idx >= 0 ? favs.filter((_, i) => i !== idx) : [...favs, key];
  localStorage.setItem("equanima_favourites", JSON.stringify(next));
  return next;
}

// ── Notification ──────────────────────────────────────────────────────────────
function showDailyNotification() {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  const today = new Date().toDateString();
  if (localStorage.getItem("equanima_notif_date") === today) return;
  new Notification("Equanima · Today's Reflection", {
    body: getDailyReflection(),
    icon: "/icon.svg",
  });
  localStorage.setItem("equanima_notif_date", today);
}

// ─── Recovery Key Modal ───────────────────────────────────────────────────────

function RecoveryKeyModal({ userKey, onClose }: { userKey: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(userKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.88)" }}>
      <div className="w-full max-w-md rounded-xl p-8"
        style={{ background: "#242428", border: "1px solid #3a3a3e" }}>
        <div className="text-center mb-6">
          <div className="mb-3 flex justify-center">
            <Bookmark size={32} color="#c9a84c" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold mb-2"
            style={{ color: "#c9a84c", fontFamily: "var(--font-playfair), Georgia, serif" }}>
            Your Recovery Key
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "#c8bfaf" }}>
            Save this key somewhere safe — a notes app, password manager, or written down.
            Use it to restore your history on any device.
          </p>
        </div>
        <div className="p-4 rounded-lg mb-4 text-center font-mono text-sm break-all select-all"
          style={{ background: "#1c1c1e", border: "1px solid #3a3a3e", color: "#f5f0e8" }}>
          {userKey}
        </div>
        <button onClick={handleCopy}
          className="w-full py-3 rounded-lg text-sm font-semibold mb-3 flex items-center justify-center gap-2 transition-all"
          style={{ background: "linear-gradient(135deg, #c9a84c, #a8863a)", color: "#1c1c1e" }}>
          <Copy size={14} strokeWidth={2} />
          {copied ? "Copied!" : "Copy to clipboard"}
        </button>
        <button onClick={onClose} className="w-full py-2 text-sm transition-colors"
          style={{ color: "#6b6460" }}>
          I&apos;ve saved my key
        </button>
        <p className="text-center text-xs mt-4" style={{ color: "#4a4448" }}>
          No email. No account. Your conversations belong to you.
        </p>
      </div>
    </div>
  );
}

// ─── Recover Account Modal ────────────────────────────────────────────────────

function RecoverModal({ onRecover, onClose }: {
  onRecover: (key: string) => Promise<void>;
  onClose: () => void;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    try {
      await onRecover(input.trim());
    } catch {
      setError("Key not found. Please check and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.88)" }}>
      <div className="w-full max-w-md rounded-xl p-8"
        style={{ background: "#242428", border: "1px solid #3a3a3e" }}>
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2"
            style={{ color: "#c9a84c", fontFamily: "var(--font-playfair), Georgia, serif" }}>
            Recover Your Account
          </h2>
          <p className="text-sm" style={{ color: "#c8bfaf" }}>
            Enter your recovery key to restore your conversation history.
          </p>
        </div>
        <textarea value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your recovery key here…"
          rows={3}
          className="w-full p-3 rounded-lg text-sm font-mono mb-3 resize-none outline-none"
          style={{
            background: "#1c1c1e",
            border: `1px solid ${error ? "#c0392b" : "#3a3a3e"}`,
            color: "#f5f0e8",
          }} />
        {error && <p className="text-xs mb-3" style={{ color: "#c0392b" }}>{error}</p>}
        <button onClick={handleSubmit} disabled={loading || !input.trim()}
          className="w-full py-3 rounded-lg text-sm font-semibold mb-3 transition-all"
          style={{
            background: "linear-gradient(135deg, #c9a84c, #a8863a)",
            color: "#1c1c1e",
            opacity: loading || !input.trim() ? 0.5 : 1,
          }}>
          {loading ? "Recovering…" : "Restore my history"}
        </button>
        <button onClick={onClose} className="w-full py-2 text-sm" style={{ color: "#6b6460" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Onboarding Modal ─────────────────────────────────────────────────────────

function OnboardingModal({ onComplete }: { onComplete: (level: string) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}>
      <div className="w-full max-w-md rounded-xl p-8"
        style={{ background: "#242428", border: "1px solid #3a3a3e" }}>
        <div className="text-center mb-6">
          <div className="mb-3 flex justify-center">
            <Sparkles size={32} color="#c9a84c" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold mb-2"
            style={{ color: "#c9a84c", fontFamily: "var(--font-playfair), Georgia, serif" }}>
            Welcome to Equanima
          </h2>
          <p className="text-sm" style={{ color: "#c8bfaf" }}>
            What is your relationship with philosophy?
          </p>
        </div>
        <div className="space-y-3">
          {ONBOARDING_LEVELS.map((l) => (
            <button key={l.id} onClick={() => onComplete(l.id)}
              className="w-full text-left p-4 rounded-lg transition-all"
              style={{ background: "#2a2a2e", border: "1px solid #3a3a3e" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#c9a84c";
                (e.currentTarget as HTMLButtonElement).style.background = "#1c1c1e";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#3a3a3e";
                (e.currentTarget as HTMLButtonElement).style.background = "#2a2a2e";
              }}>
              <div className="font-semibold text-sm" style={{ color: "#f5f0e8" }}>{l.label}</div>
              <div className="text-xs mt-0.5" style={{ color: "#6b6460" }}>{l.desc}</div>
            </button>
          ))}
        </div>
        <p className="text-center text-xs mt-4" style={{ color: "#4a4448" }}>
          This helps personalise your experience. Saved locally.
        </p>
      </div>
    </div>
  );
}

// ─── History Panel ────────────────────────────────────────────────────────────

function HistoryPanel({ history, favourites, onClose, onClear, onResume, userKey }: {
  history: SessionRecord[];
  favourites: string[];
  onClose: () => void;
  onClear: () => void;
  onResume: (record: SessionRecord) => void;
  userKey: string | null;
}) {
  const [tab, setTab] = useState<"sessions" | "saved">("sessions");

  return (
    <div className="fixed inset-0 z-40 flex justify-end"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}>
      <div className="w-full max-w-sm h-full overflow-y-auto flex flex-col"
        style={{ background: "#1c1c1e", borderLeft: "1px solid #2a2a2e" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 sticky top-0"
          style={{ background: "#1c1c1e", borderBottom: "1px solid #2a2a2e" }}>
          <h3 className="font-semibold"
            style={{ color: "#c9a84c", fontFamily: "var(--font-playfair), Georgia, serif" }}>
            Your Journey
          </h3>
          <button onClick={onClose} className="p-1 rounded transition-colors" style={{ color: "#6b6460" }}>
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-5 pt-3 pb-1 gap-4" style={{ borderBottom: "1px solid #2a2a2e" }}>
          {(["sessions", "saved"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="pb-2 text-xs font-semibold uppercase tracking-widest transition-colors"
              style={{
                color: tab === t ? "#c9a84c" : "#4a4448",
                borderBottom: tab === t ? "2px solid #c9a84c" : "2px solid transparent",
              }}>
              {t === "sessions" ? `Sessions${history.length > 0 ? ` (${history.length})` : ""}` : `Saved${favourites.length > 0 ? ` (${favourites.length})` : ""}`}
            </button>
          ))}
        </div>

        {/* Sessions tab */}
        {tab === "sessions" && (
          history.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <div className="mb-3 flex justify-center"><History size={32} color="#3a3a3e" strokeWidth={1.5} /></div>
                <p className="text-sm" style={{ color: "#6b6460" }}>No sessions yet.<br />Start a conversation to build your history.</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 p-4 space-y-3">
              {history.map((s) => (
                <div key={s.id} className="p-4 rounded-lg"
                  style={{ background: "#242428", border: "1px solid #2a2a2e" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <ChallengeIcon id={s.challengeIcon} size={16} />
                    <span className="text-sm font-semibold" style={{ color: "#f5f0e8" }}>{s.challengeLabel}</span>
                    <span className="text-xs ml-auto" style={{ color: "#4a4448" }}>{timeAgo(s.timestamp)}</span>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(201,168,76,0.1)", color: "#a8863a", border: "1px solid rgba(201,168,76,0.2)" }}>
                      {s.mood}
                    </span>
                    <span className="text-xs" style={{ color: "#4a4448" }}>{s.messageCount} exchanges</span>
                  </div>
                  {s.preview && (
                    <p className="text-xs italic mb-3" style={{ color: "#6b6460" }}>
                      &ldquo;{s.preview.slice(0, 80)}{s.preview.length > 80 ? "…" : ""}&rdquo;
                    </p>
                  )}
                  {s.messages && s.messages.length > 0 && (
                    <button onClick={() => onResume(s)}
                      className="w-full py-1.5 text-xs rounded transition-all"
                      style={{ border: "1px solid rgba(201,168,76,0.3)", color: "#c9a84c", background: "transparent" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(201,168,76,0.08)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
                      Resume this conversation
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* Saved tab */}
        {tab === "saved" && (
          favourites.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <div className="mb-3 flex justify-center"><Bookmark size={32} color="#3a3a3e" strokeWidth={1.5} /></div>
                <p className="text-sm" style={{ color: "#6b6460" }}>No saved insights yet.<br />Bookmark AI responses that resonate with you.</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 p-4 space-y-3">
              {favourites.map((f, i) => (
                <div key={i} className="p-4 rounded-lg"
                  style={{ background: "#242428", border: "1px solid #2a2a2e" }}>
                  <div className="flex items-start gap-2 mb-1">
                    <Bookmark size={12} color="#c9a84c" strokeWidth={1.5} style={{ flexShrink: 0, marginTop: 3 }} />
                    <p className="text-sm leading-relaxed italic" style={{ color: "#c8bfaf" }}>
                      &ldquo;{f}&rdquo;
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {history.length > 0 && tab === "sessions" && (
          <div className="p-4" style={{ borderTop: "1px solid #2a2a2e" }}>
            <button onClick={onClear} className="w-full py-2 text-xs rounded-lg transition-all"
              style={{ color: "#6b6460", border: "1px solid #2a2a2e" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#4a4448"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#2a2a2e"; }}>
              Clear History
            </button>
          </div>
        )}

        {userKey && (
          <div className="p-4 pt-0" style={{ borderTop: history.length > 0 && tab === "sessions" ? undefined : "1px solid #2a2a2e" }}>
            <p className="text-xs mb-1" style={{ color: "#4a4448" }}>Your recovery key</p>
            <p className="font-mono text-xs break-all select-all" style={{ color: "#6b6460" }}>{userKey}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Landing Screen ───────────────────────────────────────────────────────────

function LandingScreen({ onSelect, selectedTraditions, onTraditionsChange, onShowHistory, historyCount,
  streak, suggestedChallenge, notifEnabled, onNotificationToggle, onRecover }: {
  onSelect: (c: Challenge) => void;
  selectedTraditions: string[];
  onTraditionsChange: (t: string[]) => void;
  onShowHistory: () => void;
  historyCount: number;
  streak: number;
  suggestedChallenge: Challenge | null;
  notifEnabled: boolean;
  onNotificationToggle: () => void;
  onRecover: () => void;
}) {
  const [showTraditions, setShowTraditions] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dailyRef = getDailyReflection();

  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t); }, []);

  function toggleTradition(id: string) {
    const next = selectedTraditions.includes(id)
      ? selectedTraditions.filter((t) => t !== id)
      : [...selectedTraditions, id];
    onTraditionsChange(next);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center pt-16 pb-8 px-6 text-center">
        <div className={`mb-4 gold-pulse flex items-center justify-center ${mounted ? "fade-in-up" : "opacity-0"}`}>
          <Sparkles size={36} color="#c9a84c" strokeWidth={1.5} />
        </div>
        <h1 className={`text-6xl md:text-7xl font-bold tracking-wide mb-4 ${mounted ? "fade-in-up delay-100" : "opacity-0"}`}
          style={{ color: "#c9a84c", fontFamily: "var(--font-playfair), Georgia, serif" }}>
          Equanima
        </h1>
        <p className={`text-xl md:text-2xl font-light uppercase tracking-widest ${mounted ? "fade-in-up delay-200" : "opacity-0"}`}
          style={{ color: "#c8bfaf", letterSpacing: "0.25em", fontFamily: "var(--font-inter), sans-serif" }}>
          {historyCount > 0 ? "Welcome back. Where should we begin?" : "Where ancient wisdom meets modern challenges"}
        </p>
        <div className={`mt-6 w-24 h-px ${mounted ? "fade-in-up delay-300" : "opacity-0"}`}
          style={{ background: "linear-gradient(to right, transparent, #c9a84c, transparent)" }} />
      </div>

      {/* Daily Reflection */}
      <div className={`px-6 pb-6 ${mounted ? "fade-in-up delay-400" : "opacity-0"}`}>
        <div className="max-w-2xl mx-auto">
          <div className="p-7 rounded-lg text-center" style={{ background: "#242428", border: "1px solid #2a2a2e" }}>
            <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: "#a8863a" }}>
              Today&rsquo;s Reflection
            </span>
            <div className="mt-3 mb-3 w-12 h-px mx-auto" style={{ background: "linear-gradient(to right, transparent, #c9a84c, transparent)" }} />
            <p className="text-base italic leading-relaxed" style={{ color: "#c8bfaf", fontFamily: "var(--font-playfair), Georgia, serif" }}>
              &ldquo;{dailyRef}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Controls row */}
      <div className="px-6 pb-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <button onClick={() => setShowTraditions(!showTraditions)}
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-all"
            style={{
              border: "1px solid #3a3a3e", color: "#c9a84c",
              background: showTraditions ? "#2a2a2e" : "transparent",
            }}>
            <SlidersHorizontal size={14} strokeWidth={1.5} /> Filter Traditions
            {selectedTraditions.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-xs"
                style={{ background: "#c9a84c", color: "#1c1c1e" }}>
                {selectedTraditions.length}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2">
            {streak >= 2 && (
              <span className="text-xs px-2.5 py-1.5 rounded-full"
                style={{ background: "rgba(201,168,76,0.1)", color: "#a8863a", border: "1px solid rgba(201,168,76,0.2)" }}>
                ✦ Day {streak}
              </span>
            )}
            <button onClick={onNotificationToggle}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-all"
              style={{ border: "1px solid #3a3a3e", color: notifEnabled ? "#c9a84c" : "#6b6460" }}
              title={notifEnabled ? "Disable daily reflection reminder" : "Enable daily reflection reminder"}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#c9a84c"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = notifEnabled ? "#c9a84c" : "#6b6460"; }}>
              {notifEnabled ? <Bell size={14} strokeWidth={1.5} /> : <BellOff size={14} strokeWidth={1.5} />}
            </button>
            <button onClick={onShowHistory}
              className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-all"
              style={{ border: "1px solid #3a3a3e", color: "#6b6460" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#c9a84c"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6b6460"; }}>
              <History size={14} strokeWidth={1.5} /> {historyCount > 0 ? historyCount : ""}
            </button>
          </div>
        </div>

        {/* Tradition filter panel */}
        {showTraditions && (
          <div className="max-w-4xl mx-auto mt-3 p-4 rounded-lg"
            style={{ background: "#242428", border: "1px solid #3a3a3e" }}>
            <p className="text-xs mb-3" style={{ color: "#6b6460" }}>
              Select traditions to focus on — leave empty to draw from all.
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {["Western", "Eastern"].map((group) => (
                <div key={group} className="flex flex-wrap gap-2">
                  <span className="text-xs self-center" style={{ color: "#4a4448" }}>{group}:</span>
                  {TRADITIONS.filter((t) => t.group === group).map((t) => (
                    <button key={t.id} onClick={() => toggleTradition(t.id)}
                      className="text-xs px-3 py-1 rounded-full transition-all"
                      style={{
                        background: selectedTraditions.includes(t.id) ? "#c9a84c" : "rgba(201,168,76,0.08)",
                        color: selectedTraditions.includes(t.id) ? "#1c1c1e" : "#c9a84c",
                        border: `1px solid ${selectedTraditions.includes(t.id) ? "#c9a84c" : "rgba(201,168,76,0.25)"}`,
                        fontWeight: selectedTraditions.includes(t.id) ? 600 : 400,
                      }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>
            {selectedTraditions.length > 0 && (
              <button onClick={() => onTraditionsChange([])}
                className="text-xs" style={{ color: "#6b6460" }}>
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      {/* Suggested challenge */}
      {suggestedChallenge && (
        <div className="px-6 pb-4">
          <div className="max-w-4xl mx-auto">
            <div className="p-4 rounded-lg flex items-center gap-4"
              style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)" }}>
              <div className="flex-shrink-0">
                <ChallengeIcon id={suggestedChallenge.id} size={22} color="#a8863a" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: "#a8863a" }}>
                  Based on your journey, you might want to explore
                </p>
                <p className="text-sm font-semibold" style={{ color: "#f5f0e8" }}>{suggestedChallenge.label}</p>
              </div>
              <button onClick={() => onSelect(suggestedChallenge)}
                className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg transition-all"
                style={{ border: "1px solid rgba(201,168,76,0.4)", color: "#c9a84c", background: "transparent" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(201,168,76,0.1)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
                Explore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Cards */}
      <div className={`flex-1 px-6 pb-8 ${mounted ? "fade-in-up delay-500" : "opacity-0"}`}>
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs uppercase tracking-widest mb-6" style={{ color: "#a8863a" }}>
            What are you navigating?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CHALLENGES.map((c) => (
              <button key={c.id} onClick={() => onSelect(c)}
                className="challenge-card group text-left p-6 rounded-lg border transition-all duration-300"
                style={{ background: "#2a2a2e", borderColor: "#3a3a3e" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#c9a84c";
                  (e.currentTarget as HTMLButtonElement).style.background = "#242428";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#3a3a3e";
                  (e.currentTarget as HTMLButtonElement).style.background = "#2a2a2e";
                }}>
                <div className="mb-3 transition-transform duration-300 group-hover:scale-110">
                  <ChallengeIcon id={c.id} size={28} />
                </div>
                <h3 className="font-semibold text-lg mb-1"
                  style={{ color: "#f5f0e8", fontFamily: "var(--font-playfair), Georgia, serif" }}>
                  {c.label}
                </h3>
                <div className="mt-3 w-8 h-px transition-all duration-300 group-hover:w-16"
                  style={{ background: "#c9a84c" }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <footer className="text-center py-5 text-xs tracking-wide"
        style={{ color: "#6b6460", borderTop: "1px solid #2a2a2e" }}>
        Equanima — a space for the examined life
        <span className="mx-3" style={{ color: "#3a3a3e" }}>·</span>
        <button onClick={onRecover} className="transition-colors"
          style={{ color: "#4a4448" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#c9a84c"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#4a4448"; }}>
          Recover account
        </button>
      </footer>
    </div>
  );
}

// ─── Mood Screen ──────────────────────────────────────────────────────────────

function MoodScreen({ challenge, onSelect, onBack }: {
  challenge: Challenge;
  onSelect: (mood: string) => void;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <button onClick={onBack} className="text-sm mb-8 flex items-center gap-2 transition-colors"
          style={{ color: "#6b6460" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#c9a84c"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6b6460"; }}>
          <ArrowLeft size={14} strokeWidth={2} style={{ display: "inline", marginRight: 4 }} />Back
        </button>

        <div className="text-center mb-10">
          <div className="mb-2 flex justify-center">
            <ChallengeIcon id={challenge.id} size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2"
            style={{ color: "#f5f0e8", fontFamily: "var(--font-playfair), Georgia, serif" }}>
            {challenge.label}
          </h2>
          <p className="text-sm" style={{ color: "#6b6460" }}>
            How would you like to approach this?
          </p>
          <div className="mt-4 w-16 h-px mx-auto"
            style={{ background: "linear-gradient(to right, transparent, #c9a84c, transparent)" }} />
        </div>

        <div className="space-y-4">
          {MOODS.map((m) => (
            <button key={m.id} onClick={() => onSelect(m.id)}
              className="w-full text-left p-5 rounded-lg transition-all duration-200"
              style={{ background: "#242428", border: "1px solid #3a3a3e" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#c9a84c";
                (e.currentTarget as HTMLButtonElement).style.background = "#2a2a2e";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#3a3a3e";
                (e.currentTarget as HTMLButtonElement).style.background = "#242428";
              }}>
              <div className="flex items-center gap-3">
                <MoodIcon id={m.id} size={22} />
                <div>
                  <div className="font-semibold text-sm" style={{ color: "#f5f0e8" }}>{m.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: "#6b6460" }}>{m.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Chat Screen ──────────────────────────────────────────────────────────────

function ChatScreen({ challenge, mood, messages, onBack, onSend, onGenerateWisdom,
  isStreaming, streamingText, suggestions, counterpointText, isCounterpointing, onCounterpoint, sessionTime,
  favourites, onFavourite, onRegenerate, onExport }: {
  challenge: Challenge;
  mood: string;
  messages: Message[];
  onBack: () => void;
  onSend: (text: string) => void;
  onGenerateWisdom: () => void;
  isStreaming: boolean;
  streamingText: string;
  suggestions: string[];
  counterpointText: string;
  isCounterpointing: boolean;
  onCounterpoint: () => void;
  sessionTime: number;
  favourites: string[];
  onFavourite: (content: string) => void;
  onRegenerate: () => void;
  onExport: () => void;
}) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const id = setInterval(() => setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length), 4000);
    return () => clearInterval(id);
  }, []);

  const userMessages = messages.filter((m) => m.role === "user").length;
  const aiMessages = messages.filter((m) => m.role === "assistant" && !m.isCounterpoint).length;
  const showWisdomButton = userMessages >= 2 && !isStreaming && !isCounterpointing;
  const showCounterpointButton = aiMessages >= 1 && !isStreaming && !isCounterpointing && !counterpointText;
  const moodLabel = MOODS.find((m) => m.id === mood)?.label ?? "";

  // Last non-counterpoint AI message index (for regenerate)
  const lastAiIdx = messages.reduce((acc, m, i) => (m.role === "assistant" && !m.isCounterpoint ? i : acc), -1);
  const canRegenerate = lastAiIdx >= 0 && !isStreaming && !isCounterpointing;

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText, counterpointText]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    onSend(text);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e as unknown as React.FormEvent); }
  }

  function handleVoice() {
    const SR = (window as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition
      || (window as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    if (!SR) { alert("Voice input requires Chrome."); return; }
    const recognition = new (SR as new () => { continuous: boolean; interimResults: boolean; lang: string; onstart: () => void; onend: () => void; onresult: (e: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void; onerror: () => void; start: () => void })();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput((prev) => prev + (prev ? " " : "") + transcript);
    };
    recognition.start();
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#1c1c1e" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 sticky top-0 z-10"
        style={{ background: "#1c1c1e", borderBottom: "1px solid #2a2a2e" }}>
        <button onClick={onBack} className="text-sm px-3 py-1.5 rounded transition-all"
          style={{ color: "#c9a84c", border: "1px solid #3a3a3e" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#2a2a2e"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
          <ArrowLeft size={14} strokeWidth={2} style={{ display: "inline", marginRight: 4 }} />Back
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <ChallengeIcon id={challenge.id} size={18} />
            <h2 className="font-semibold truncate"
              style={{ color: "#f5f0e8", fontFamily: "var(--font-playfair), Georgia, serif" }}>
              {challenge.label}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full hidden sm:inline"
              style={{ background: "rgba(201,168,76,0.1)", color: "#a8863a", border: "1px solid rgba(201,168,76,0.2)" }}>
              {moodLabel}
            </span>
          </div>
          <p className="text-xs" style={{ color: "#4a4448" }}>Equanima · Philosophical Companion</p>
        </div>
        {/* Session timer + export */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-xs font-mono" style={{ color: "#4a4448" }}>
            <Timer size={12} strokeWidth={1.5} style={{ display: "inline", marginRight: 4 }} /> {formatTime(sessionTime)}
          </div>
          {messages.length > 1 && (
            <button onClick={onExport} title="Export session"
              className="p-1.5 rounded transition-all" style={{ color: "#4a4448" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#c9a84c"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#4a4448"; }}>
              <FileDown size={15} strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && !msg.isCounterpoint && (
                <div className="flex flex-col gap-2 max-w-[85%]">
                  <span className="text-xs font-semibold tracking-widest uppercase flex items-center gap-1.5" style={{ color: "#c9a84c" }}>
                    <Sparkles size={11} strokeWidth={2} /> Equanima
                  </span>
                  <div className="ai-prose text-sm leading-relaxed" style={{ color: "#f5f0e8" }}
                    dangerouslySetInnerHTML={{ __html: renderMessage(msg.content) }} />
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-px" style={{ background: "rgba(201,168,76,0.2)" }} />
                    <button onClick={() => onFavourite(msg.content)} title="Save this insight"
                      className="transition-all"
                      style={{ color: favourites.includes(msg.content.slice(0, 120)) ? "#c9a84c" : "#3a3a3e" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#c9a84c"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = favourites.includes(msg.content.slice(0, 120)) ? "#c9a84c" : "#3a3a3e"; }}>
                      <Bookmark size={13} strokeWidth={1.5}
                        fill={favourites.includes(msg.content.slice(0, 120)) ? "#c9a84c" : "none"} />
                    </button>
                    {i === lastAiIdx && canRegenerate && (
                      <button onClick={onRegenerate} title="Try a different response"
                        className="transition-all"
                        style={{ color: "#3a3a3e" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6b6460"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#3a3a3e"; }}>
                        <RefreshCw size={13} strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                </div>
              )}
              {msg.role === "assistant" && msg.isCounterpoint && (
                <div className="flex flex-col gap-2 max-w-[85%]">
                  <span className="text-xs font-semibold tracking-widest uppercase flex items-center gap-1.5" style={{ color: "#a8863a" }}>
                    <Scale size={11} strokeWidth={2} /> Counterpoint
                  </span>
                  <div className="ai-prose text-sm leading-relaxed pl-3" style={{ color: "#f5f0e8", borderLeft: "2px solid #4a3a1e" }}
                    dangerouslySetInnerHTML={{ __html: renderMessage(msg.content) }} />
                  <div className="w-8 h-px" style={{ background: "rgba(168,134,58,0.2)" }} />
                </div>
              )}
              {msg.role === "user" && (
                <div className="max-w-[75%] text-sm leading-relaxed rounded-lg px-4 py-3"
                  style={{ background: "#c9a84c", color: "#1c1c1e", fontWeight: 500 }}>
                  {msg.content}
                </div>
              )}
            </div>
          ))}

          {/* Streaming */}
          {isStreaming && streamingText && (
            <div className="flex justify-start">
              <div className="flex flex-col gap-2 max-w-[85%]">
                <span className="text-xs font-semibold tracking-widest uppercase flex items-center gap-1.5" style={{ color: "#c9a84c" }}><Sparkles size={11} strokeWidth={2} /> Equanima</span>
                <div className="ai-prose text-sm leading-relaxed typing-cursor" style={{ color: "#f5f0e8" }}
                  dangerouslySetInnerHTML={{ __html: renderMessage(streamingText) }} />
              </div>
            </div>
          )}
          {isStreaming && !streamingText && (
            <div className="flex justify-start">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold tracking-widest uppercase flex items-center gap-1.5" style={{ color: "#c9a84c" }}><Sparkles size={11} strokeWidth={2} /> Equanima</span>
                <div className="gentle-pulse">
                  <Sparkles size={18} color="#c9a84c" strokeWidth={1.5} />
                </div>
              </div>
            </div>
          )}

          {/* Counterpoint loading */}
          {isCounterpointing && (
            <div className="flex justify-start">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold tracking-widest uppercase flex items-center gap-1.5" style={{ color: "#a8863a" }}><Scale size={11} strokeWidth={2} /> Counterpoint</span>
                <div className="gentle-pulse">
                  <Scale size={18} color="#a8863a" strokeWidth={1.5} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && !isStreaming && (
        <div className="px-4 pt-3 pb-1">
          <div className="max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#4a4448" }}>Continue exploring</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => onSend(s)}
                  className="text-xs px-3 py-1.5 rounded-full transition-all"
                  style={{ background: "transparent", border: "1px solid #2a2a2e", color: "#6b6460" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#c9a84c";
                    (e.currentTarget as HTMLButtonElement).style.color = "#c9a84c";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#2a2a2e";
                    (e.currentTarget as HTMLButtonElement).style.color = "#6b6460";
                  }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {(showCounterpointButton || showWisdomButton) && (
        <div className="px-4 pt-2 pb-1">
          <div className="max-w-2xl mx-auto flex gap-2">
            {showCounterpointButton && (
              <button onClick={onCounterpoint}
                className="flex-1 py-2 text-xs font-semibold rounded-lg transition-all tracking-wide"
                style={{ border: "1px solid #4a3a1e", color: "#a8863a", background: "transparent" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(168,134,58,0.08)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
                <Scale size={14} strokeWidth={1.5} style={{ display: "inline", marginRight: 6 }} />Counterpoint
              </button>
            )}
            {showWisdomButton && (
              <button onClick={onGenerateWisdom}
                className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all tracking-wide"
                style={{ background: "linear-gradient(135deg, #c9a84c, #a8863a)", color: "#1c1c1e" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.9"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}>
                <Sparkles size={14} strokeWidth={2} style={{ display: "inline", marginRight: 6 }} />Distil this into wisdom
              </button>
            )}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-3" style={{ borderTop: "1px solid #2a2a2e" }}>
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <textarea ref={textareaRef} value={input}
              onChange={(e) => { setInput(e.target.value); autoResize(); }}
              onInput={autoResize}
              onKeyDown={handleKeyDown}
              placeholder={PLACEHOLDERS[placeholderIdx]} rows={1} disabled={isStreaming}
              className="flex-1 resize-none text-sm rounded-lg px-4 py-3 outline-none transition-all"
              style={{ background: "#2a2a2e", color: "#f5f0e8", border: "1px solid #3a3a3e", maxHeight: "120px", lineHeight: "1.5", overflow: "hidden" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#c9a84c"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#3a3a3e"; }} />
            {/* Voice button */}
            <button type="button" onClick={handleVoice} disabled={isStreaming}
              className="px-3 py-3 rounded-lg text-sm transition-all flex-shrink-0"
              title="Voice input (Chrome only)"
              style={{
                background: isListening ? "#c9a84c" : "#2a2a2e",
                color: isListening ? "#1c1c1e" : "#6b6460",
                border: `1px solid ${isListening ? "#c9a84c" : "#3a3a3e"}`,
              }}>
              <Mic size={16} strokeWidth={1.5} />
            </button>
            <button type="submit" disabled={isStreaming || !input.trim()}
              className="px-4 py-3 rounded-lg text-sm font-semibold transition-all flex-shrink-0"
              style={{
                background: isStreaming || !input.trim() ? "#3a3a3e" : "#c9a84c",
                color: isStreaming || !input.trim() ? "#6b6460" : "#1c1c1e",
                cursor: isStreaming || !input.trim() ? "not-allowed" : "pointer",
              }}>
              Send
            </button>
          </form>
          <p className="text-center text-xs mt-2" style={{ color: "#4a4448" }}>
            Enter to send · Shift+Enter for new line · mic for voice (Chrome)
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Wisdom Card Screen ───────────────────────────────────────────────────────

function WisdomCardScreen({ card, challenge, onNewSession, onContinue }: {
  card: WisdomCard;
  challenge: Challenge;
  onNewSession: () => void;
  onContinue: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [sitMode, setSitMode] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 80);
    return () => clearTimeout(t);
  }, []);

  async function handleCopy() {
    const text = `✦ Equanima Wisdom Card — ${challenge.label}\n\n"${card.insight}"\n\nTraditions: ${card.traditions.join(" · ")}\n\nPractice: ${card.practice}\n\nReflection: ${card.reflection}\n\n— Equanima: a space for the examined life`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const dataUrl = generateCardImage(card, challenge);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `equanima-wisdom-${challenge.id}.png`;
    a.click();
  }

  // "Sit with this" full-screen mode — just the insight quote and reflection
  if (sitMode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 py-16 fade-in"
        style={{ background: "#1c1c1e" }}>
        <div className="max-w-xl text-center">
          <div className="mb-8 flex justify-center gentle-pulse">
            <Sparkles size={24} color="#c9a84c" strokeWidth={1.5} />
          </div>
          <blockquote className="text-2xl font-medium leading-relaxed italic mb-10"
            style={{ color: "#f5f0e8", fontFamily: "var(--font-playfair), Georgia, serif" }}>
            &ldquo;{card.insight}&rdquo;
          </blockquote>
          <div className="w-16 h-px mx-auto mb-8" style={{ background: "linear-gradient(to right, transparent, #c9a84c, transparent)" }} />
          <p className="text-base leading-relaxed italic" style={{ color: "#c8bfaf" }}>
            {card.reflection}
          </p>
          <button onClick={() => setSitMode(false)}
            className="mt-12 text-xs uppercase tracking-widest transition-colors"
            style={{ color: "#4a4448" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#c9a84c"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#4a4448"; }}>
            Return to card
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <div className={`text-center mb-10 ${revealed ? "fade-in-up" : "opacity-0"}`}>
          <div className="mb-3 flex justify-center">
            <Sparkles size={36} color="#c9a84c" strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-bold mb-1"
            style={{ color: "#c9a84c", fontFamily: "var(--font-playfair), Georgia, serif" }}>
            Your Wisdom Card
          </h2>
          <p className="text-sm flex items-center justify-center gap-2" style={{ color: "#6b6460" }}>
            <ChallengeIcon id={challenge.id} size={14} color="#6b6460" /> {challenge.label}
          </p>
        </div>

        <div className={`rounded-xl p-8 mb-6 ${revealed ? "fade-in-up delay-200" : "opacity-0"}`}
          style={{ background: "#242428", border: "1px solid #3a3a3e", boxShadow: "0 0 40px rgba(201,168,76,0.08)" }}>
          <div className="w-full h-px mb-8"
            style={{ background: "linear-gradient(to right, transparent, #c9a84c, transparent)" }} />

          <blockquote className="text-xl font-medium leading-relaxed text-center mb-8 italic"
            style={{ color: "#f5f0e8", fontFamily: "var(--font-playfair), Georgia, serif" }}>
            &ldquo;{card.insight}&rdquo;
          </blockquote>

          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {card.traditions.map((t) => (
              <span key={t} className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
                style={{ background: "rgba(201,168,76,0.12)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.3)" }}>
                {t}
              </span>
            ))}
          </div>

          <div className="w-full h-px mb-6" style={{ background: "#2a2a2e" }} />

          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#a8863a" }}>Suggested Practice</h4>
            <p className="text-sm leading-relaxed" style={{ color: "#c8bfaf" }}>{card.practice}</p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#a8863a" }}>Sit with this</h4>
            <p className="text-sm leading-relaxed italic" style={{ color: "#c8bfaf" }}>{card.reflection}</p>
          </div>

          <div className="w-full h-px mt-8"
            style={{ background: "linear-gradient(to right, transparent, #c9a84c, transparent)" }} />
        </div>

        {/* Sit with this button */}
        <div className={`mb-4 ${revealed ? "fade-in delay-300" : "opacity-0"}`}>
          <button onClick={() => setSitMode(true)}
            className="w-full py-3 rounded-lg text-sm transition-all"
            style={{ border: "1px solid #2a2a2e", color: "#6b6460", background: "transparent" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#c9a84c"; (e.currentTarget as HTMLButtonElement).style.color = "#c9a84c"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#2a2a2e"; (e.currentTarget as HTMLButtonElement).style.color = "#6b6460"; }}>
            <Sparkles size={13} strokeWidth={1.5} style={{ display: "inline", marginRight: 6 }} />
            Sit with this quietly
          </button>
        </div>

        <div className={`grid grid-cols-3 gap-3 mb-3 ${revealed ? "fade-in delay-400" : "opacity-0"}`}>
          <button onClick={handleCopy}
            className="py-3 rounded-lg text-xs font-semibold transition-all"
            style={{ border: "1px solid #3a3a3e", color: "#c8bfaf", background: "transparent" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#c9a84c"; (e.currentTarget as HTMLButtonElement).style.color = "#c9a84c"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#3a3a3e"; (e.currentTarget as HTMLButtonElement).style.color = "#c8bfaf"; }}>
            <Copy size={13} strokeWidth={2} style={{ display: "inline", marginRight: 5 }} />
            {copied ? "Copied!" : "Copy"}
          </button>
          <button onClick={handleDownload}
            className="py-3 rounded-lg text-xs font-semibold transition-all"
            style={{ border: "1px solid #3a3a3e", color: "#c8bfaf", background: "transparent" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#c9a84c"; (e.currentTarget as HTMLButtonElement).style.color = "#c9a84c"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#3a3a3e"; (e.currentTarget as HTMLButtonElement).style.color = "#c8bfaf"; }}>
            <Download size={13} strokeWidth={2} style={{ display: "inline", marginRight: 5 }} />Save
          </button>
          <button onClick={async () => {
            const text = `"${card.insight}"\n\n— Equanima`;
            if (navigator.share) {
              try { await navigator.share({ title: "Equanima Wisdom", text, url: window.location.href }); }
              catch { /* user cancelled */ }
            } else { handleCopy(); }
          }}
            className="py-3 rounded-lg text-xs font-semibold transition-all"
            style={{ border: "1px solid #3a3a3e", color: "#c8bfaf", background: "transparent" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#c9a84c"; (e.currentTarget as HTMLButtonElement).style.color = "#c9a84c"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#3a3a3e"; (e.currentTarget as HTMLButtonElement).style.color = "#c8bfaf"; }}>
            <Share2 size={13} strokeWidth={2} style={{ display: "inline", marginRight: 5 }} />Share
          </button>
        </div>

        <div className={`grid grid-cols-2 gap-3 ${revealed ? "fade-in delay-500" : "opacity-0"}`}>
          <button onClick={onContinue}
            className="py-3 rounded-lg text-sm font-semibold transition-all"
            style={{ border: "1px solid #c9a84c", color: "#c9a84c", background: "transparent" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(201,168,76,0.08)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
            Continue the conversation
          </button>
          <button onClick={onNewSession}
            className="py-3 rounded-lg text-sm font-semibold transition-all"
            style={{ background: "linear-gradient(135deg, #c9a84c, #a8863a)", color: "#1c1c1e" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.9"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}>
            Begin again
          </button>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "#4a4448" }}>
          Equanima · a space for the examined life
        </p>
      </div>
    </div>
  );
}

// ─── Root Page ────────────────────────────────────────────────────────────────

export default function Page() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [mood, setMood] = useState("comfort");
  const [selectedTraditions, setSelectedTraditions] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [wisdomCard, setWisdomCard] = useState<WisdomCard | null>(null);
  const [isGeneratingWisdom, setIsGeneratingWisdom] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [counterpointText, setCounterpointText] = useState("");
  const [isCounterpointing, setIsCounterpointing] = useState(false);
  const [onboardingLevel, setOnboardingLevel] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [history, setHistory] = useState<SessionRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [sessionTime, setSessionTime] = useState(0);
  const systemPromptRef = useRef("");
  const [streak, setStreak] = useState(0);
  const [visitCounts, setVisitCounts] = useState<Record<string, number>>({});
  const [suggestedChallenge, setSuggestedChallenge] = useState<Challenge | null>(null);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userKey, setUserKey] = useState<string | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showRecoverModal, setShowRecoverModal] = useState(false);

  // Load persisted data on mount
  useEffect(() => {
    const level = loadLevel();
    setOnboardingLevel(level);
    setShowOnboarding(!level);
    setSelectedTraditions(loadTraditions());
    const s = updateStreak();
    setStreak(s);
    const counts = loadVisitCounts();
    setVisitCounts(counts);
    setSuggestedChallenge(getSuggestedChallenge(counts));
    setFavourites(loadFavourites());
    const notifPref = localStorage.getItem("equanima_notif") === "true";
    setNotifEnabled(notifPref);
    if (notifPref) showDailyNotification();

    const storedKey = localStorage.getItem("equanima_user_key");
    const storedId = localStorage.getItem("equanima_user_id");
    if (storedKey && storedId) {
      setUserId(storedId);
      setUserKey(storedKey);
      loadHistoryFromDB(storedId);
    } else {
      initUser();
    }
  }, []);

  // Session timer
  useEffect(() => {
    if (!sessionStart) return;
    const id = setInterval(() => setSessionTime(Math.floor((Date.now() - sessionStart) / 1000)), 1000);
    return () => clearInterval(id);
  }, [sessionStart]);

  async function initUser() {
    try {
      const res = await fetch("/api/user/init", { method: "POST" });
      const data = await res.json();
      localStorage.setItem("equanima_user_key", data.userKey);
      localStorage.setItem("equanima_user_id", data.userId);
      setUserId(data.userId);
      setUserKey(data.userKey);
      setShowKeyModal(true);
    } catch (e) {
      console.error("Failed to init user", e);
    }
  }

  async function loadHistoryFromDB(uid: string) {
    try {
      const res = await fetch(`/api/sessions?userId=${uid}`);
      const data = await res.json();
      const records: SessionRecord[] = (data.sessions ?? []).map((s: {
        id: string; challenge_label: string; challenge_icon: string;
        challenge_id: string; mood: string; created_at: string;
        message_count: number; preview: string; messages: Message[];
      }) => ({
        id: s.id,
        challengeLabel: s.challenge_label,
        challengeIcon: s.challenge_icon,
        challengeId: s.challenge_id,
        mood: s.mood,
        timestamp: new Date(s.created_at).getTime(),
        messageCount: s.message_count,
        preview: s.preview ?? "",
        messages: s.messages ?? [],
      }));
      setHistory(records);
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }

  async function saveSessionToDB(record: SessionRecord) {
    if (!userId) return;
    try {
      await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, session: record }),
      });
    } catch (e) {
      console.error("Failed to save session", e);
    }
  }

  async function handleClearHistory() {
    if (!userId) return;
    await fetch("/api/sessions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    setHistory([]);
  }

  async function handleRecover(key: string) {
    const res = await fetch("/api/user/recover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userKey: key }),
    });
    if (!res.ok) throw new Error("Key not found");
    const data = await res.json();
    localStorage.setItem("equanima_user_key", key);
    localStorage.setItem("equanima_user_id", data.userId);
    setUserId(data.userId);
    setUserKey(key);
    setShowRecoverModal(false);
    await loadHistoryFromDB(data.userId);
  }

  function handleOnboardingComplete(level: string) {
    saveLevel(level);
    setOnboardingLevel(level);
    setShowOnboarding(false);
  }

  function handleTraditionsChange(t: string[]) {
    setSelectedTraditions(t);
    saveTraditions(t);
  }

  async function animateOpening(text: string) {
    setIsStreaming(true);
    setStreamingText("");
    for (let i = 0; i < text.length; i++) {
      await new Promise((r) => setTimeout(r, 18));
      setStreamingText(text.slice(0, i + 1));
    }
    await new Promise((r) => setTimeout(r, 200));
    setIsStreaming(false);
    setStreamingText("");
    setMessages([{ role: "assistant", content: text }]);
  }

  function selectChallenge(c: Challenge) {
    const counts = incrementVisitCount(c.id);
    setVisitCounts(counts);
    setSuggestedChallenge(getSuggestedChallenge(counts));
    setChallenge(c);
    setScreen("mood");
  }

  async function selectMood(selectedMood: string) {
    setMood(selectedMood);
    setMessages([]);
    setWisdomCard(null);
    setSuggestions([]);
    setCounterpointText("");
    setSessionStart(Date.now());
    setSessionTime(0);
    systemPromptRef.current = buildSystemPrompt(selectedMood, selectedTraditions, onboardingLevel);
    setScreen("transitioning");
    await new Promise((r) => setTimeout(r, 1800));
    setScreen("chat");
    await animateOpening(challenge!.opening);
  }

  async function sendToAPI(history: Message[], text: string) {
    const userMsg: Message = { role: "user", content: text };
    const updatedMessages = [...history, userMsg];
    setMessages(updatedMessages);
    setSuggestions([]);
    setCounterpointText("");
    setIsStreaming(true);
    setStreamingText("");

    // Ensure conversation starts with user role
    const apiMessages = updatedMessages[0]?.role === "assistant"
      ? [{ role: "user" as const, content: "I am seeking philosophical guidance." }, ...updatedMessages]
      : updatedMessages;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, systemPrompt: systemPromptRef.current }),
      });

      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value, { stream: true }).split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              accumulated += JSON.parse(data).text;
              setStreamingText(accumulated);
            } catch { /* skip malformed */ }
          }
        }
      }

      const assistantMsg: Message = { role: "assistant", content: accumulated };
      const finalMessages = [...updatedMessages, assistantMsg];
      setMessages(finalMessages);
      fetchSuggestions(finalMessages);
    } finally {
      setIsStreaming(false);
      setStreamingText("");
    }
  }

  async function fetchSuggestions(history: Message[]) {
    setSuggestions([]);
    try {
      const apiMessages = history[0]?.role === "assistant"
        ? [{ role: "user" as const, content: "I am seeking philosophical guidance." }, ...history]
        : history;
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const { suggestions } = await res.json();
      setSuggestions(suggestions ?? []);
    } catch { setSuggestions([]); }
  }

  async function handleCounterpoint() {
    setIsCounterpointing(true);
    setSuggestions([]);
    try {
      const apiMessages = messages[0]?.role === "assistant"
        ? [{ role: "user" as const, content: "I am seeking philosophical guidance." }, ...messages]
        : messages;
      const res = await fetch("/api/counterpoint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const { text } = await res.json();
      if (text) {
        setMessages((prev) => [...prev, { role: "assistant", content: text, isCounterpoint: true }]);
      }
    } finally {
      setIsCounterpointing(false);
    }
  }

  function handleUserSend(text: string) {
    setSuggestions([]);
    sendToAPI(messages, text);
  }

  async function handleGenerateWisdom() {
    setIsGeneratingWisdom(true);
    // Save session to history
    const userMessages = messages.filter((m) => m.role === "user");
    if (challenge && userMessages.length >= 1) {
      const record: SessionRecord = {
        id: Date.now().toString(),
        challengeLabel: challenge.label,
        challengeIcon: challenge.id,
        challengeId: challenge.id,
        mood,
        timestamp: Date.now(),
        messageCount: userMessages.length,
        preview: userMessages[0].content,
        messages,
      };
      await saveSessionToDB(record);
      await loadHistoryFromDB(userId!);
    }

    try {
      const apiMessages = messages[0]?.role === "assistant"
        ? [{ role: "user" as const, content: "I am seeking philosophical guidance." }, ...messages]
        : messages;
      const res = await fetch("/api/wisdom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
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
    setSuggestions([]);
    setCounterpointText("");
    setSessionStart(null);
    setSessionTime(0);
  }

  async function handleBack() {
    const userMessages = messages.filter((m) => m.role === "user");
    if (challenge && userMessages.length >= 2) {
      const record: SessionRecord = {
        id: Date.now().toString(),
        challengeLabel: challenge.label,
        challengeIcon: challenge.id,
        challengeId: challenge.id,
        mood,
        timestamp: Date.now(),
        messageCount: userMessages.length,
        preview: userMessages[0].content,
        messages,
      };
      await saveSessionToDB(record);
      await loadHistoryFromDB(userId!);
    }
    handleNewSession();
  }

  function handleFavourite(content: string) {
    setFavourites(toggleFavouriteStored(content));
  }

  function handleRegenerate() {
    const lastUserIdx = messages.reduce((acc, m, i) => (m.role === "user" ? i : acc), -1);
    if (lastUserIdx < 0) return;
    const lastUserText = messages[lastUserIdx].content;
    const historyBefore = messages.slice(0, lastUserIdx);
    sendToAPI(historyBefore, lastUserText);
  }

  function handleExportTxt() {
    if (!challenge) return;
    const lines: string[] = [
      `Equanima — ${challenge.label}`,
      `Mood: ${MOODS.find((m) => m.id === mood)?.label ?? mood}`,
      `Date: ${new Date().toLocaleDateString()}`,
      "",
      "───────────────────────────────",
      "",
    ];
    for (const msg of messages) {
      if (msg.role === "user") {
        lines.push(`You: ${msg.content}`);
      } else {
        lines.push(`Equanima${msg.isCounterpoint ? " (Counterpoint)" : ""}: ${msg.content}`);
      }
      lines.push("");
    }
    lines.push("— Equanima: a space for the examined life");
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `equanima-${challenge.id}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleResume(record: SessionRecord) {
    if (!record.messages || record.messages.length === 0) return;
    const c = CHALLENGES.find((ch) => ch.id === record.challengeId) ?? null;
    if (!c) return;
    setChallenge(c);
    setMood(record.mood);
    setMessages(record.messages);
    setSuggestions([]);
    setCounterpointText("");
    setSessionStart(Date.now());
    setSessionTime(0);
    systemPromptRef.current = buildSystemPrompt(record.mood, selectedTraditions, onboardingLevel);
    setShowHistory(false);
    setScreen("chat");
  }

  async function handleNotificationToggle() {
    if (notifEnabled) {
      localStorage.setItem("equanima_notif", "false");
      setNotifEnabled(false);
    } else {
      if (!("Notification" in window)) { alert("Notifications are not supported in this browser."); return; }
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        localStorage.setItem("equanima_notif", "true");
        setNotifEnabled(true);
        showDailyNotification();
      }
    }
  }

  return (
    <>
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
      {showKeyModal && userKey && (
        <RecoveryKeyModal userKey={userKey} onClose={() => setShowKeyModal(false)} />
      )}
      {showRecoverModal && (
        <RecoverModal onRecover={handleRecover} onClose={() => setShowRecoverModal(false)} />
      )}
      {showHistory && (
        <HistoryPanel
          history={history}
          favourites={favourites}
          onClose={() => setShowHistory(false)}
          onClear={handleClearHistory}
          onResume={handleResume}
          userKey={userKey}
        />
      )}

      {isGeneratingWisdom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(28,28,30,0.9)" }}>
          <div className="text-center">
            <div className="mb-4 gold-pulse flex justify-center">
              <Sparkles size={40} color="#c9a84c" strokeWidth={1.5} />
            </div>
            <p className="text-sm tracking-widest uppercase" style={{ color: "#c9a84c" }}>Distilling wisdom…</p>
          </div>
        </div>
      )}

      {screen === "landing" && (
        <LandingScreen
          onSelect={selectChallenge}
          selectedTraditions={selectedTraditions}
          onTraditionsChange={handleTraditionsChange}
          onShowHistory={() => setShowHistory(true)}
          historyCount={history.length}
          streak={streak}
          suggestedChallenge={suggestedChallenge}
          notifEnabled={notifEnabled}
          onNotificationToggle={handleNotificationToggle}
          onRecover={() => setShowRecoverModal(true)}
        />
      )}

      {screen === "mood" && challenge && (
        <MoodScreen challenge={challenge} onSelect={selectMood} onBack={() => setScreen("landing")} />
      )}

      {screen === "transitioning" && challenge && (
        <TransitionScreen challenge={challenge} />
      )}

      {screen === "chat" && challenge && (
        <ChatScreen
          challenge={challenge}
          mood={mood}
          messages={messages}
          onBack={handleBack}
          onSend={handleUserSend}
          onGenerateWisdom={handleGenerateWisdom}
          isStreaming={isStreaming}
          streamingText={streamingText}
          suggestions={suggestions}
          counterpointText={counterpointText}
          isCounterpointing={isCounterpointing}
          onCounterpoint={handleCounterpoint}
          sessionTime={sessionTime}
          favourites={favourites}
          onFavourite={handleFavourite}
          onRegenerate={handleRegenerate}
          onExport={handleExportTxt}
        />
      )}

      {screen === "wisdom" && wisdomCard && challenge && (
        <WisdomCardScreen card={wisdomCard} challenge={challenge} onNewSession={handleNewSession}
          onContinue={() => setScreen("chat")} />
      )}
    </>
  );
}
