"use client";

// Formulario guiado de ideas para los casos B y C. REQ-FE-3 / REQ-AI-7.
// - Una pregunta por paso con opciones fijas + texto libre (sin chat libre).
// - Back/forward: el historial de respuestas vive en el cliente; solo el
//   último paso hace una llamada LLM única a POST /ai/onboarding/ideas.

import React, { useState } from "react";
import { http } from "@/lib/http-client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AiCase, AiIdeasResponse } from "@/lib/ai-types";

export interface StepOption {
  value: string;
  label: string;
}

interface IdeaStep {
  key: string;
  question: string;
  options: StepOption[];
  freeTextLabel: string;
}

const STEPS: IdeaStep[] = [
  {
    key: "content_type",
    question: "¿Qué tipo de contenido te gusta crear?",
    options: [
      { value: "photography", label: "Fotografía" },
      { value: "video", label: "Video / Reels" },
      { value: "digital_art", label: "Arte digital" },
      { value: "music", label: "Música" },
      { value: "writing", label: "Escritura" },
      { value: "other", label: "Otro" },
    ],
    freeTextLabel: "Cuéntanos más sobre tu contenido",
  },
  {
    key: "dedication_time",
    question: "¿Cuánto tiempo podés dedicar a crear?",
    options: [
      { value: "less_1h", label: "Menos de 1 hora" },
      { value: "2_5h", label: "2 a 5 horas" },
      { value: "6_10h", label: "6 a 10 horas" },
      { value: "more_10h", label: "Más de 10 horas" },
    ],
    freeTextLabel: "Contanos tu rutina ideal",
  },
  {
    key: "goal",
    question: "¿Cuál es tu principal objetivo?",
    options: [
      { value: "first_followers", label: "Conseguir mis primeros seguidores" },
      { value: "monetize", label: "Monetizar mi contenido" },
      { value: "community", label: "Construir una comunidad" },
      { value: "sell", label: "Vender packs o productos" },
    ],
    freeTextLabel: "¿Algo más que quieras lograr?",
  },
];

export interface IdeaAnswer {
  question: string;
  option?: string;
  text?: string;
}

interface IdeaStepFormProps {
  aiCase: AiCase;
  baseContext?: string;
  language?: string;
  onComplete: (content: string) => void;
  onExit: () => void;
}

export default function IdeaStepForm({
  aiCase,
  baseContext,
  language = "es",
  onComplete,
  onExit,
}: IdeaStepFormProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { option?: string; text: string }>>({});
  const [content, setContent] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const current = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;
  const currentAnswer = answers[current.key] ?? { text: "" };

  const setOption = (label: string) =>
    setAnswers((prev) => ({ ...prev, [current.key]: { ...(prev[current.key] ?? { text: "" }), option: label } }));

  const setFreeText = (text: string) =>
    setAnswers((prev) => ({ ...prev, [current.key]: { ...(prev[current.key] ?? {}), text } }));

  const handleNext = async () => {
    if (!isLastStep) {
      setStepIndex((i) => i + 1);
      return;
    }

    // Último paso: una sola llamada LLM con todo el historial de respuestas.
    setSubmitting(true);
    try {
      const payloadAnswers: IdeaAnswer[] = STEPS.map((step) => ({
        question: step.key,
        option: answers[step.key]?.option,
        text: answers[step.key]?.text || undefined,
      }));
      const data = await http<AiIdeasResponse>("/ai/onboarding/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case: aiCase,
          stepIndex,
          answers: payloadAnswers,
          baseContext,
        }),
      });
      setContent(data.content ?? "Tu plan está listo.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  if (content) {
    return (
      <div
        className="w-full max-w-2xl mx-auto space-y-6 fade-in animate-in duration-500"
        lang={language}
      >
        <header className="text-center">
          <h2 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">
            Tu plan sugerido por IA
          </h2>
          <p className="text-on-surface-variant mt-2">
            Con base en tus respuestas, este es el plan que la IA propone.
          </p>
        </header>
        <div className="p-6 bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10">
          <p className="whitespace-pre-line text-on-surface leading-relaxed">{content}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button onClick={() => onComplete(content)} className="w-full sm:w-auto">
            Guardar y continuar
          </Button>
          <Button variant="ghost" onClick={() => setContent(null)} className="w-full sm:w-auto">
            Volver a las preguntas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 fade-in animate-in slide-in-from-right-4 duration-500" lang={language}>
      <header className="text-center">
        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
          Paso {stepIndex + 1} de {STEPS.length}
        </p>
        <h2 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">
          {current.question}
        </h2>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {current.options.map((option) => {
          const selected = currentAnswer.option === option.label;
          return (
            <button
              key={option.value}
              type="button"
              data-selected={selected ? "true" : "false"}
              onClick={() => setOption(option.label)}
              className={`p-4 rounded-xl text-left transition-all active:scale-95 font-medium ${
                selected
                  ? "bg-gradient-to-br from-primary to-primary-container text-white shadow-md shadow-primary/10"
                  : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        <Label htmlFor="idea-free-text">{current.freeTextLabel}</Label>
        <Textarea
          id="idea-free-text"
          rows={3}
          value={currentAnswer.text}
          onChange={(e) => setFreeText(e.target.value)}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Button onClick={handleNext} disabled={submitting} className="w-full sm:w-auto">
          {submitting ? "Generando..." : isLastStep ? "Finalizar" : "Siguiente"}
        </Button>
        <div className="flex gap-4">
          {stepIndex > 0 && (
            <Button variant="outline" onClick={handleBack} disabled={submitting} className="w-full sm:w-auto">
              Atrás
            </Button>
          )}
          <Button variant="ghost" onClick={onExit} className="w-full sm:w-auto">
            Volver a redes
          </Button>
        </div>
      </div>
    </div>
  );
}
