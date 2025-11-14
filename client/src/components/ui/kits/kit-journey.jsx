// components/kits/progress-character.jsx
import { useState, useEffect } from "react";
import { Package, Truck, CheckCircle, Clock } from "lucide-react";

export function ProgressCharacter({ status, currentPhase, size = "md" }) {
  const [animation, setAnimation] = useState("idle");
  
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-14 h-14", 
    lg: "w-20 h-20"
  };

  const phases = {
    pending: {
      icon: Clock,
      label: "Aguardando Aprovação",
      color: "text-yellow-600",
      bgGradient: "bg-gradient-to-br from-yellow-400 to-yellow-500",
    },
    approved: {
      icon: Package,
      label: "Kit Preparado", 
      color: "text-blue-600",
      bgGradient: "bg-gradient-to-br from-blue-400 to-blue-600",
    },
    shipped: {
      icon: Truck,
      label: "A Caminho",
      color: "text-orange-600",
      bgGradient: "bg-gradient-to-br from-orange-400 to-orange-500",
    },
    delivered: {
      icon: CheckCircle,
      label: "Entregue",
      color: "text-green-600",
      bgGradient: "bg-gradient-to-br from-green-400 to-green-500",
    }
  };

  const currentPhaseConfig = phases[status] || phases.pending;

  // Animações melhoradas
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
        return "animate-pulse"; // Usando pulse como fallback
      case "celebrate":
        return "animate-bounce";
      default:
        return "";
    }
  };

  const Icon = currentPhaseConfig.icon;

  return (
    <div className="relative">
      {/* Personagem Principal com gradiente */}
      <div className={`
        relative z-10 rounded-full border-4 border-white 
        ${currentPhaseConfig.bgGradient}
        flex items-center justify-center shadow-2xl ${getAnimationClass()}
        transition-all duration-500 ease-in-out hover:scale-110
        ${sizeClasses[size]}
      `}>
        <Icon className="w-1/2 h-1/2 text-white" />
      </div>
      
      {/* Efeitos especiais */}
      {status === 'delivered' && (
        <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75 -z-10"></div>
      )}
    </div>
  );
}