/* eslint-disable no-console */
import type { Client } from '@commercetools/ts-client';

import myTokenCache from '@/app/api/token-cache';
import {
  type _BaseAddress,
  type ByProjectKeyRequestBuilder,
  type Cart,
  type Customer,
  type CustomerDraft,
  type CustomerSignInResult,
  type ProductProjection,
  type ProductProjectionPagedQueryResponse,
  type QueryParam,
  createApiBuilderFromCtpClient,
} from '@commercetools/platform-sdk';
import Cookies from 'js-cookie';

import {
  createAnonymousClient,
  createCtpClient,
  createCustomerClient,
  createRefreshCustomerClient,
  projectKey,
} from './client-builder';

interface JwtPayload {
  [key: string]: unknown;
  exp: number;
}

interface ApiResponse {
  [key: string]: unknown;
}

type CommerceToolsQueryArgs = {
  [key: string]: QueryParam;
  filter?: string | string[];
  fuzzy?: boolean;
  fuzzyLevel?: number;
  limit?: number;
  markMatchingVariants?: boolean;
  offset?: number;
  priceCountry?: string;
  priceCurrency?: string;
  priceCustomerGroup?: string;
  sort?: string | string[];
  staged?: boolean;
};

// interface MyTokenCache {
//   cachedToken: {
//     expirationTime: number;
//     refreshToken?: string;
//     token: string;
//   };
//   refreshToken: string | undefined;
//   tokenCache: {
//     get: () => { expirationTime: number; refreshToken?: string; token: string };
//     set: (tokenStore: { expirationTime: number; refreshToken?: string; token: string }) => void;
//   };
// }

function isCustomer(obj: unknown): obj is CustomerSignInResult {
  return typeof obj === 'object';
}

function isJwtPayload(obj: unknown): obj is JwtPayload {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'exp' in obj &&
    typeof Object.getOwnPropertyDescriptor(obj, 'exp')?.value === 'number'
  );
}

function isApiResponse(obj: unknown): obj is ApiResponse {
  return typeof obj === 'object' && obj !== null;
}

function isErrorWithStatusCode(error: unknown): error is { statusCode: number } {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const statusCodeDescriptor = Object.getOwnPropertyDescriptor(error, 'statusCode');

  return statusCodeDescriptor !== undefined && typeof statusCodeDescriptor.value === 'number';
}

export default class CustomerClient {
  private anonymousClient: Client | null = null;

  private anonymousRoot: ByProjectKeyRequestBuilder | null = null;

  private apiUrl = `https://api.europe-west1.gcp.commercetools.com/${projectKey}`;

  private ctpClient: Client;

  private customerClient: Client | null = null;

  private customerRoot: ByProjectKeyRequestBuilder | null = null;

  private isAnonymousMode = false;

