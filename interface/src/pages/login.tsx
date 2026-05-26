import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginComp from "../components/login/loginComp";
import logoTSEA from "../assets/logoTSEA.png";
import logoIcon from "../assets/logoIcon.svg";
import { homePathForRole, login } from "../services/auth";

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (employeeId: string, senha: string) => {
    setLoading(true);
    try {
      const id = Number(employeeId);
      if (!Number.isFinite(id)) {
        console.error("[login] employeeId não numérico:", employeeId);
        return;
      }
      const user = await login(id, senha);
      navigate(homePathForRole(user.role));
    } catch (err) {
      console.error("[login] falha:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-8"
      style={{ backgroundColor: "#2C4F55" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-lg animate-scale-in">
        <div className="flex justify-center mb-8">
          <img src={logoTSEA} alt="TSEA" className="h-24 w-auto" />
        </div>

        <LoginComp onLogin={handleLogin} loading={loading} />
      </div>

      <div className="flex items-center justify-center gap-2 animate-fade-in">
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
