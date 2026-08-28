"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const suggestions = [
  "Tell me about ARRC policies",
  "How do I join?",
  "What is the constitution?",
  "Leadership structure",
];

const chatPanelVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

const fabVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 20, delay: 1 },
  },
};

const messageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Sawubona! I'm the ARRC assistant. Ask me about our constitution, policies, leadership, or how to join.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionId = useMemo(
    () => `chat-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    []
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: text.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message || "I'm here to help!" },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I'm sorry, I'm having trouble connecting right now. Please try again later.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestion = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <>
      {/* FAB Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            variants={fabVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, scale: 0, transition: { duration: 0.2 } }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-arrc-800 to-arrc-950 text-white shadow-xl hover:shadow-2xl hover:shadow-arrc-gold/10 transition-shadow animate-pulse-glow"
            aria-label="Open chat assistant"
          >
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={chatPanelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="liquid-glass-frost fixed bottom-6 right-6 z-50 flex h-[520px] w-[370px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden sm:h-[560px]"
          >
            {/* Header */}
            <div className="relative flex items-center justify-between bg-gradient-to-r from-arrc-950 to-arrc-800 px-4 py-3.5">
              {/* Shimmer overlay */}
              <div className="absolute inset-0 animate-shimmer opacity-30" />
              <div className="relative flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-arrc-gold shadow-lg shadow-arrc-gold/20">
                  <Bot className="h-5 w-5 text-arrc-950" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    ARRC AI Assistant
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                    <p className="text-[11px] text-white/50">Online</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="relative rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  className={`flex gap-2 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-arrc-100 text-arrc-700">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-arrc-800 text-white rounded-br-md"
                        : "bg-gray-100 text-gray-800 rounded-bl-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-arrc-800 text-white">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2 justify-start"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-arrc-100 text-arrc-700">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1.5">
                      <motion.span
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                        className="h-2 w-2 rounded-full bg-gray-400"
                      />
                      <motion.span
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                        className="h-2 w-2 rounded-full bg-gray-400"
                      />
                      <motion.span
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                        className="h-2 w-2 rounded-full bg-gray-400"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Suggestion Chips */}
            {messages.length <= 1 && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="px-4 pb-2"
              >
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Quick questions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSuggestion(s)}
                      className="rounded-full border border-arrc-200 bg-arrc-50/80 px-3 py-1.5 text-[11px] font-medium text-arrc-800 hover:bg-arrc-100 hover:border-arrc-gold/30 transition-all duration-200"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 border-t border-gray-200/50 p-3"
              style={{ background: "rgba(255,255,255,0.6)" }}
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about ARRC..."
                className="flex-1 border-arrc-200/60 text-sm bg-white/80 focus:border-arrc-gold"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-arrc-800 to-arrc-950 hover:from-arrc-700 hover:to-arrc-800 text-white shrink-0 rounded-xl h-9 w-9"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
