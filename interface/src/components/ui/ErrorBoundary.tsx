import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error("[ErrorBoundary]", error, info);
  }

  reset = () => {
    this.setState({ hasError: false });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#BEBEBE] p-6">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-red-500 mx-auto flex items-center justify-center mb-4">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M4.93 19h14.14a2 2 0 001.74-3l-7.07-12a2 2 0 00-3.48 0l-7.07 12a2 2 0 001.74 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-primary mb-2">Algo deu errado</h1>
            <p className="text-gray-600 text-sm mb-6">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            <button
              onClick={this.reset}
              className="bg-highlight text-white px-6 py-2 rounded-md hover:bg-[#A06630] transition-all duration-200 active:scale-95 font-medium"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
