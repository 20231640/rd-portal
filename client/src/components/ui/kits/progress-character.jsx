// components/kits/progress-character.jsx
import { useState, useEffect } from "react";
import { Package, User, Truck, Home, CheckCircle, Clock, AlertCircle } from "lucide-react";

export function ProgressCharacter({ status, currentPhase, size = "md" }) {
  const [animation, setAnimation] = useState("idle");
  
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  const phases = {
    pending: {
      icon: Clock,
      label: "Aguardando Aprovação",
      color: "text-yellow-500",
      bgColor: "bg-yellow-100",
      position: "left-0",
      description: "O seu pedido está na fila de aprovação"
    },
    approved: {
      icon: Package,
      label: "Kit Preparado",
      color: "text-blue-500",
      bgColor: "bg-blue-100", 
      position: "left-1/3",
      description: "Kit embalado e pronto para envio"
    },
    shipped: {
      icon: Truck,
      label: "A Caminho",
      color: "text-orange-500",
      bgColor: "bg-orange-100",
      position: "left-2/3",
      description: "A caminho da sua escola"
    },
    delivered: {
      icon: CheckCircle,
      label: "Entregue",
      color: "text-green-500",
      bgColor: "bg-green-100",
      position: "left-full",
      description: "Kit entregue com sucesso!"
    }
  };

  const currentPhaseConfig = phases[status] || phases.pending;

  // Animações baseadas no status
  useEffect(() => {
    switch(status) {
      case 'pending':
        setAnimation("bounce");
        break;
      case 'approved':
        setAnimation("pulse");
        break;
      case 'shipped':
        setAnimation("move");
        break;
      case 'delivered':
        setAnimation("celebrate");
        break;
      default:
        setAnimation("idle");
    }
  }, [status]);

  const getAnimationClass = () => {
    switch(animation) {
      case "bounce":
        return "animate-bounce";
      case "pulse":
        return "animate-pulse";
      case "move":
        return "animate-moveRight";
      case "celebrate":
        return "animate-bounce";
      default:
        return "";
    }
  };

  const Icon = currentPhaseConfig.icon;

  return (
    <div className="relative">
      {/* Personagem Principal */}
      <div className={`
        relative z-10 ${sizeClasses[size]} rounded-full border-2 border-white 
        ${currentPhaseConfig.bgColor} ${currentPhaseConfig.color}
        flex items-center justify-center shadow-lg ${getAnimationClass()}
        transition-all duration-500 ease-in-out
      `}>
        <Icon className="w-1/2 h-1/2" />
      </div>
      
      {/* Efeito de brilho para delivered */}
      {status === 'delivered' && (
        <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></div>
      )}
    </div>
  );
}