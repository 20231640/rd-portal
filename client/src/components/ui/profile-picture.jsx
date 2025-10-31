import { useState, useRef } from "react";
import { Camera, Upload, X, User } from "lucide-react";
import { Button } from "./button";

export default function ProfilePicture({ photo, onPhotoUpdate, className = "" }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de ficheiro
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um ficheiro de imagem.');
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter menos de 5MB.');
      return;
    }

    setIsUploading(true);

    try {
      // Simular upload - num caso real, aqui farias upload para um servidor
      const reader = new FileReader();
      reader.onload = (e) => {
        // Adicionar um pequeno delay para simular processamento
        setTimeout(() => {
          onPhotoUpdate(e.target.result);
          setIsUploading(false);
        }, 500);
      };
      reader.onerror = () => {
        alert('Erro ao carregar a imagem.');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      alert('Erro ao processar a imagem.');
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    if (window.confirm('Tem a certeza que quer remover a foto de perfil?')) {
      onPhotoUpdate(null);
    }
  };

  const handleContainerClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Container da Foto */}
      <div
        className={`
          relative w-32 h-32 rounded-full border-4 border-background overflow-hidden cursor-pointer
          transition-all duration-300 group mx-auto
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
        `}
        onMouseEnter={() => !isUploading && setIsHovered(true)}
        onMouseLeave={() => !isUploading && setIsHovered(false)}
        onClick={handleContainerClick}
      >
        {photo ? (
          <>
            <img
              src={photo}
              alt="Foto de perfil"
              className="w-full h-full object-cover"
            />
            
            {/* Overlay no hover */}
            {isHovered && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Upload className="w-6 h-6 text-white" />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-1"></div>
                <span className="text-xs text-primary">A carregar...</span>
              </div>
            ) : (
              <User className="w-12 h-12 text-primary" />
            )}
          </div>
        )}
      </div>

      {/* Botão para remover foto se existir */}
      {photo && isHovered && !isUploading && (
        <Button
          variant="destructive"
          size="sm"
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full p-0"
          onClick={(e) => {
            e.stopPropagation();
            handleRemovePhoto();
          }}
        >
          <X className="w-3 h-3" />
        </Button>
      )}

      {/* Instruções */}
      {!photo && !isUploading && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          Clique para adicionar foto
        </p>
      )}

      {/* Input de ficheiro escondido */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Informações de formato */}
      <div className="text-xs text-muted-foreground text-center mt-1">
        PNG, JPG • Max 5MB
      </div>
    </div>
  );
}