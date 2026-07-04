import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QueryErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function QueryErrorState({
  message = "Не удалось загрузить данные",
  onRetry,
}: QueryErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 px-4 text-center">
      <AlertCircle className="h-8 w-8 text-destructive/70" />
      <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="rounded-xl" onClick={onRetry}>
          Повторить
        </Button>
      )}
    </div>
  );
}
