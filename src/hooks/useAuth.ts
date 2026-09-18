import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import {
  login,
  getMe,
  logout as logoutApi,
  LoginRequest,
  User,
} from "../api/auth";
import { setUser, clearUser } from "../app/store/authSlice";
import { RootState } from "../app/store";

export const useAuth = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  // Get user from Redux
  const user = useSelector((state: RootState) => state.auth.user);

  // LOGIN
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (data) => {
      // Save user in Redux
      dispatch(setUser(data.user));

      // Also put it in React Query cache
      queryClient.setQueryData(["auth", "me"], data.user);
    },
  });

  // GET CURRENT USER (/auth/me)
  const {
    isLoading: isLoadingUser,
    isError: isUserError,
    error: userError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const userData = await getMe();
      dispatch(setUser(userData)); // save to Redux
      return userData;
    },
    enabled: false, // we will call it manually on app start
    retry: false,
  });

  // LOGOUT
  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      dispatch(clearUser());
      queryClient.removeQueries({ queryKey: ["auth", "me"] });
    },
    onError: () => {
      // Even if the network call fails, clear client-side state
      // so the user isn't stuck looking "logged in" in the UI.
      dispatch(clearUser());
      queryClient.removeQueries({ queryKey: ["auth", "me"] });
    },
  });

  return {
    // Login
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,

    // User
    user,
    isLoadingUser,
    isUserError,
    userError,
    refetchUser,

    // Logout
    logout: logoutMutation.mutate,
    logoutAsync: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
};
