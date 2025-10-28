// components/ui/feature-card.tsx
import { ReactNode } from "react";
import { Card } from "./card";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}
export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="text-center p-8 hover:-translate-y-2">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6 mx-auto">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-muted-foreground text-lg">{description}</p>
    </Card>
  );
}