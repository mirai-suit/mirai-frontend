import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { routes } from "./routes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const router = createBrowserRouter(routes);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
