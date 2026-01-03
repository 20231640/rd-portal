import { Sidebar } from "../components/ui/sidebar";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Mail } from "lucide-react";

export default function ContactAdmin() {
  const mailto = "mailto:admin@escola.pt?subject=Contacto%20do%20Professor&body=Olá%20Administrador,%0A%0A[Escreva%20aqui%20a%20sua%20mensagem].";

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl p-8 text-center">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Contactar Administrador</h1>
          <p className="text-muted-foreground mb-6">
            Se tem alguma questão relativa a pastas do Google Drive, formações, ou outra assistência, utilize o botão abaixo para enviar um email ao administrador (será aberto no cliente de email configurado, como Outlook).
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <a href={mailto} className="flex items-center justify-center">
                <Mail className="w-4 h-4 mr-2" />
                Enviar Email via Outlook
              </a>
            </Button>

            <Button variant="outline" size="lg" onClick={() => { navigator.clipboard?.writeText('admin@escola.pt'); alert('Email copiado para a área de transferência'); }}>
              Copiar Email
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}