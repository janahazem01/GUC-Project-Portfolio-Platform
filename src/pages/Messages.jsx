import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, PageHeader } from "../components/ui";
import { AuthContext } from "../context/AuthContext";
import { useDoNotDisturb } from "../hooks/useDoNotDisturb";
import {
  getOtherParticipant,
  getThreadById,
  getThreadUnreadInboundCount,
  getThreadsForUser,
  markThreadReadForViewer,
  sendThreadMessage,
  subscribeDummyUpdates,
} from "../data/dummy";

function avatarInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function Messages() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [listQuery, setListQuery] = useState("");
  const [composeText, setComposeText] = useState("");
  const [, setRev] = useState(0);

  useEffect(() => subscribeDummyUpdates(() => setRev((r) => r + 1)), []);

  const threads = useMemo(() => getThreadsForUser(user), [user]);
  const selectedId = searchParams.get("thread") || "";

  const filteredThreads = useMemo(() => {
    const q = listQuery.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((thread) => {
      const other = getOtherParticipant(thread, user);
      if (!other) return false;
      const preview = thread.messages[thread.messages.length - 1]?.text || "";
      return (
        other.name.toLowerCase().includes(q) ||
        other.email.toLowerCase().includes(q) ||
        preview.toLowerCase().includes(q)
      );
    });
  }, [threads, listQuery, user]);

  const activeThread = selectedId ? getThreadById(selectedId) : null;
  const activeValid = activeThread && activeThread.participants.some((p) => p.userId === user?.id);

  useEffect(() => {
    if (selectedId && !activeValid) {
      setSearchParams({}, { replace: true });
    }
  }, [selectedId, activeValid, setSearchParams]);

  useEffect(() => {
    if (!selectedId || !user?.id || !activeValid) return;
    markThreadReadForViewer(selectedId, user);
  }, [selectedId, user, activeValid]);

  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages?.length, activeThread?.id]);

  const other = activeThread && user ? getOtherParticipant(activeThread, user) : null;

  const dndBlur = useDoNotDisturb(user);

  const send = (event) => {
    event.preventDefault();
    if (!activeThread || !composeText.trim()) return;
    sendThreadMessage(activeThread.id, user, composeText);
    setComposeText("");
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-6rem)]">
      <PageHeader
        title="Messaging"
        subtitle="Private conversations with students, employers, and instructors."
        action={
          <Button variant="secondary" onClick={() => navigate("/")}>
            Back
          </Button>
        }
      />

      <div
        className={`flex flex-1 min-h-0 rounded-xl border border-border/80 bg-bg-surface/80 shadow-inner overflow-hidden backdrop-blur-sm transition-[filter] ${
          dndBlur ? "blur-[11px] saturate-50 opacity-85 pointer-events-none select-none" : ""
        }`}
      >
        <aside className="w-full max-w-[20rem] border-r border-border flex flex-col shrink-0 bg-bg-base/40">
          <div className="p-3 border-b border-border space-y-2">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm" aria-hidden>
                ⌕
              </span>
              <input
                type="search"
                placeholder="Search messages"
                value={listQuery}
                onChange={(e) => setListQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg-elevated pl-9 pr-3 py-2 text-sm text-text-primary font-sans placeholder:text-text-secondary/60 focus:outline-none focus:border-accent-blue"
              />
            </div>
            <div className="flex gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-text-secondary">Focused</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            {filteredThreads.length === 0 ? (
              <p className="p-4 text-sm text-text-secondary font-sans">No conversations match your search.</p>
            ) : (
              filteredThreads.map((thread) => {
                const peer = getOtherParticipant(thread, user);
                const last = thread.messages[thread.messages.length - 1];
                const isActive = thread.id === selectedId;
                const unread = getThreadUnreadInboundCount(thread, user);
                const rowBold = unread > 0;
                return (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => setSearchParams({ thread: thread.id })}
                    className={`w-full text-left px-3 py-3 flex gap-3 border-b border-border transition-colors hover:bg-bg-elevated/60 ${
                      isActive ? "bg-accent-gold/10 border-l-2 border-l-accent-gold pl-[10px]" : "border-l-2 border-l-transparent"
                    } ${rowBold && !isActive ? "bg-accent-blue/[0.06]" : ""}`}
                  >
                    <div className="relative shrink-0">
                      <div className="h-10 w-10 rounded-full bg-bg-elevated border border-border flex items-center justify-center text-xs font-semibold text-text-primary font-sans">
                        {avatarInitials(peer?.name)}
                      </div>
                      <span
                        className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success border-2 border-bg-base"
                        aria-hidden
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2 items-baseline">
                        <span className={`font-sans text-sm truncate ${rowBold ? "font-bold text-text-primary" : "font-semibold text-text-primary"}`}>
                          {peer?.name}
                        </span>
                        <span className="text-[11px] font-mono text-text-secondary shrink-0">{last?.time}</span>
                      </div>
                      <p className={`text-xs font-sans line-clamp-2 mt-0.5 ${rowBold ? "font-semibold text-text-primary" : "text-text-secondary"}`}>{last?.text}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="flex-1 flex flex-col min-w-0 bg-bg-surface">
          {!selectedId || !activeValid || !other ? (
            <div className="flex-1 flex items-center justify-center p-8 text-text-secondary text-sm font-sans text-center max-w-sm mx-auto">
              Choose a conversation on the left to open the thread. Nothing is shown here until you select one.
            </div>
          ) : (
            <>
              <header className="shrink-0 px-5 py-4 border-b border-border flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-11 w-11 rounded-full bg-bg-elevated border border-border flex items-center justify-center text-sm font-semibold text-text-primary shrink-0">
                    {avatarInitials(other.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-sans text-sm font-semibold text-text-primary truncate">{other.name}</p>
                    <p className="text-xs text-text-secondary font-mono truncate">{other.email}</p>
                  </div>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
                {activeThread.messages.map((msg) => {
                  const mine = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={`flex gap-3 ${mine ? "flex-row-reverse" : ""}`}>
                      <div className="h-8 w-8 rounded-full bg-bg-elevated border border-border flex items-center justify-center text-[10px] font-semibold shrink-0">
                        {avatarInitials(
                          activeThread.participants.find((p) => p.userId === msg.senderId)?.name
                        )}
                      </div>
                      <div className={`max-w-[min(32rem,85%)] ${mine ? "items-end" : "items-start"} flex flex-col gap-1`}>
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-sm font-sans leading-relaxed ${
                            mine
                              ? "bg-accent-blue text-white rounded-br-md"
                              : "bg-bg-elevated border border-border text-text-primary rounded-bl-md"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[10px] font-mono text-text-secondary px-1">{msg.time}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={send} className="shrink-0 p-4 border-t border-border bg-bg-base/30">
                <div className="flex gap-2 items-end">
                  <textarea
                    value={composeText}
                    onChange={(e) => setComposeText(e.target.value)}
                    placeholder="Write a message…"
                    rows={2}
                    className="flex-1 rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary font-sans placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-blue resize-none"
                  />
                  <Button type="submit" variant="primary" className="shrink-0 rounded-full px-6" disabled={!composeText.trim()}>
                    Send
                  </Button>
                </div>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