  constructor() {
    this.ctpClient = createCtpClient();

    this.customerClient = createCtpClient();
    if (this.customerClient) {
      this.customerRoot = createApiBuilderFromCtpClient(this.customerClient).withProjectKey({ projectKey });
    }

    this.anonymousClient = createAnonymousClient();
    if (this.anonymousClient) {
      this.anonymousRoot = createApiBuilderFromCtpClient(this.anonymousClient).withProjectKey({ projectKey });
    }

    const token = Cookies.get('login');
    if (token) {
      this.customerClient = createRefreshCustomerClient(token);
      if (this.customerClient) {
        this.customerRoot = createApiBuilderFromCtpClient(this.customerClient).withProjectKey({ projectKey });
      }
      this.isAnonymousMode = false;
    } else {
      this.isAnonymousMode = true;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join(''),
      );

      const parsedPayload: unknown = JSON.parse(jsonPayload);

      if (!isJwtPayload(parsedPayload)) {
        return true;
      }

      return Date.now() >= parsedPayload.exp * 1000;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  public async addAddress(address: _BaseAddress): Promise<Customer | null> {
    if (this.customerRoot) {
      const customer = await this.getCustomerInfo();
      const customerVersion = customer?.version;
      if (customerVersion) {
        const response = await this.customerRoot
          .me()
          .post({
            body: {
              actions: [{ action: 'addAddress', address }],
              version: customerVersion,
            },
          })
          .execute();
        return response.body;
      }
    }
    return null;
  }

  // Add to cart
  public async addToCart(productId: string, variantId = 1, quantity = 1): Promise<Cart | null> {
    const root = this.isAnonymousMode ? this.anonymousRoot : this.customerRoot;

    if (!root) {
      return null;
    }

    try {
      const cart = await this.getActiveCart();
      if (!cart) {
        return null;
      }

      let response;

      if (this.isAnonymousMode) {
        response = await root
          .carts()
          .withId({ ID: cart.id })
          .post({
            body: {
              actions: [
                {
                  action: 'addLineItem' as const,
                  productId,
                  quantity,
                  variantId,
                },
              ],
              version: cart.version,
            },
          })
          .execute();
      } else {
        response = await root
          .me()
          .carts()
          .withId({ ID: cart.id })
          .post({
            body: {
              actions: [
                {
                  action: 'addLineItem' as const,
                  productId,
                  quantity,
                  variantId,
                },
              ],
              version: cart.version,
            },
          })
          .execute();
      }

      return response.body;
    } catch (error) {
      console.error('Error adding product to cart:', error);
      return null;
    }
  }

  // Apply promocode to cart
  public async applyDiscountCode(code: string): Promise<Cart | null> {
    const root = this.isAnonymousMode ? this.anonymousRoot : this.customerRoot;

    if (!root) {
      return null;
    }

    try {
      const cart = await this.getActiveCart();
      if (!cart) {
        return null;
      }

      let response;

      if (this.isAnonymousMode) {
        response = await root
          .carts()
          .withId({ ID: cart.id })
          .post({
            body: {
              actions: [
                {
                  action: 'addDiscountCode' as const,
                  code,
                },
              ],
              version: cart.version,
            },
          })
          .execute();
      } else {
        response = await root
          .me()
          .carts()
          .withId({ ID: cart.id })
          .post({
            body: {
              actions: [
                {
                  action: 'addDiscountCode' as const,
                  code,
                },
              ],
              version: cart.version,
            },
          })
          .execute();
      }

      return response.body;
    } catch (error) {
      console.error('Error applying discount code:', error);
      return null;
    }
  }

  public async callApi<T>(path: string, options: RequestInit = {}): Promise<T | null> {
    const url = `${this.apiUrl}${path}`;

    try {
      if (myTokenCache.cachedToken.token && this.isTokenExpired(myTokenCache.cachedToken.token)) {
        if (myTokenCache.refreshToken) {
          await this.refreshToken(myTokenCache.refreshToken);
        } else {
          return null;
        }
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        let errorMessage = `API error: ${response.status}`;
        try {
          const errorResponse: unknown = await response.json();
          if (
            typeof errorResponse === 'object' &&
            errorResponse !== null &&
            'message' in errorResponse &&
            typeof errorResponse.message === 'string'
          ) {
            errorMessage = errorResponse.message;
          }
        } catch (jsonError) {
          // ignore JSON parse errors
        }
        throw new Error(errorMessage);
      }

      if (response.status === 204) {
        return null;
      }

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const result: T = (await response.json()) as T;
      return result;
    } catch (error) {
      console.error(`API call failed: ${path}`, error);
      throw error;
    }
  }

  public async changePassword(currentPassword: string, newPassword: string): Promise<Customer | null> {
    if (this.customerRoot) {
      const customer = await this.getCustomerInfo();
      const customerVersion = customer?.version;
      if (customerVersion) {
        const response = await this.customerRoot
          .me()
          .password()
          .post({
            body: {
              currentPassword,
              newPassword,
              version: customerVersion,
            },
          })
          .execute();
        return response.body;
      }
    }
    return null;
  }

  // Clear the cart
  public async clearCart(): Promise<Cart | null> {
    const root = this.isAnonymousMode ? this.anonymousRoot : this.customerRoot;

    if (!root) {
      return null;
    }

    try {
      const cart = await this.getActiveCart();
      if (!cart) {
        return null;
      }

      const actions = cart.lineItems.map((item) => ({
        action: 'removeLineItem' as const,
        lineItemId: item.id,
      }));

      if (actions.length === 0) {
        return cart;
      }

      let response;

      if (this.isAnonymousMode) {
        response = await root
          .carts()
          .withId({ ID: cart.id })
          .post({
            body: {
              actions,
              version: cart.version,
            },
          })
          .execute();
      } else {
        response = await root
          .me()
          .carts()
          .withId({ ID: cart.id })
          .post({
            body: {
              actions,
              version: cart.version,
            },
          })
          .execute();
      }

      return response.body;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return null;
    }
  }

  // Create a new cart
  public async createCart(): Promise<Cart | null> {
    const root = this.isAnonymousMode ? this.anonymousRoot : this.customerRoot;

    if (!root) {
      console.log('No root client available for cart creation');

      if (this.isAnonymousMode) {
        this.anonymousClient = createAnonymousClient();
        if (this.anonymousClient) {
          this.anonymousRoot = createApiBuilderFromCtpClient(this.anonymousClient).withProjectKey({ projectKey });
          return this.createCart();
        }
      }
      return null;
    }

    try {
      let response;

      if (this.isAnonymousMode) {
        try {
          response = await root
            .carts()
            .post({
              body: {
                currency: 'USD',
              },
            })
            .execute();

          if (response.body && response.body.id) {
            Cookies.set('cartId', response.body.id, { expires: 30 });
            return response.body;
          }
        } catch (error) {
          console.error('Failed to create anonymous cart:', error);

          if (
            error instanceof Error &&
            (error.message.includes('invalid_scope') ||
              error.message.includes('insufficient_scope') ||
              error.message.includes('invalid_grant') ||
              error.message.includes('token was not found') ||
              error.message.includes('expired'))
          ) {
            console.log('Regenerating anonymous client due to auth issues');
            this.anonymousClient = createAnonymousClient();
            if (this.anonymousClient) {
              this.anonymousRoot = createApiBuilderFromCtpClient(this.anonymousClient).withProjectKey({ projectKey });

              try {
                response = await this.anonymousRoot
                  .carts()
                  .post({
                    body: { currency: 'USD' },
                  })
                  .execute();

                if (response.body && response.body.id) {
                  Cookies.set('cartId', response.body.id, { expires: 30 });
                  return response.body;
                }
              } catch (retryError) {
                console.error('Failed to create cart after client regeneration:', retryError);
                return null;
              }
            }
          }
          return null;
        }
      } else {
        try {
          response = await root
            .me()
            .carts()
            .post({
              body: {
                currency: 'USD',
              },
            })
            .execute();
          return response.body;
        } catch (error) {
          if (
            error instanceof Error &&
            (error.message.includes('invalid_grant') ||
              error.message.includes('invalid_scope') ||
              error.message.includes('insufficient_scope') ||
              error.message.includes('token was not found') ||
              error.message.includes('expired'))
          ) {
            console.log('Falling back to anonymous cart due to auth issues');
            this.isAnonymousMode = true;
            Cookies.remove('login');
            return this.createCart();
          }
          throw error;
        }
      }

      return null;
    } catch (error) {
      console.error('Error creating cart:', error);
      return null;
    }
  }

  // Get active cart
  public async getActiveCart(): Promise<Cart | null> {
    const root = this.isAnonymousMode ? this.anonymousRoot : this.customerRoot;
    const cartId = Cookies.get('cartId');

    if (!root) {
      console.log('No root client available, attempting to create anonymous client');
      if (this.isAnonymousMode) {
        this.anonymousClient = createAnonymousClient();
        if (this.anonymousClient) {
          this.anonymousRoot = createApiBuilderFromCtpClient(this.anonymousClient).withProjectKey({ projectKey });
          return this.createCart();
        }
      }
      return null;
    }

    try {
      if (this.isAnonymousMode && cartId) {
        try {
          const response = await root.carts().withId({ ID: cartId }).get().execute();
          return response.body;
        } catch (error) {
          console.log('Stored cart ID no longer valid, creating new anonymous cart');
          Cookies.remove('cartId');
          return this.createCart();
        }
      }

      if (this.isAnonymousMode) {
        return this.createCart();
      }
      try {
        const response = await root.me().activeCart().get().execute();
        return response.body;
      } catch (error) {
        if (isErrorWithStatusCode(error) && error.statusCode === 404) {
          console.log('No active cart found for authenticated user, creating a new one');
          return this.createCart();
        }

        if (
          isErrorWithStatusCode(error) &&
          (error.statusCode === 400 || error.statusCode === 401 || error.statusCode === 403)
        ) {
          console.log('Authentication error, falling back to anonymous mode');
          this.isAnonymousMode = true;

          Cookies.remove('login');

          this.anonymousClient = createAnonymousClient();
          if (this.anonymousClient) {
            this.anonymousRoot = createApiBuilderFromCtpClient(this.anonymousClient).withProjectKey({ projectKey });
            return this.createCart();
          }
        }

        throw error;
      }
    } catch (error) {
      console.error('Error getting active cart:', error);

      if (
        error instanceof Error &&
        (error.message.includes('invalid_grant') ||
          error.message.includes('invalid_scope') ||
          error.message.includes('insufficient_scope') ||
          error.message.includes('Permissions exceeded') ||
          error.message.includes('token was not found') ||
          error.message.includes('expired'))
      ) {
        console.log('Authentication error detected, attempting to create anonymous cart');

        this.isAnonymousMode = true;

        Cookies.remove('login');

        this.anonymousClient = createAnonymousClient();
        if (this.anonymousClient) {
          this.anonymousRoot = createApiBuilderFromCtpClient(this.anonymousClient).withProjectKey({ projectKey });
          try {
            return this.createCart();
          } catch (createErr) {
            console.error('Failed to create new anonymous cart:', createErr);
          }
        }
      }

      return null;
    }
  }

  public async getCustomerInfo(): Promise<Customer | null> {
    try {
      if (this.customerRoot) {
        const response = await this.customerRoot.me().get().execute();
        return response.body;
      }
    } catch (error) {
      console.error('Error fetching customer profile:', error);
      return null;
    }
    return null;
  }

  public async getMe(): Promise<ApiResponse | null> {
    if (!myTokenCache.refreshToken) {
      return null;
    }

    if (!this.customerRoot) {
      return null;
    }

    try {
      if (this.customerRoot) {
        const response = await this.customerRoot.me().get().execute();
        if (isApiResponse(response.body)) {
          return response.body;
        }
        return null;
      }

      if (typeof this.callApi === 'function') {
        const response = await this.callApi('/me', {
          headers: {
            Authorization: `Bearer ${myTokenCache.cachedToken.token}`,
          },
        });

        if (isApiResponse(response)) {
          return response;
        }

        return null;
      }

      return null;
    } catch (error) {
      console.error('Error fetching customer profile:', error);
      return null;
    }
  }

  public async getProductById(id: string): Promise<ProductProjection | null> {
    if (this.customerRoot) {
      try {
        const response = await this.customerRoot.productProjections().withId({ ID: id }).get().execute();
        return response.body;
      } catch (error) {
        console.error(`Error fetching product with id ${id}:`, error);
        return null;
      }
    }
    return null;
  }

  public async getProducts(
    filterParams: Record<string, unknown> = {},
  ): Promise<ProductProjectionPagedQueryResponse | null> {
    console.log('Getting products with filters:', filterParams);

    if (this.customerRoot) {
      try {
        const filterQuery: string[] = [];

        filterQuery.push('published:true');

        if (filterParams.priceFrom !== undefined || filterParams.priceTo !== undefined) {
          const minPrice = filterParams.priceFrom !== undefined ? Number(filterParams.priceFrom) : 0;
          const maxPrice = filterParams.priceTo !== undefined ? Number(filterParams.priceTo) : Number.MAX_SAFE_INTEGER;

          console.log(`Price filter values: min=${minPrice}, max=${maxPrice}`);

          if (minPrice > 0 && maxPrice < Number.MAX_SAFE_INTEGER) {
            filterQuery.push(`variants.price.centAmount:range(${minPrice} to ${maxPrice})`);
            console.log(`Added price range filter: variants.price.centAmount:range(${minPrice} to ${maxPrice})`);
          } else if (minPrice > 0) {
            filterQuery.push(`variants.price.centAmount:range(${minPrice} to *)`);
          } else if (maxPrice < Number.MAX_SAFE_INTEGER) {
            filterQuery.push(`variants.price.centAmount:range(* to ${maxPrice})`);
          }
        }

        if (
          filterParams.categoryIds &&
          Array.isArray(filterParams.categoryIds) &&
          filterParams.categoryIds.length > 0
        ) {
          if (filterParams.categoryIds.length === 1) {
            filterQuery.push(`categories.id:"${filterParams.categoryIds[0]}"`);
          } else {
            filterParams.categoryIds.forEach((categoryId) => {
              filterQuery.push(`categories.id:"${categoryId}"`);
            });
          }
        }

        console.log('Filter query:', filterQuery);

        let sort: string[] = [];
        if (filterParams.sortBy) {
          switch (filterParams.sortBy) {
            case 'price-asc':
              sort = ['price asc'];
              break;
            case 'price-desc':
              sort = ['price desc'];
              break;
            case 'name-asc':
              sort = ['name.en-US asc'];
              break;
            case 'name-desc':
              sort = ['name.en-US desc'];
              break;
            case 'createdAt-desc':
              sort = ['createdAt desc'];
              break;
            case 'createdAt-asc':
              sort = ['createdAt asc'];
              break;
            default:
              break;
          }
        }

        console.log('Sorting parameters:', sort);

        const response = await this.customerRoot
          .productProjections()
          .search()
          .get({
            queryArgs: {
              filter: filterQuery,
              limit: filterParams.limit ? Number(filterParams.limit) : 6,
              offset: filterParams.offset ? Number(filterParams.offset) : 0,
              sort: sort.length > 0 ? sort : undefined,
            },
          })
          .execute();

        console.log('Products response:', response.statusCode, 'Total items:', response.body?.total);
        return response.body;
      } catch (error) {
        console.error('Error fetching products with filters:', error);
        return null;
      }
    }
    return null;
  }

  public async getProductsByCategory(
    categoryId: string,
    filterParams: Record<string, unknown> = {},
  ): Promise<ProductProjectionPagedQueryResponse | null> {
    console.log(`Getting products for category ${categoryId} with filters:`, filterParams);

    if (this.customerRoot) {
      try {
        const filterQuery: string[] = [];

        filterQuery.push(`categories.id:"${categoryId}"`);
        filterQuery.push('published:true');

        if (filterParams.priceFrom !== undefined || filterParams.priceTo !== undefined) {
          const minPrice = filterParams.priceFrom !== undefined ? Number(filterParams.priceFrom) : 0;
          const maxPrice = filterParams.priceTo !== undefined ? Number(filterParams.priceTo) : Number.MAX_SAFE_INTEGER;

          console.log(`Price filter values: min=${minPrice}, max=${maxPrice}`);

          if (minPrice > 0 && maxPrice < Number.MAX_SAFE_INTEGER) {
            filterQuery.push(`variants.price.centAmount:range(${minPrice} to ${maxPrice})`);
            console.log(`Added price range filter: variants.price.centAmount:range(${minPrice} to ${maxPrice})`);
          } else if (minPrice > 0) {
            filterQuery.push(`variants.price.centAmount:range(${minPrice} to *)`);
          } else if (maxPrice < Number.MAX_SAFE_INTEGER) {
            filterQuery.push(`variants.price.centAmount:range(* to ${maxPrice})`);
          }
        }

        if (
          filterParams.categoryIds &&
          Array.isArray(filterParams.categoryIds) &&
          filterParams.categoryIds.length > 0
        ) {
          if (filterParams.categoryIds.length === 1) {
            filterQuery.push(`categories.id:"${filterParams.categoryIds[0]}"`);
          } else {
            filterParams.categoryIds.forEach((categoryId) => {
              filterQuery.push(`categories.id:"${categoryId}"`);
            });
          }
        }

        console.log('Filter query for category:', filterQuery);

        let sort: string[] = [];
        if (filterParams.sortBy) {
          switch (filterParams.sortBy) {
            case 'price-asc':
              sort = ['price asc'];
              break;
            case 'price-desc':
              sort = ['price desc'];
              break;
            case 'name-asc':
              sort = ['name.en-US asc'];
              break;
            case 'name-desc':
              sort = ['name.en-US desc'];
              break;
            default:
              break;
          }
        }

        const response = await this.customerRoot
          .productProjections()
          .search()
          .get({
            queryArgs: {
              filter: filterQuery,
              limit: filterParams.limit ? Number(filterParams.limit) : 6,
              offset: filterParams.offset ? Number(filterParams.offset) : 0,
              sort: sort.length > 0 ? sort : undefined,
            },
          })
          .execute();

        console.log(
          `Products for category ${categoryId} response:`,
          response.statusCode,
          'Total items:',
          response.body?.total,
        );
        return response.body;
      } catch (error) {
        console.error(`Error fetching products for category ${categoryId}:`, error);
        return null;
      }
    }

    console.warn('No customerRoot available to fetch products by category');
    return null;
  }

  public async login(email: string, password: string): Promise<Customer> {
    this.customerClient = createCustomerClient(email, password);
    this.customerRoot = createApiBuilderFromCtpClient(this.customerClient).withProjectKey({ projectKey });
    const response = await this.customerRoot.me().get().execute();
    return response.body;
  }

  public async refreshToken(refreshToken: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/oauth/token`, {
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh token: ${response.status}`);
      }

