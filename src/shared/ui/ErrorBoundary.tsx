"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  title?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("UI error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 px-4 text-center">
          <h2 className="text-lg font-semibold">
            {this.props.title ?? "Что-то пошло не так"}
          </h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Произошла ошибка при отображении страницы. Попробуйте обновить или
            вернуться назад.
          </p>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => this.setState({ hasError: false })}
          >
            Попробовать снова
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
