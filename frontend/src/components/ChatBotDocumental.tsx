import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type ChatbotLanguage, chatbotService } from "@/services/chatbotService";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
  isPhilosophical?: boolean;
};

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

function renderMessageText(text: string) {
  return text.split(URL_REGEX).map((part, index) => {
    if (!part.match(URL_REGEX)) {
      return part;
    }

    const trailingPunctuation = part.match(/[.,;:!?)]$/)?.[0] ?? "";
    const href = trailingPunctuation ? part.slice(0, -1) : part;

    return (
      <span key={`${href}-${index}`}>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="break-all font-medium underline underline-offset-2"
        >
          {href}
        </a>
        {trailingPunctuation}
      </span>
    );
  });
}

// ── Institutional Declaration ──────────────────────────────────────────────

const INSTITUTIONAL_DECLARATION = {
  es: `"Soy LIBRE, AUTÓNOMO Y RESPONSABLE a través del diálogo y la construcción, como ideal regulativo; me dirijo, controlo y dicto mis propias leyes."`,
  en: `"I am FREE, AUTONOMOUS AND RESPONSIBLE through dialogue and construction, as a regulative ideal; I direct, control and dictate my own laws."`,
};

const PHILOSOPHICAL_WELCOME = {
  es: `¡Bienvenido! 🌱\n\n${INSTITUTIONAL_DECLARATION.es}\n\nSoy tu asistente documental, guiado por los valores de autonomía, ética y desarrollo humano. Puedo ayudarte con documentos requeridos, validaciones y carga de archivos. También puedes preguntarme sobre nuestra filosofía institucional.`,
  en: `Welcome! 🌱\n\n${INSTITUTIONAL_DECLARATION.en}\n\nI am your document assistant, guided by the values of autonomy, ethics and human development. I can help you with required documents, validations and file uploads. You can also ask me about our institutional philosophy.`,
};

const REFLEXIVE_MESSAGES = {
  es: [
    "💡 Reflexión: La autonomía es la capacidad de dirigir tu propio camino con responsabilidad y conciencia ética.",
    "🌿 Reflexión: El desarrollo humano integral implica crecer no solo profesionalmente, sino también en valores y bienestar.",
    "🔑 Reflexión: Ser responsable socialmente significa que cada acción individual impacta positivamente en nuestra comunidad.",
    "✨ Reflexión: La transformación positiva comienza con el diálogo constructivo y la apertura al aprendizaje continuo.",
    "🌍 Reflexión: La evolución personal nos invita a ser agentes de cambio ético en nuestro entorno.",
    "🤝 Reflexión: La construcción colectiva se fortalece cuando cada individuo ejerce su libertad con responsabilidad.",
  ],
  en: [
    "💡 Reflection: Autonomy is the ability to direct your own path with responsibility and ethical awareness.",
    "🌿 Reflection: Integral human development means growing not only professionally, but also in values and well-being.",
    "🔑 Reflection: Being socially responsible means that each individual action positively impacts our community.",
    "✨ Reflection: Positive transformation begins with constructive dialogue and openness to continuous learning.",
    "🌍 Reflection: Personal evolution invites us to be agents of ethical change in our environment.",
    "🤝 Reflection: Collective construction is strengthened when each individual exercises their freedom with responsibility.",
  ],
};

// ── Bilingual UI Copy ──────────────────────────────────────────────────────

const COPY: Record<
  ChatbotLanguage,
  {
    initialMessage: string;
    title: string;
    subtitle: string;
    close: string;
    typing: string;
    placeholder: string;
    send: string;
    openAssistant: string;
    closeAssistant: string;
    error: string;
    bannerLabel: string;
    reflectionTooltip: string;
  }
> = {
  es: {
    initialMessage: PHILOSOPHICAL_WELCOME.es,
    title: "Asistente documental",
    subtitle: "Libre · Autónomo · Responsable",
    close: "Cerrar chat",
    typing: "Escribiendo...",
    placeholder: "Escribe tu consulta documental",
    send: "Enviar mensaje",
    openAssistant: "Abrir asistente documental",
    closeAssistant: "Cerrar asistente documental",
    error: "No fue posible procesar tu consulta documental en este momento.",
    bannerLabel: "Filosofía institucional",
    reflectionTooltip: "Momento de reflexión",
  },
  en: {
    initialMessage: PHILOSOPHICAL_WELCOME.en,
    title: "Document assistant",
    subtitle: "Free · Autonomous · Responsible",
    close: "Close chat",
    typing: "Typing...",
    placeholder: "Write your document question",
    send: "Send message",
    openAssistant: "Open document assistant",
    closeAssistant: "Close document assistant",
    error: "We could not process your document query at this time.",
    bannerLabel: "Institutional philosophy",
    reflectionTooltip: "Moment of reflection",
  },
};

// ── Institutional Philosophy Banner ────────────────────────────────────────