      const data: unknown = await response.json();

      if (
        typeof data === 'object' &&
        data !== null &&
        'access_token' in data &&
        typeof data.access_token === 'string' &&
        'refresh_token' in data &&
        typeof data.refresh_token === 'string'
      ) {
        myTokenCache.tokenCache.set({
          expirationTime: Date.now() + 3600 * 1000,
          refreshToken: data.refresh_token,
          token: data.access_token,
        });
        myTokenCache.refreshToken = data.refresh_token;
      } else {
        throw new Error('Invalid token response format');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      myTokenCache.tokenCache.set({
        expirationTime: 0,
        token: '',
      });
      myTokenCache.refreshToken = undefined;
      throw error;
    }
  }

  public async register(customerParams: CustomerParams): Promise<CustomerSignInResult | null> {
    const customerData: CustomerDraft = {
      addresses: customerParams.addresses,
      dateOfBirth: customerParams.dateOfBirth,
      defaultBillingAddress: customerParams.defaultBillingAddress,
      defaultShippingAddress: customerParams.defaultShippingAddress,
      email: customerParams.email,
      firstName: customerParams.firstName,
      lastName: customerParams.lastName,
      password: customerParams.password,
    };

    const response = await this.ctpClient.execute({
      body: customerData,
      method: 'POST',
      uri: `/${projectKey}/me/signup`,
    });
    if (isCustomer(response.body)) {
      return response.body;
    }
    return null;
  }

  public async removeAddress(addressId: string): Promise<Customer | null> {
    if (this.customerRoot) {
      const customer = await this.getCustomerInfo();
      const customerVersion = customer?.version;
      if (customerVersion) {
        const response = await this.customerRoot
          .me()
          .post({
            body: {
              actions: [{ action: 'removeAddress', addressId }],
              version: customerVersion,
            },
          })
          .execute();
        return response.body;
      }
    }
    return null;
  }

  // remove item from cart
  public async removeFromCart(lineItemId: string): Promise<Cart | null> {
    const root = this.isAnonymousMode ? this.anonymousRoot : this.customerRoot;

    if (!root) {
      return null;
    }

    try {
      const cart = await this.getActiveCart();
      if (!cart) {
        return null;
      }

      let response;

      if (this.isAnonymousMode) {
        response = await root
          .carts()
          .withId({ ID: cart.id })
          .post({
            body: {
              actions: [
                {
                  action: 'removeLineItem' as const,
                  lineItemId,
                },
              ],
              version: cart.version,
            },
          })
          .execute();
      } else {
        response = await root
          .me()
          .carts()
          .withId({ ID: cart.id })
          .post({
            body: {
              actions: [
                {
                  action: 'removeLineItem' as const,
                  lineItemId,
                },
              ],
              version: cart.version,
            },
          })
          .execute();
      }

      return response.body;
    } catch (error) {
      console.error('Error removing line item from cart:', error);
      return null;
    }
  }

  public async searchProducts(
    searchQuery: string,
    filterParams: Record<string, unknown> = {},
  ): Promise<ProductProjectionPagedQueryResponse | null> {
    console.log(`Searching products with query "${searchQuery}" and filters:`, filterParams);

    if (this.customerRoot) {
      try {
        const filterQuery: string[] = ['published:true'];

        if (filterParams.priceFrom !== undefined || filterParams.priceTo !== undefined) {
          const minPrice = filterParams.priceFrom !== undefined ? Number(filterParams.priceFrom) : 0;
          const maxPrice = filterParams.priceTo !== undefined ? Number(filterParams.priceTo) : Number.MAX_SAFE_INTEGER;

          if (minPrice > 0 && maxPrice < Number.MAX_SAFE_INTEGER) {
            filterQuery.push(`variants.price.centAmount:range(${minPrice} to ${maxPrice})`);
          } else if (minPrice > 0) {
            filterQuery.push(`variants.price.centAmount:range(${minPrice} to *)`);
          } else if (maxPrice < Number.MAX_SAFE_INTEGER) {
            filterQuery.push(`variants.price.centAmount:range(* to ${maxPrice})`);
          }
        }

        if (
          filterParams.categoryIds &&
          Array.isArray(filterParams.categoryIds) &&
          filterParams.categoryIds.length > 0
        ) {
          // if (filterParams.categoryOperator === 'or' && filterParams.categoryIds.length > 1) {
          //   const categoryFilter = filterParams.categoryIds
          //     .map(catId => `categories.id:"${catId}"`)
          //     .join(' or ');
          //   filterQuery.push(`(${categoryFilter})`);
          // } else {
          //   filterParams.categoryIds.forEach(categoryId => {
          //     filterQuery.push(`categories.id:"${categoryId}"`);
          //   });
          // }
          filterParams.categoryIds.forEach((categoryId) => {
            filterQuery.push(`categories.id:"${categoryId}"`);
          });
        }

        console.log('Search filter query:', filterQuery);

        let sort: string[] = [];
        if (filterParams.sortBy) {
          switch (filterParams.sortBy) {
            case 'price-asc':
              sort = ['price asc'];
              break;
            case 'price-desc':
              sort = ['price desc'];
              break;
            case 'name-asc':
              sort = ['name.en-US asc'];
              break;
            case 'name-desc':
              sort = ['name.en-US desc'];
              break;
            default:
              break;
          }
        }

        const queryArgs: CommerceToolsQueryArgs = {
          filter: filterQuery,
          limit: filterParams.limit ? Number(filterParams.limit) : 6,
          offset: filterParams.offset ? Number(filterParams.offset) : 0,
          sort: sort.length > 0 ? sort : undefined,
        };

        if (searchQuery.length <= 2) {
          queryArgs['text.en-US'] = `${searchQuery}*`;
        } else if (searchQuery.length <= 4) {
          queryArgs['text.en-US'] = searchQuery;
          queryArgs.fuzzy = true;
          queryArgs.fuzzyLevel = 1;
          if (searchQuery.length >= 3) {
            queryArgs['text.en-US.exact'] = `${searchQuery}*`;
          }
        } else {
          queryArgs['text.en-US'] = searchQuery;
          queryArgs.fuzzy = true;
          queryArgs.fuzzyLevel = 2;
        }

        console.log('Full search query parameters:', queryArgs);

        const response = await this.customerRoot.productProjections().search().get({ queryArgs }).execute();

        console.log('Search results:', {
          foundBooks: response.body?.results?.map((p) => p.name['en-US']),
          status: response.statusCode,
          total: response.body?.total,
        });
        return response.body;
      } catch (error) {
        console.error(`Error searching products with query "${searchQuery}":`, error);
        return null;
      }
    }
    return null;
  }

  public update(): void {
    const token = Cookies.get('login');
    if (token) {
      this.customerClient = createRefreshCustomerClient(token);
      this.customerRoot = createApiBuilderFromCtpClient(this.customerClient).withProjectKey({ projectKey });
    }
  }

  public async updateAddress(address: _BaseAddress, addressId: string): Promise<Customer | null> {
    if (this.customerRoot) {
      const customer = await this.getCustomerInfo();
      const customerVersion = customer?.version;
      if (customerVersion) {
        const response = await this.customerRoot
          .me()
          .post({
            body: {
              actions: [{ action: 'changeAddress', address, addressId }],
              version: customerVersion,
            },
          })
          .execute();
        return response.body;
      }
    }
    return null;
  }

  // Update cart item quantity
  public async updateCartItemQuantity(lineItemId: string, quantity: number): Promise<Cart | null> {
    const root = this.isAnonymousMode ? this.anonymousRoot : this.customerRoot;

    if (!root) {
      return null;
    }

    try {
      const cart = await this.getActiveCart();
      if (!cart) {
        return null;
      }

      let response;

      if (this.isAnonymousMode) {
        response = await root
          .carts()
          .withId({ ID: cart.id })
          .post({
            body: {
              actions: [
                {
                  action: 'changeLineItemQuantity' as const,
                  lineItemId,
                  quantity,
                },
              ],
              version: cart.version,
            },
          })
          .execute();
      } else {
        response = await root
          .me()
          .carts()
          .withId({ ID: cart.id })
          .post({
            body: {
              actions: [
                {
                  action: 'changeLineItemQuantity' as const,
                  lineItemId,
                  quantity,
                },
              ],
              version: cart.version,
            },
          })
          .execute();
      }

      return response.body;
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      return null;
    }
  }

  public async updateDefaultBillingAddress(addressId: string): Promise<Customer | null> {
    if (this.customerRoot) {
      const customer = await this.getCustomerInfo();
      const customerVersion = customer?.version;
      if (customerVersion) {
        const response = await this.customerRoot
          .me()
          .post({
            body: {
              actions: [{ action: 'setDefaultBillingAddress', addressId }],
              version: customerVersion,
            },
          })
          .execute();
        return response.body;
      }
    }
    return null;
  }

  public async updateDefaultShippingAddress(addressId: string): Promise<Customer | null> {
    if (this.customerRoot) {
      const customer = await this.getCustomerInfo();
      const customerVersion = customer?.version;
      if (customerVersion) {
        const response = await this.customerRoot
          .me()
          .post({
            body: {
              actions: [{ action: 'setDefaultShippingAddress', addressId }],
              version: customerVersion,
            },
          })
          .execute();
        return response.body;
      }
    }
    return null;
  }

  public async updatePersonalInfo(personalInfo: { [key: string]: string }): Promise<Customer | null> {
    if (this.customerRoot) {
      const customer = await this.getCustomerInfo();
      const customerVersion = customer?.version;
      if (customerVersion) {
        const response = await this.customerRoot
          .me()
          .post({
            body: {
              actions: [
                { action: 'setFirstName', firstName: personalInfo.firstName },
                { action: 'setLastName', lastName: personalInfo.lastName },
                { action: 'changeEmail', email: personalInfo.email },
                { action: 'setDateOfBirth', dateOfBirth: personalInfo.dateOfBirth },
              ],
              version: customerVersion,
            },
          })
          .execute();
        return response.body;
      }
    }
    return null;
  }
}

interface Address {
  city: string;
  country: string;
}

interface CustomerParams {
  addresses: Address[];
  dateOfBirth: string;
  defaultBillingAddress: number;
  defaultShippingAddress: number;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}
