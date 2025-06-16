import { useCustomerClient } from '@/lib/customer-client';
import myTokenCache from '@/app/api/token-cache';
import setLogin from '@/app/actions/set-login';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useResponsiveToast } from '@/hooks/use-responsive-toast';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/auth-store';

export function useCustomer() {
  const { customerClient } = useCustomerClient();
  const { toast } = useResponsiveToast();
  const { login, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: customerData, isLoading } = useQuery({
    queryKey: ['customer'],
    queryFn: async () => {
      try {
        const response = await customerClient.getMe();
        return response;
      } catch (error) {
        console.error('Error fetching customer data:', error);
        return null;
      }
    },
    enabled: useAuthStore.getState().isLoggedIn,
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const customer = await customerClient.login(email, password);

      if (myTokenCache.refreshToken) {
        await setLogin(myTokenCache.refreshToken);
      }

      return customer;
    },
    onSuccess: () => {
      login();
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      toast({
        description: 'Successfully logged in',
        title: 'Welcome back!',
      });
      router.push('/');
    },
    onError: (error) => {
      toast({
        description: error instanceof Error ? error.message : 'Failed to log in',
        title: 'Login error',
        variant: 'destructive',
      });
    },
  });

  const reLoginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const customer = await customerClient.login(email, password);

      if (myTokenCache.refreshToken) {
        await setLogin(myTokenCache.refreshToken);
      }

      return customer;
    },
    onSuccess: () => {
      login();
    },
    onError: (error) => {
      toast({
        description: error instanceof Error ? error.message : 'Failed to log in',
        title: 'Login error',
        variant: 'destructive',
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (customerParams: any) => {
      const result = await customerClient.register(customerParams);

      if (result) {
        await customerClient.login(customerParams.email, customerParams.password);

        if (myTokenCache.refreshToken) {
          await setLogin(myTokenCache.refreshToken);
        }
      }

      return result;
    },
    onSuccess: () => {
      login();
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      toast({
        description: 'Your account has been created successfully',
        title: 'Success!',
      });
      router.push('/');
    },
    onError: (error) => {
      toast({
        description: error instanceof Error ? error.message : 'Registration failed. Email may already be in use.',
        title: 'Registration error',
        variant: 'destructive',
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await logout();
    },
    onSuccess: () => {
      queryClient.clear();
      setTimeout(() => {
        router.push('/');
      }, 100);
    },
  });

  return {
    customer: customerData,
    isLoading,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    reLogin: reLoginMutation.mutate,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,
  };
}
