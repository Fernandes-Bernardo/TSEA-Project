import { Outlet } from "react-router-dom";
import NavBar from "../components/navBar";

function Admin() {
  return (
    <div>
      <NavBar />
      <Outlet />
    </div>
  );
}

export default Admin;