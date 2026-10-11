import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[QuickPal ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleResetCache = () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('Could not clear localStorage', e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-gray-800 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 mx-auto flex items-center justify-center text-3xl">
              ⚡
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100">
              QuickPal Grocery Store
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
              We encountered a minor glitch while loading. Tap below to reload fresh grocery catalog data.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-2xl shadow-lg transition-transform active:scale-95"
              >
                Reload Store Catalog
              </button>
              <button
                onClick={this.handleResetCache}
                className="w-full py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold text-xs rounded-2xl transition-colors"
              >
                Clear Cache & Restart
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
