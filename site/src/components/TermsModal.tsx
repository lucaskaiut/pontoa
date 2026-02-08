interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  termsHtml: string | null;
}

export function TermsModal({ isOpen, onClose, termsHtml }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-white/10">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-text-primary">Termos e Condições</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors p-2 hover:bg-white/5 rounded-lg"
            aria-label="Fechar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {termsHtml ? (
            <div 
              className="prose prose-invert max-w-none text-text-primary"
              dangerouslySetInnerHTML={{ __html: termsHtml }}
              style={{
                color: 'inherit',
              }}
            />
          ) : (
            <p className="text-text-secondary">Nenhum termo e condição cadastrado.</p>
          )}
        </div>
        <div className="p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full py-3 bg-primary hover:bg-primary/80 text-white font-semibold rounded-xl transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

