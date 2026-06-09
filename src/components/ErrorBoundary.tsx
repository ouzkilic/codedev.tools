import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Remount key — when it changes, the boundary resets (e.g. on route change). */
  resetKey?: string;
}

interface State {
  error: Error | null;
}

/**
 * Catches render errors in the subtree and shows a recoverable message instead of
 * unmounting the whole app (which previously left a black screen). Resets when
 * resetKey changes so navigating away from a broken page recovers automatically.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface in the console for debugging; no user data is logged.
    console.error('Tool error:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-10 text-center">
          <h1 className="text-lg font-semibold">Something went wrong</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            This tool hit an unexpected error. Your data stays in your browser — nothing was sent
            anywhere. Try reloading, or pick another tool.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-muted/50"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
