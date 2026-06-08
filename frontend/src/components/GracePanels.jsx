/**
 * GracePanels.jsx — § GRACE-PANELS 2026-02
 *
 * Five interactive sub-panels for the Grace / Hearth room. Mounted in
 * a modal overlay above the room shell when the sidebar item is
 * clicked. Built from Atomsi spec (paneeli-komponendid).
 *
 * Panels: enter | speak | write | sit | reflections
 */
import { useState, useEffect, useRef } from "react";
import { X, Send, Flame } from "lucide-react";

/* ----- ENTER ----- */
function EnterPanel() {
  return (
    <div className="space-y-6 text-[#f5f0e8]">
      <h3 className="font-serif text-3xl">You are here.</h3>
      <p className="text-[#a09080] text-base leading-relaxed">
        Take your time. There is nothing to do, nowhere to be, nothing to fix.
        This room is yours for as long as you need it.
      </p>
      <div className="p-5 border border-[#d4a574]/20 rounded-xl bg-[#0a0a1a]/60">
        <p className="text-[#c8b8a0] italic">
          "What would you like to bring into the room tonight?"
        </p>
        <p className="text-xs text-[#5a4a3a] mt-2">— Grace</p>
      </div>
      <div className="space-y-1.5 text-[#8a7a6a] text-sm">
        <p>You can speak, write, or simply sit.</p>
        <p>The fire is warm. The rain is soft against the window.</p>
        <p>There is no rush.</p>
      </div>
    </div>
  );
}

