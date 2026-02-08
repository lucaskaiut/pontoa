import { ReviewForm } from "./ReviewForm";
import type { Review } from "../services/ReviewsService";

interface ReviewModalProps {
  appointmentId: number;
  onSubmit: (data: { score: number; comment?: string }) => Promise<Review>;
  onClose: () => void;
  loading?: boolean;
}

export function ReviewModal({ appointmentId, onSubmit, onClose, loading }: ReviewModalProps) {
  async function handleSubmit(data: { score: number; comment?: string }) {
    const review = await onSubmit(data);
    onClose();
    return review;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface backdrop-blur-sm rounded-2xl p-6 border border-white/10 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">Avaliar Atendimento</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <ReviewForm
          appointmentId={appointmentId}
          onSubmit={handleSubmit}
          onCancel={onClose}
          loading={loading}
        />
      </div>
    </div>
  );
}

