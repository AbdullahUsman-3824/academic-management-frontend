import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { store } from "../store";
import { ReactNode, useEffect } from "react";
import { setUnauthorizedHandler } from "../../api/client";
import { clearUser } from "../store/authSlice";
import AuthInitializer from "./AuthInitializer";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface AppProvidersProps {
  children: ReactNode;
}

const AppProviders = ({ children }: AppProvidersProps) => {
  useEffect(() => {
    setUnauthorizedHandler(() => {
      // Session expired: drop the user (ProtectedRoute redirects to /login)
      // and wipe cached data so the next login never sees stale student data.
      if (store.getState().auth.user) {
        store.dispatch(clearUser());
        queryClient.clear();
      }
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthInitializer>
          {children}
        </AuthInitializer>
      </QueryClientProvider>
    </Provider>
  );
};

export default AppProviders;