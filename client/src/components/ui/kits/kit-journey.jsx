// components/kits/kit-journey.jsx
import { ProgressCharacter } from "./progress-character";
import { CheckCircle, Clock, Package, Truck, Home } from "lucide-react";

export function KitJourney({ request, showDetails = false }) {
  const phases = [
    {
      key: "pending",
      label: "Pedido Recebido",
      icon: Clock,
      description: "O seu pedido foi registado no nosso sistema",
      dateField: "requestedAt"
    },
    {
      key: "approved", 
      label: "Aprovado",
      icon: Package,
      description: "Pedido aprovado e kit em preparação",
      dateField: "approvedAt"
    },
    {
      key: "shipped",
      label: "A Caminho",
      icon: Truck, 
      description: "Kit enviado para a sua escola",
      dateField: "shippedAt"
    },
    {
      key: "delivered",
      label: "Entregue",
      icon: CheckCircle,
      description: "Kit recebido e confirmado",
      dateField: "deliveredAt"
    }
  ];

  const currentPhaseIndex = phases.findIndex(phase => phase.key === request.status);
  const progressPercentage = (currentPhaseIndex / (phases.length - 1)) * 100;

  return (
    <div className="w-full">
      {/* Barra de Progresso */}
      <div className="relative mb-8">
        {/* Linha de fundo */}
        <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-200 rounded-full transform -translate-y-1/2"></div>
        
        {/* Linha de progresso */}
        <div 
          className="absolute top-1/2 left-0 h-2 bg-green-500 rounded-full transform -translate-y-1/2 transition-all duration-1000 ease-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>

        {/* Pontos da timeline */}
        <div className="relative flex justify-between">
          {phases.map((phase, index) => {
            const isCompleted = index <= currentPhaseIndex;
            const isCurrent = index === currentPhaseIndex;
            const PhaseIcon = phase.icon;
            const phaseDate = request[phase.dateField];

            return (
              <div key={phase.key} className="flex flex-col items-center">
                {/* Ponto da timeline */}
                <div className={`
                  relative z-10 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center
                  ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
                  ${isCurrent ? 'ring-2 ring-green-400 ring-offset-2' : ''}
                  transition-all duration-300
                `}>
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : (
                    <PhaseIcon className="w-4 h-4 text-gray-600" />
                  )}
                </div>

                {/* Label */}
                <div className="mt-2 text-center">
                  <p className={`text-sm font-medium ${
                    isCompleted ? 'text-green-700' : 'text-gray-500'
                  }`}>
                    {phase.label}
                  </p>
                  
                  {/* Data */}
                  {phaseDate && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(phaseDate).toLocaleDateString('pt-PT')}
                    </p>
                  )}
                </div>

                {/* Descrição (apenas para fase atual) */}
                {showDetails && isCurrent && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-lg text-center">
                    <p className="text-xs text-blue-700">{phase.description}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Personagem animado */}
        <div 
          className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-1000 ease-out"
          style={{ left: `${progressPercentage}%` }}
        >
          <ProgressCharacter status={request.status} currentPhase={currentPhaseIndex} />
        </div>
      </div>

      {/* Detalhes do Status Atual */}
      {showDetails && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
          <h4 className="font-semibold text-lg mb-2">Status Atual</h4>
          <p className="text-gray-700">
            {phases[currentPhaseIndex]?.description}
            {request.status === 'shipped' && request.shippedAt && (
              <span className="block mt-1 text-sm text-blue-600">
                📦 Enviado em: {new Date(request.shippedAt).toLocaleDateString('pt-PT')}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}