/* ----- SPEAK ----- */
function SpeakPanel() {
  const [messages, setMessages] = useState([
    { role: "grace", text: "Take your time. What would you like to bring into the room tonight?" },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  useEffect(() => { scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" }); }, [messages]);
  const responses = [
    "I hear you. Thank you for sharing that.",
    "There is no rush. Take all the time you need.",
    "That sounds like something worth sitting with for a moment.",
    "You do not need to explain further unless you want to.",
    "I am here. The fire is still warm.",
    "Sometimes just saying it out loud is enough.",
  ];
  const send = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setMessages((p) => [...p, { role: "user", text }]);
    setInput("");
    setTimeout(() => {
      setMessages((p) => [...p, { role: "grace", text: responses[Math.floor(Math.random() * responses.length)] }]);
    }, 1400);
  };
  return (
    <div className="flex flex-col h-[58vh]">
      <h3 className="font-serif text-2xl text-[#f5f0e8] mb-1">Speak With Grace</h3>
      <p className="text-sm text-[#6a5a4a] mb-4">Say what is on your mind. There is no judgment here.</p>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed ${
              m.role === "user"
                ? "bg-[#1a1a2e] text-[#c8b8a0] rounded-br-md"
                : "bg-[#0a0a1a] border border-[#1a1a2e] text-[#d4a574] rounded-bl-md"
            }`}>
              {m.role === "grace" && <p className="text-[10px] text-[#5a4a3a] mb-0.5">Grace</p>}
              <p>{m.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Speak your mind..."
          rows={2}
          data-testid="hearth-speak-input"
          className="flex-1 bg-[#0a0a1a] border border-[#1a1a2e] rounded-xl px-3.5 py-2.5 text-[#f5f0e8] placeholder-[#4a3a2a] text-sm resize-none focus:outline-none focus:border-[#d4a574]/40"
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          data-testid="hearth-speak-send"
          className="px-4 py-2.5 bg-[#d4a574]/20 border border-[#d4a574]/40 rounded-xl text-[#d4a574] hover:bg-[#d4a574]/30 disabled:opacity-30 transition-all">
          <Send size={16} strokeWidth={1.6} />
        </button>
      </div>
    </div>
  );
}

/* ----- WRITE ----- */
function WritePanel() {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState([]);
  const [flash, setFlash] = useState(false);
  const save = () => {
    if (!text.trim()) return;
    setSaved((p) => [{ id: Date.now(), text: text.trim(), t: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }, ...p]);
    setText("");
    setFlash(true);
    setTimeout(() => setFlash(false), 2500);
  };
  return (
    <div>
      <h3 className="font-serif text-2xl text-[#f5f0e8] mb-1">Leave a Thought</h3>
      <p className="text-sm text-[#6a5a4a] mb-5">Like a letter never sent. Like a thought that needed a place to rest.</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What is on your mind tonight?"
        rows={7}
        data-testid="hearth-write-input"
        className="w-full bg-[#0a0a1a] border border-[#1a1a2e] rounded-2xl px-5 py-4 text-[#f5f0e8] placeholder-[#3a2a1a] text-[15px] leading-relaxed resize-none focus:outline-none focus:border-[#d4a574]/30 font-serif"
      />
      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={save}
          disabled={!text.trim()}
          data-testid="hearth-write-save"
          className="px-5 py-2.5 bg-[#d4a574]/15 border border-[#d4a574]/40 rounded-xl text-[#d4a574] hover:bg-[#d4a574]/25 disabled:opacity-30 transition-all text-sm">
          Leave by the fire
        </button>
        {flash && <span className="text-xs text-[#6a5a4a] italic">Saved quietly.</span>}
      </div>
      {saved.length > 0 && (
        <div className="mt-8">
          <h4 className="text-xs text-[#5a4a3a] mb-3 uppercase tracking-[0.18em]">Tonight's thoughts</h4>
          <div className="space-y-2.5">
            {saved.map((s) => (
              <div key={s.id} className="p-3.5 border border-[#1a1a2e] rounded-lg bg-[#0a0a1a]/40">
                <p className="text-[#c8b8a0] text-sm italic leading-relaxed">"{s.text}"</p>
                <p className="text-[10px] text-[#3a2a1a] mt-1.5">{s.t}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ----- SIT (silence) ----- */
function SitPanel() {
  const [elapsed, setElapsed] = useState(0);
  const [showHint, setShowHint] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setElapsed((p) => p + 1), 1000);
    const ht = setTimeout(() => setShowHint(false), 5000);
    return () => { clearInterval(t); clearTimeout(ht); };
  }, []);
  const m = Math.floor(elapsed / 60), s = elapsed % 60;
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[55vh] py-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[260px] bg-[#e8a838]/10 rounded-full blur-[80px] animate-pulse" />
      </div>
      <div className="relative text-center">
        <Flame size={42} strokeWidth={1.2} className="mx-auto mb-7" style={{ color: "#e8a838" }} />
        <p className="text-[#4a3a2a] text-sm font-mono mb-3">
          {m}:{String(s).padStart(2, "0")}
        </p>
        <p className={`text-[#3a2a1a] text-xs italic transition-opacity duration-[3000ms] ${showHint ? "opacity-100" : "opacity-0"}`}>
          You are here. That is enough.
        </p>
      </div>
    </div>
  );
}

/* ----- REFLECTIONS ----- */
function ReflectionsPanel() {
  const past = [
    { id: 1, text: "I realized I have been carrying something that is not mine to carry.", date: "Three evenings ago", type: "thought" },
    { id: 2, text: "The silence was enough tonight. I did not need words.",                  date: "Last week",        type: "silence" },
    { id: 3, text: "Sometimes the hardest thing is admitting that I am tired. Not of anything specific. Just tired.", date: "A quiet Tuesday", type: "thought" },
    { id: 4, text: "Grace said: 'You do not need to explain further unless you want to.' That was enough.", date: "Before the rain", type: "conversation" },
  ];
  return (
    <div>
      <h3 className="font-serif text-2xl text-[#f5f0e8] mb-1">Reflections</h3>
      <p className="text-sm text-[#6a5a4a] mb-5">Thoughts you have left here before. They are safe.</p>
      <div className="space-y-3">
        {past.map((r) => (
          <div key={r.id} className="p-4 border border-[#1a1a2e] rounded-xl bg-[#0a0a1a]/40 hover:border-[#d4a574]/20 transition-all">
            <p className="text-[#c8b8a0] italic text-sm leading-relaxed">"{r.text}"</p>
            <div className="flex items-center gap-2 mt-2.5">
              <span className="text-xs text-[#4a3a2a]">{r.date}</span>
              <span className="text-xs text-[#3a2a1a]">·</span>
              <span className="text-xs text-[#5a4a3a] capitalize">{r.type}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 p-4 border border-dashed border-[#1a1a2e] rounded-xl text-center text-xs text-[#4a3a2a] italic">
        New reflections will appear here as you spend time in the room.
      </p>
    </div>
  );
}

/* ----- MODAL WRAPPER ----- */
export default function GracePanels({ openId, onClose }) {
  if (!openId) return null;
  const titleMap = { enter: "Enter", speak: "Speak With Grace", write: "Leave a Thought", sit: "Sit By The Fire", reflections: "Reflections" };
  const PanelMap = { enter: EnterPanel, speak: SpeakPanel, write: WritePanel, sit: SitPanel, reflections: ReflectionsPanel };
  const Panel = PanelMap[openId];
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-8 animate-fade-in-up"
      style={{ background: "rgba(5, 5, 15, 0.78)", backdropFilter: "blur(8px)" }}
      data-testid="hearth-panel-overlay"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[820px] max-h-[88vh] overflow-y-auto rounded-3xl p-7 md:p-10"
        style={{
          background: "#0f0f23",
          border: "1px solid rgba(212, 165, 116, 0.22)",
          boxShadow: "0 30px 80px -20px rgba(232, 168, 56, 0.18)",
        }}
        data-testid={`hearth-panel-${openId}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          data-testid="hearth-panel-close"
          className="absolute top-4 right-4 p-2 rounded-full text-[#6a5a4a] hover:text-[#d4a574] hover:bg-[#d4a574]/10 transition-all"
          aria-label="Close panel"
        >
          <X size={18} strokeWidth={1.6} />
        </button>
        {Panel && <Panel />}
      </div>
    </div>
  );
}
