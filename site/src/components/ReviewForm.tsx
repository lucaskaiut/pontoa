import { useState } from "react";
import type { Review } from "../services/ReviewsService";

interface ReviewFormProps {
  appointmentId: number;
  onSubmit: (data: { score: number; comment?: string }) => Promise<Review>;
  onCancel?: () => void;
  loading?: boolean;
}

export function ReviewForm({ appointmentId: _appointmentId, onSubmit, onCancel, loading }: ReviewFormProps) {
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (score === null) {
      setError("Por favor, selecione uma nota");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({ score, comment: comment.trim() || undefined });
      setScore(null);
      setComment("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao enviar avaliação. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          Como foi sua experiência? *
        </label>
        <div className="flex gap-2 justify-center">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setScore(value);
                setError(null);
              }}
              className={`w-12 h-12 rounded-lg font-semibold transition-all ${
                score === value
                  ? "bg-primary text-white scale-110"
                  : "bg-white/10 text-text-secondary hover:bg-white/20"
              }`}
              disabled={submitting || loading}
            >
              {value}
            </button>
          ))}
        </div>
        {error && <p className="text-error text-sm mt-2">{error}</p>}
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-text-primary mb-2">
          Comentário (opcional)
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={1000}
          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 resize-none"
          placeholder="Conte-nos mais sobre sua experiência..."
          disabled={submitting || loading}
        />
        <p className="text-xs text-text-secondary mt-1">{comment.length}/1000 caracteres</p>
      </div>

      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-surface hover:bg-white/10 text-text-primary rounded-xl transition-colors"
            disabled={submitting || loading}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="flex-1 px-4 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={score === null || submitting || loading}
        >
          {submitting ? "Enviando..." : "Enviar Avaliação"}
        </button>
      </div>
    </form>
  );
}

