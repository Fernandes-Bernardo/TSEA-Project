import { Outlet } from "react-router-dom";
import NavBar from "../components/navBar";

function Home() {
  return (
    <div>
      <NavBar />
      <Outlet />
    </div>
  );
}

export default Home;
