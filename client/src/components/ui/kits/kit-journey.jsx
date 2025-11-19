// components/ui/kits/kit-journey.jsx - VERSÃO CORRIGIDA
import { CheckCircle, Clock, Package, Truck, Home, AlertCircle } from "lucide-react";

export function KitJourney({ request, showDetails = true }) {
  const steps = [
    { key: 'requested', label: 'Pedido Recebido', icon: Package, date: request.requestedAt, completed: true },
    { key: 'approved', label: 'Aprovado', icon: CheckCircle, date: request.approvedAt, completed: ['approved', 'shipped', 'delivered'].includes(request.status) },
    { key: 'shipped', label: 'A Caminho', icon: Truck, date: request.shippedAt, completed: ['shipped', 'delivered'].includes(request.status) },
    { key: 'delivered', label: 'Entregue', icon: Home, date: request.deliveredAt, completed: request.status === 'delivered' },
  ];

  return (
    <div className="relative px-2"> {/* Add padding for line overflow safety */}
      {/* LINE: continuous, underneath all steps */}
      <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-300 z-0" style={{top: '1.5rem'}} />
      <div className="flex justify-between items-center relative z-10" style={{minHeight: '3.5rem'}}>
        {steps.map((step, idx) => {
          const Icon = step.icon;
          // active = last completed
          const isActive = step.completed && (idx === steps.findIndex(s => !s.completed) - 1 || (steps.every(s => s.completed) && idx === steps.length-1));
          // Colors
          const baseColor = step.completed ? 'bg-[hsl(76,49%,52%)] border-[hsl(76,49%,52%)]' : 'bg-gray-200 border-gray-400';
          const iconColor = step.completed ? 'text-white' : 'text-gray-500';
          return (
            <div key={step.key} className="flex flex-col items-center flex-1 group">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${baseColor}`}
                style={{marginBottom:'0.5rem', zIndex:2}}>
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </div>
              <div className="mt-1 text-center flex flex-col gap-1">
                <span className={`text-xs font-semibold leading-none ${step.completed ? 'text-[hsl(76,49%,52%)]' : 'text-gray-500'}`}>{step.label}</span>
                {showDetails && step.date && <span className="text-[11px] text-gray-400">{new Date(step.date).toLocaleDateString('pt-PT')}</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}