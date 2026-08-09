"use client";

// Tarjetas editables de sugerencias IA (caso A). REQ-FE-4.
// - Cada sugerencia (nicho, bio, objetivo, plan) es editable antes de guardar.
// - "Regenerar" respeta el límite diario (429 → mensaje, sin reintento automático).
// - "Guardar" hace PATCH /auth/profile con los valores editados y aiPlanAccepted=true.

import React, { useState } from "react";
import { http } from "@/lib/http-client";
import { updateAuthUser, type User, type SocialLink } from "@/store/use-auth-store";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AiSuggestion } from "@/lib/ai-types";

export interface RegenerateResult {
  limited: boolean;
  message?: string;
  suggestions?: AiSuggestion;
}

interface AiResultsCardProps {
  suggestions: AiSuggestion;
  language?: string;
  socialLinks?: SocialLink[];
  onRegenerate: () => Promise<RegenerateResult>;
  onSaved: () => void;
}

export default function AiResultsCard({
  suggestions,
  language = "es",
  socialLinks,
  onRegenerate,
  onSaved,
}: AiResultsCardProps) {
  const { toast } = useToast();
  const [niche, setNiche] = useState(suggestions.suggestedNiche);
  const [bio, setBio] = useState(suggestions.suggestedBio);
  const [goalTitle, setGoalTitle] = useState(suggestions.suggestedGoal.title);
  const [goalAmount, setGoalAmount] = useState(suggestions.suggestedGoal.amount);
  const [planText, setPlanText] = useState(suggestions.suggestedPlan.join("\n"));
  const [regenerating, setRegenerating] = useState(false);
  const [limitMessage, setLimitMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleRegenerate = async () => {
    setRegenerating(true);
    setLimitMessage(null);
    try {
      const result = await onRegenerate();
      if (result.limited) {
        setLimitMessage(result.message ?? "Llegaste al límite diario de generaciones con IA");
        return;
      }
      if (result.suggestions) {
        setNiche(result.suggestions.suggestedNiche);
        setBio(result.suggestions.suggestedBio);
        setGoalTitle(result.suggestions.suggestedGoal.title);
        setGoalAmount(result.suggestions.suggestedGoal.amount);
        setPlanText(result.suggestions.suggestedPlan.join("\n"));
      }
    } finally {
      setRegenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const planLines = planText.split("\n").map((l) => l.trim()).filter(Boolean);
      const summary = `Creadora enfocada en ${niche}. Objetivo: ${goalTitle} (${goalAmount} ARS).`;
      const updatedUser = await http<User>("/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          socialLinks,
          aiSummary: summary,
          aiSuggestedNiche: niche,
          aiSuggestedBio: bio,
          aiSuggestedGoal: { title: goalTitle, amount: goalAmount, currency: "ARS" },
          aiSuggestedPlan: planLines.join("\n"),
          aiPlanAccepted: true,
        }),
      });
      updateAuthUser(updatedUser);
      toast({ title: "¡Plan guardado!", description: "Tu plan Pina quedó actualizado." });
      onSaved();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al guardar tu plan";
      toast({ variant: "destructive", title: "Oops!", description: message });
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 fade-in animate-in slide-in-from-right-4 duration-500" lang={language}>
      <header className="text-center mb-4">
        <h2 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">
          Tu plan sugerido por IA
        </h2>
        <p className="text-on-surface-variant text-lg mt-2">
          Edita cada sugerencia y guarda tu plan cuando esté listo.
        </p>
      </header>

      {limitMessage && (
        <div
          role="alert"
          className="p-4 bg-error/10 text-error rounded-xl text-sm font-semibold flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">timer</span>
          {limitMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="ai-niche">Nicho</Label>
          <Input id="ai-niche" value={niche} onChange={(e) => setNiche(e.target.value)} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="ai-bio">Biografía</Label>
          <Textarea id="ai-bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ai-goal">Objetivo</Label>
          <Input id="ai-goal" value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ai-goal-amount">Monto (ARS)</Label>
          <Input
            id="ai-goal-amount"
            type="number"
            min={0}
            value={goalAmount}
            onChange={(e) => setGoalAmount(Number(e.target.value))}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="ai-plan">Plan (un paso por línea)</Label>
          <Textarea id="ai-plan" rows={5} value={planText} onChange={(e) => setPlanText(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
        <Button onClick={handleSave} disabled={saving || regenerating} className="w-full sm:w-auto">
          {saving ? "Guardando..." : "Guardar plan"}
        </Button>
        <Button
          variant="outline"
          onClick={handleRegenerate}
          disabled={regenerating || saving}
          className="w-full sm:w-auto"
        >
          {regenerating ? "Regenerando..." : "Regenerar con IA"}
        </Button>
      </div>
    </div>
  );
}
