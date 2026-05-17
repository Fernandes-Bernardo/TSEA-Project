import LoginComp from "../components/login/loginComp";
import logoTSEA from "../assets/logoTSEA.png";
import logoIcon from "../assets/logoIcon.svg";

function Login() {
  const handleLogin = (employeeId: string, senha: string) => {
    console.log(employeeId, senha);
    alert(`Bem-vindo, ${employeeId}! (simulação)`);
    // Redirecionar para dashboard após login
    // window.location.href = "/";
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-8"
      style={{ backgroundColor: "#2C4F55" }} 
    >
    
      <div className="bg-white rounded-lg shadow-lg p-10 w-full max-w-lg">
       
        <div className="flex justify-center mb-8">
          <img src={logoTSEA} alt="TSEA" className="h-24 w-auto" />
        </div>

        <LoginComp onLogin={handleLogin} />
      </div>

  
      <div className="flex items-center justify-center gap-2">
        <span className="text-xl font-bold" style={{ color: "#C48248" }}>
          Zaiko
        </span>
        <img
          src={logoIcon}
          alt="Zaiko icon"
          className="w-8 h-8"
          style={{
            filter:
              "invert(42%) sepia(93%) saturate(1352%) hue-rotate(338deg) brightness(96%) contrast(91%)",
          }}
        />
      </div>
    </div>
  );
}

export default Login;