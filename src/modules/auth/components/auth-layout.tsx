import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

export default function AuthLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname === "/auth") {
      navigate("/auth/login");
    }
  }, [pathname, navigate]);

  return (
    <div>
      <Outlet />
    </div>
  );
}
