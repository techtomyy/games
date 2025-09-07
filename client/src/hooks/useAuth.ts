import { useQuery } from "@tanstack/react-query";
import type { User, UserSubscription } from "@shared/schema";

interface AuthUser extends User {
  subscription?: UserSubscription;
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<AuthUser>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
