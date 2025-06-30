// components/ui/Skeleton.tsx
export function Skeleton({ className = '' }: { className?: string }) {
  // Ensure any rounding/size you pass via className is applied
  return <div className={`skeleton ${className}`} />;
}