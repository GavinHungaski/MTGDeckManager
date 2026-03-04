import { Outlet } from "react-router";
import Navbar from "./components/Navbar/Navbar";

export default function Layout() {
  return (
    <div className="app-layout">
      <Navbar />
      <Outlet />
    </div>
  );
}