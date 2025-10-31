import { useState } from "react";
import { Star, X } from "lucide-react";
import { Button } from "./button";

export function CompleteTrainingModal({ training, onClose, onComplete }) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Por favor, avalie a sessão com 1-5 estrelas");
      return;
    }

    setLoading(true);
    try {
      await onComplete(training.id, { 
        adminRating: rating, 
        feedback: feedback 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg w-96 border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Concluir Sessão</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Avaliação da Sessão *</label>
            <div className="flex gap-1 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1 transition-transform hover:scale-110 ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  <Star className="w-8 h-8 fill-current" />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-1">
              {rating > 0 ? `${rating} estrela${rating > 1 ? 's' : ''}` : 'Seleciona 1-5 estrelas'}
            </p>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Feedback (opcional)</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              rows="3"
              placeholder="Comentários sobre a sessão..."
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading || rating === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? "A gerar..." : "✅ Gerar Certificado"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}