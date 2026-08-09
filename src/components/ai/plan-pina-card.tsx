"use client";

// Sección "Tu plan Pina" del dashboard. REQ-FE-6.
// Visible únicamente cuando el creador aceptó el plan de IA (aiPlanAccepted=true).

import React from "react";

interface PlanPinaCardProps {
  aiSummary?: string | null;
  aiSuggestedNiche?: string | null;
  aiSuggestedBio?: string | null;
  aiSuggestedGoal?: { title: string; amount: number; currency: string } | null;
  aiSuggestedPlan?: string | null;
}

export default function PlanPinaCard({
  aiSummary,
  aiSuggestedNiche,
  aiSuggestedBio,
  aiSuggestedGoal,
  aiSuggestedPlan,
}: PlanPinaCardProps) {
  const planSteps = (aiSuggestedPlan ?? "").split("\n").map((l) => l.trim()).filter(Boolean);

  return (
    <section
      aria-label="Tu plan Pina"
      className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl p-6 md:p-8 ring-1 ring-primary/20"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
        </div>
        <div>
          <h3 className="text-xl font-headline font-black text-on-surface">Tu plan Pina</h3>
          <p className="text-xs text-on-surface-variant font-medium">Generado con IA a partir de tu perfil</p>
        </div>
      </div>

      {aiSummary && (
        <p className="text-sm text-on-surface-variant leading-relaxed mb-6 max-w-2xl">{aiSummary}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {aiSuggestedNiche && (
          <div className="p-4 bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10">
            <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Nicho</span>
            <span className="text-sm font-bold text-on-surface">{aiSuggestedNiche}</span>
            {aiSuggestedBio && (
              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">{aiSuggestedBio}</p>
            )}
          </div>
        )}

        {aiSuggestedGoal && (
          <div className="p-4 bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10">
            <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Objetivo</span>
            <span className="text-sm font-bold text-on-surface">{aiSuggestedGoal.title}</span>
            <p className="text-xs text-on-surface-variant mt-2">
              {aiSuggestedGoal.amount.toLocaleString('es-AR')} {aiSuggestedGoal.currency}
            </p>
          </div>
        )}

        {planSteps.length > 0 && (
          <div className="p-4 bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10">
            <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Próximos pasos</span>
            <ul className="space-y-1.5">
              {planSteps.map((step, index) => (
                <li key={`${index}-${step}`} className="text-xs text-on-surface flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
