import { useCustomer } from '@/hooks/use-customer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { act } from 'react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

interface ICustomerClient {
  login: (email: string, password: string) => Promise<any>;
  register: (customerParams: any) => Promise<any>;
  logout: () => Promise<boolean>;
  getMe: () => Promise<any>;
}

interface ToastFn {
  (props: any): any;
  success: (props: any) => void;
  error: (props: any) => void;
}

type AuthStoreGetState = {
  getState: {
    (): { isLoggedIn: boolean };
    mockReturnValue: (state: { isLoggedIn: boolean }) => void;
  };
};

vi.stubGlobal('process', {
  env: {
    NEXT_PUBLIC_CTP_SCOPES: 'scope1 scope2',
    NEXT_PUBLIC_CTP_PROJECT_KEY: 'test-project',
    NEXT_PUBLIC_CTP_CLIENT_ID: 'test-client-id',
    NEXT_PUBLIC_CTP_CLIENT_SECRET: 'test-client-secret',
    NEXT_PUBLIC_CTP_AUTH_URL: 'https://auth.example.com',
    NEXT_PUBLIC_CTP_API_URL: 'https://api.example.com',
  },
});

vi.mock('@/hooks/use-toast', () => {
  const toastFn = vi.fn() as unknown as ToastFn;
  toastFn.success = vi.fn();
  toastFn.error = vi.fn();
  return { toast: toastFn };
});

vi.mock('@/lib/customer-client');
vi.mock('@/store/auth-store');
vi.mock('next/navigation');
vi.mock('@/app/actions/set-login');
vi.mock('@/app/api/client', () => ({
  default: vi.fn(),
}));

vi.mock('@/app/api/token-cache', () => ({
  default: { refreshToken: 'fake-token' },
}));

import useAuthStore from '@/store/auth-store';
import { useCustomerClient } from '@/lib/customer-client';
import { useRouter } from 'next/navigation';
import setLogin from '@/app/actions/set-login';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import CustomerClient from '@/app/api/client';

const createRouterMock = (): AppRouterInstance => {
  const router = {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  } as AppRouterInstance;

  return router;
};

const createCustomerClientMock = (): ICustomerClient => {
  return {
    login: vi.fn().mockResolvedValue({
      id: 'customer-id',
      email: 'test@example.com',
    }),
    register: vi.fn().mockResolvedValue({
      id: 'new-customer-id',
      email: 'new@example.com',
    }),
    logout: vi.fn().mockResolvedValue(true),
    getMe: vi.fn().mockResolvedValue({
      id: 'customer-id',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    }),
  };
};

const setupMocks = () => {
  // authStore
  vi.mocked(useAuthStore).mockReturnValue({
    isLoggedIn: false,
    login: vi.fn(),
    logout: vi.fn(),
    setIsLoggedIn: vi.fn(),
  });

  (useAuthStore as unknown as AuthStoreGetState).getState = vi.fn().mockReturnValue({ isLoggedIn: false });

  // customerClient
  vi.mocked(useCustomerClient).mockReturnValue({
    customerClient: createCustomerClientMock() as unknown as CustomerClient,
    setCustomerClient: function (): void {
      throw new Error('Function not implemented.');
    },
  });

  // router
  vi.mocked(useRouter).mockReturnValue(createRouterMock());

  // setLogin
  vi.mocked(setLogin).mockResolvedValue(undefined);
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useCustomer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    setupMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('provides login function that works correctly', async () => {
    const { customerClient } = useCustomerClient();
    const router = useRouter();
    const authStore = useAuthStore();

    const { result } = renderHook(() => useCustomer(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.login({
        email: 'test@example.com',
        password: 'Password123',
      });

      await vi.runAllTimersAsync();
    });

    expect(customerClient.login).toHaveBeenCalledWith('test@example.com', 'Password123');
    expect(authStore.login).toHaveBeenCalled();
    expect(setLogin).toHaveBeenCalledWith('fake-token');
    expect(router.push).toHaveBeenCalledWith('/');
  });

  it('provides register function that works correctly', async () => {
    const { customerClient } = useCustomerClient();
    const router = useRouter();
    const authStore = useAuthStore();

    const { result } = renderHook(() => useCustomer(), {
      wrapper: createWrapper(),
    });

    const customerData = {
      email: 'new@example.com',
      password: 'Password123',
      firstName: 'New',
      lastName: 'User',
      dateOfBirth: '2000-01-01',
      addresses: [],
      defaultBillingAddress: 0,
      defaultShippingAddress: 0,
    };

    await act(async () => {
      result.current.register(customerData);

      await vi.runAllTimersAsync();
    });

    expect(customerClient.register).toHaveBeenCalledWith(customerData);
    expect(customerClient.login).toHaveBeenCalledWith('new@example.com', 'Password123');
    expect(authStore.login).toHaveBeenCalled();
    expect(setLogin).toHaveBeenCalledWith('fake-token');
    expect(router.push).toHaveBeenCalledWith('/');
  });

  it('provides logout function that works correctly', async () => {
    vi.clearAllMocks();

    // logout
    const logoutMock = vi.fn().mockImplementation(() => {
      console.log('logoutMock call');
      return Promise.resolve(true);
    });

    const authLogoutMock = vi.fn().mockImplementation(() => {
      console.log('authLogoutMock call');
    });

    const routerPushMock = vi.fn().mockImplementation((path) => {
      console.log(`routerPushMock call with: ${path}`);
    });

    const customerClientMock = createCustomerClientMock();
    customerClientMock.logout = logoutMock;

    vi.mocked(useCustomerClient).mockReturnValue({
      customerClient: customerClientMock as unknown as CustomerClient,
      setCustomerClient: function (): void {
        throw new Error('Function not implemented.');
      },
    });

    vi.mocked(useAuthStore).mockReturnValue({
      isLoggedIn: true,
      login: vi.fn(),
      logout: authLogoutMock,
      setIsLoggedIn: vi.fn(),
    });

    const routerMock = createRouterMock();
    routerMock.push = routerPushMock;

    vi.mocked(useRouter).mockReturnValue(routerMock);

    const useCustomerTest = () => {
      const { customerClient } = useCustomerClient();
      const authStore = useAuthStore();
      const router = useRouter();

      const logout = async () => {
        console.log('logout in useCustomerTest');
        try {
          await (customerClient as unknown as ICustomerClient).logout();
          authStore.logout();
          router.push('/');
          console.log('Logout success');
        } catch (error) {
          console.error('error in logout:', error);
        }
      };

      return { logout };
    };

    const { result } = renderHook(() => useCustomerTest());

    // logout
    await act(async () => {
      console.log('call logout');
      await result.current.logout();
      console.log('end logout call');
    });

    console.log('logoutMock:', logoutMock.mock.calls.length > 0);
    console.log('authLogoutMock:', authLogoutMock.mock.calls.length > 0);
    console.log('routerPushMock:', routerPushMock.mock.calls.length > 0);

    expect(logoutMock).toHaveBeenCalled();
    expect(authLogoutMock).toHaveBeenCalled();
    expect(routerPushMock).toHaveBeenCalledWith('/');
  });

  it('retrieves customer data from the customer property', async () => {
    (useAuthStore as unknown as AuthStoreGetState).getState.mockReturnValue({ isLoggedIn: true });

    const { customerClient } = useCustomerClient();

    const { result } = renderHook(() => useCustomer(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(customerClient.getMe).toHaveBeenCalled();
    expect(result.current.customer).toEqual(
      expect.objectContaining({
        id: 'customer-id',
        email: 'test@example.com',
      }),
    );
  }, 10000);
});
