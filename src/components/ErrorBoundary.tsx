import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  err: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { err: null };

  static getDerivedStateFromError(err: Error): State {
    return { err };
  }

  componentDidCatch(err: Error, info: { componentStack: string }) {
    // eslint-disable-next-line no-console
    console.error("App crashed:", err, info);
  }

  reset = () => {
    try {
      localStorage.removeItem("kuber.finance.v1");
      localStorage.removeItem("kuber.finance.v2");
    } catch {
      /* noop */
    }
    location.reload();
  };

  render() {
    if (this.state.err) {
      return (
        <div className="min-h-screen bg-black text-white grid place-items-center p-6">
          <div className="max-w-md w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl p-6">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[#737373] font-medium">
              Something broke
            </div>
            <div className="text-[15px] font-medium mt-1">Couldn't render the dashboard</div>
            <pre className="mt-3 p-3 rounded-lg bg-black/60 border border-[#1F1F1F] text-[11px] text-[#A3A3A3] overflow-auto whitespace-pre-wrap">
              {this.state.err.message}
            </pre>
            <button
              onClick={this.reset}
              className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white text-black text-[13px] font-medium hover:bg-white/90"
            >
              Reset & reload
            </button>
            <div className="text-[11px] text-[#737373] mt-2">
              Clears local data and reloads with fresh sample data.
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
