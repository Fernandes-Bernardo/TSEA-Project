import { Outlet } from "react-router-dom";
import NavBar from "../components/navBar";

function Almoxarife() {
  return (
    <div>
      <NavBar />
      <Outlet />
    </div>
  );
}

export default Almoxarife;
