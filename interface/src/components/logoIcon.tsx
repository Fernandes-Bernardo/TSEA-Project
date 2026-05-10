import logo from "../assets/logoIcon.svg";

function LogoIcon() {
  return (
    <img 
      src={logo} 
      alt="Logo" 
      className="w-12 h-12 object-contain"
    />
  );
}

export default LogoIcon;