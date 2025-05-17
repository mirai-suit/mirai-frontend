import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

export default function DashboardLayout() {
  //   const { isSidebarCollapsed, setIsMobileSidebarOpen, isMobileSidebarOpen } =
  //     useLayoutStore((s) => s);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  //   const { isAuthenticated, user } = useAuthStore((state) => state);
  const [isMobile, setIsMobile] = useState(false);

  //   useEffect(() => {
  //     if (pathname === "/u" && isAuthenticated) {
  //       navigate("/u/" + user?.id);
  //     }
  //   }, [pathname, navigate]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // lg breakpoint
        setIsMobile(false);
      } else {
        setIsMobile(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="">
      {/* <TopNavbar onMenuToggle={() => setIsMobileSidebarOpen(true)} />
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isMobile={isMobile}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      /> */}
      <main
      // className={`px-4 py-3 flex-grow transition-all duration-300 ${
      //   isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      // }`}
      >
        <Outlet />
      </main>
    </div>
  );
}