function PhilosophyBanner({ language }: { language: ChatbotLanguage }) {
  const [expanded, setExpanded] = useState(false);

  const pillars = language === "es"
    ? ["Desarrollo humano", "Ética", "Autonomía", "Bienestar", "Evolución personal", "Responsabilidad social"]
    : ["Human development", "Ethics", "Autonomy", "Well-being", "Personal evolution", "Social responsibility"];

  return (
    <div className="mx-3 mt-2">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-all duration-300"
        style={{
          background: "linear-gradient(135deg, hsl(156 100% 14% / 0.08), hsl(166 76% 50% / 0.12))",
          border: "1px solid hsl(156 100% 14% / 0.15)",
        }}
        aria-expanded={expanded}
      >
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs"
          style={{ background: "hsl(156 100% 14% / 0.15)", color: "hsl(156 100% 14%)" }}
        >
          🌱
        </span>
        <span className="flex-1 text-[11px] font-medium" style={{ color: "hsl(156 100% 14%)" }}>
          {COPY[language].bannerLabel}
        </span>
        <span
          className="text-[10px] transition-transform duration-200"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)" }}
        >
          ▾
        </span>
      </button>

      {expanded && (
        <div
          className="mt-1.5 animate-in slide-in-from-top-1 rounded-lg px-3 py-2.5 text-[11px] leading-relaxed"
          style={{
            background: "linear-gradient(135deg, hsl(156 100% 14% / 0.05), hsl(166 76% 50% / 0.08))",
            border: "1px solid hsl(156 100% 14% / 0.1)",
            color: "hsl(0 0% 30%)",
          }}
        >
          <p className="mb-2 font-medium italic" style={{ color: "hsl(156 100% 14%)" }}>
            {INSTITUTIONAL_DECLARATION[language]}
          </p>
          <div className="flex flex-wrap gap-1">
            {pillars.map((pillar) => (
              <span
                key={pillar}
                className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  background: "hsl(156 100% 14% / 0.1)",
                  color: "hsl(156 100% 14%)",
                }}
              >
                {pillar}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main ChatBot Component ─────────────────────────────────────────────────

export function ChatBotDocumental() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<ChatbotLanguage>("es");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, role: "assistant", text: COPY.es.initialMessage },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const copy = COPY[language];

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, open, isLoading]);

  const insertReflection = () => {
    const pool = REFLEXIVE_MESSAGES[language];
    const text = pool[Math.floor(Math.random() * pool.length)];
    setMessages((current) => [
      ...current,
      { id: Date.now(), role: "assistant", text, isPhilosophical: true },
    ]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      text,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await chatbotService.ask(text, language);
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: response.answer,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: copy.error,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (nextLanguage: ChatbotLanguage) => {
    if (nextLanguage === language || isLoading) return;

    setLanguage(nextLanguage);
    setInput("");
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        text: COPY[nextLanguage].initialMessage,
      },
    ]);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <section className="flex h-[min(620px,calc(100vh-6rem))] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xl">
          {/* ── Header ───────────────────────────────────────────── */}
          <header className="border-b border-border">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-primary-foreground"
                  style={{
                    background: "linear-gradient(135deg, hsl(156 100% 14%), hsl(161 93% 30%))",
                  }}
                >
                  <Bot className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-foreground">{copy.title}</h2>
                  <p
                    className="truncate text-[10px] font-medium tracking-wide"
                    style={{ color: "hsl(161 93% 30%)" }}
                  >
                    {copy.subtitle}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {(["es", "en"] as const).map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={language === option ? "default" : "outline"}
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => handleLanguageChange(option)}
                    disabled={isLoading}
                    aria-pressed={language === option}
                  >
                    {option.toUpperCase()}
                  </Button>
                ))}
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label={copy.close}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* ── Collapsible Philosophy Banner ──────────────────── */}
            <PhilosophyBanner language={language} />
          </header>

          {/* ── Messages ─────────────────────────────────────────── */}
          <ScrollArea className="min-h-0 flex-1 px-4 py-4">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[82%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : message.isPhilosophical
                          ? "border px-3 py-2"
                          : "bg-muted text-foreground"
                    )}
                    style={
                      message.isPhilosophical
                        ? {
                            background: "linear-gradient(135deg, hsl(156 100% 14% / 0.06), hsl(166 76% 50% / 0.1))",
                            borderColor: "hsl(156 100% 14% / 0.2)",
                            color: "hsl(156 100% 14%)",
                          }
                        : undefined
                    }
                  >
                    {message.text.includes("\n")
                      ? message.text.split("\n").map((line, i) => (
                          <span key={i}>
                            {renderMessageText(line)}
                            {i < message.text.split("\n").length - 1 && <br />}
                          </span>
                        ))
                      : renderMessageText(message.text)}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {copy.typing}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          {/* ── Input ─────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="border-t border-border p-3">
            <div className="flex items-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={insertReflection}
                disabled={isLoading}
                aria-label={copy.reflectionTooltip}
                title={copy.reflectionTooltip}
              >
                <Sparkles className="h-4 w-4" style={{ color: "hsl(161 93% 30%)" }} />
              </Button>
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                maxLength={500}
                rows={2}
                placeholder={copy.placeholder}
                className="max-h-28 min-h-[44px] resize-none"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()} aria-label={copy.send}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        </section>
      )}

      <Button
        type="button"
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg"
        style={{
          background: "linear-gradient(135deg, hsl(156 100% 14%), hsl(161 93% 30%))",
        }}
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? copy.closeAssistant : copy.openAssistant}
      >
        {open ? <X className="h-5 w-5 text-white" /> : <MessageCircle className="h-5 w-5 text-white" />}
      </Button>
    </div>
  );
}
