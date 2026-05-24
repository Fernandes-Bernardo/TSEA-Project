function MonitoramentoSensor() {
  return (
    <div className="min-h-screen p-6 animate-fade-in" style={{ backgroundColor: "#BEBEBE" }}>
      <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
        <header>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Monitoramento de sensor</h1>
          <p className="text-gray-700 text-sm">Telemetria em tempo real dos sensores do depósito.</p>
        </header>

        <div className="bg-[#D9D9D9] rounded-2xl p-12 border-2 border-primary shadow-md text-center animate-slide-up">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-highlight/20 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-highlight flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-primary mb-1">Em breve</h3>
          <p className="text-gray-600">O painel de monitoramento de sensores está em desenvolvimento.</p>
        </div>
      </div>
    </div>
  );
}

export default MonitoramentoSensor;
