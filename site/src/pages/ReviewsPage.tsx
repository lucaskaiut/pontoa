import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ReviewsService, type Review } from "../services/ReviewsService";
import { CustomersService } from "../services/CustomersService";
import { Header } from "../components/Header";
import { ReviewForm } from "../components/ReviewForm";
import type { Scheduling } from "../types";

function ReviewsPage() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [schedulings, setSchedulings] = useState<Scheduling[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScheduling, setSelectedScheduling] = useState<Scheduling | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/login");
      return;
    }

    loadData();
  }, [navigate]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const customer = await CustomersService.getMe();
      const reviewsData = await ReviewsService.getMyReviews();
      const schedulingsData = await CustomersService.getMySchedulings(customer.email);
      
      const completedSchedulings = schedulingsData.filter(s => s.status === 'confirmed' || s.status === 'completed');
      const reviewedAppointmentIds = reviewsData.map(r => r.appointment_id);
      const schedulingsWithoutReview = completedSchedulings.filter(s => !reviewedAppointmentIds.includes(s.id));

      setReviews(reviewsData);
      setSchedulings(schedulingsWithoutReview);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Erro ao carregar suas avaliações. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReviewSubmit(data: { score: number; comment?: string }): Promise<Review> {
    if (!selectedScheduling) {
      throw new Error("Agendamento não selecionado");
    }

    setSubmittingReview(true);
    try {
      const review = await ReviewsService.createReview({
        appointment_id: selectedScheduling.id,
        score: data.score,
        comment: data.comment,
      });

      setShowReviewForm(false);
      setSelectedScheduling(null);
      await loadData();
      
      return review;
    } catch (err) {
      console.error("Erro ao enviar avaliação:", err);
      toast.error("Erro ao enviar avaliação. Tente novamente.");
      throw err;
    } finally {
      setSubmittingReview(false);
    }
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    date.setHours(date.getHours() + 3);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }


  function handleCreateReview(scheduling: Scheduling) {
    setSelectedScheduling(scheduling);
    setShowReviewForm(true);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBackButton onBack={() => navigate("/minhas-informacoes")} />
        <div className="flex items-center justify-center" style={{ height: "calc(100vh - 4rem)" }}>
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-text-secondary">Carregando suas avaliações...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBackButton onBack={() => navigate("/minhas-informacoes")} />
        <div className="flex items-center justify-center" style={{ height: "calc(100vh - 4rem)" }}>
          <div className="text-center">
            <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-text-primary mb-4">{error}</p>
            <button
              onClick={loadData}
              className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton onBack={() => navigate("/minhas-informacoes")} />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">Minhas Avaliações</h1>
          <p className="text-text-secondary text-sm">Avalie seus atendimentos e veja suas avaliações anteriores</p>
        </div>

        {schedulings.length > 0 && (
          <div className="bg-surface backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Avaliar Atendimentos</h2>
            <div className="space-y-4">
              {schedulings.map((scheduling) => (
                <div
                  key={scheduling.id}
                  className="bg-accent-soft border border-white/60 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-text-primary font-medium">{scheduling.service.name}</h3>
                    <p className="text-text-secondary text-sm">com {scheduling.user.name}</p>
                    <p className="text-text-secondary text-sm mt-1">{formatDate(scheduling.date)}</p>
                  </div>
                  <button
                    onClick={() => handleCreateReview(scheduling)}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm rounded-lg transition-colors"
                  >
                    Avaliar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-surface backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-text-primary mb-6">Minhas Avaliações</h2>

          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-accent-soft rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <p className="text-text-secondary text-sm">Você ainda não possui avaliações</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-accent-soft border border-white/60 rounded-xl p-4"
                >
                  <div className="flex items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-text-primary">{review.score}</div>
                      <div>
                        {review.appointment?.service && (
                          <h3 className="text-text-primary font-medium">{review.appointment.service.name}</h3>
                        )}
                        {review.appointment?.user && (
                          <p className="text-text-secondary text-sm">com {review.appointment.user.name}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {review.comment && (
                    <p className="text-text-secondary text-sm mb-3">{review.comment}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <p className="text-text-secondary text-xs">{formatDate(review.created_at)}</p>
                    {review.google_review_link && (
                      <a
                        href={review.google_review_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary text-sm rounded-lg transition-colors"
                      >
                        Avaliar no Google
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showReviewForm && selectedScheduling && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-surface backdrop-blur-sm rounded-2xl p-6 border border-white/10 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-text-primary">Avaliar Atendimento</h2>
                <button
                  onClick={() => {
                    setShowReviewForm(false);
                    setSelectedScheduling(null);
                  }}
                  className="text-text-secondary hover:text-text-primary"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ReviewForm
                appointmentId={selectedScheduling.id}
                onSubmit={handleReviewSubmit}
                onCancel={() => {
                  setShowReviewForm(false);
                  setSelectedScheduling(null);
                }}
                loading={submittingReview}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewsPage;

