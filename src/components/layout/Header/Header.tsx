'use client';

import type { FormEvent } from 'react';

import LogoDesktop from '@/components/ui/Logo/LogoDesktop';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCustomer } from '@/hooks/use-customer';
import useAuthStore from '@/store/auth-store';
import { Info, Menu, MoonIcon, Search, ShoppingCart, SunIcon, User, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useRef, useState } from 'react';

import MobileMenu from '../Nav/MobileMenu';
import NavMenu from '../Nav/NavMenu';

export default function Header(): JSX.Element {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const { logout } = useCustomer();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { setTheme, theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const [isFocused, setIsFocused] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleLogoutClick = useCallback(() => {
    logout();
  }, [logout]);

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length < 5) {
      setIsInvalid(true);
      setTimeout(() => setIsInvalid(false), 3000);
      return;
    }

    router.push(`/products?q=${encodeURIComponent(trimmedQuery)}`);
    setSearchQuery('');
    setIsInvalid(false);
  };

  useEffect(() => {
    const handleResize = (): void => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return (): void => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-6">
          <LogoDesktop className="dark:filter dark:brightness-200 dark:contrast-50" />
        </div>
        <div className="mr-4 hidden md:flex items-center">
          <NavMenu />
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <form className="relative hidden md:flex w-full max-w-sm items-center" onSubmit={handleSearchSubmit}>
            {/* <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" /> */}
            <input
              className={`rounded-md min-w-[170px] border border-input pl-2 pr-14 py-2 text-sm 
                  ring-offset-background file:border-0 file:text-foreground 
                  placeholder:text-muted-foreground placeholder:opacity-60 
                  focus-visible:outline-none focus-visible:ring-2 
                  ${isInvalid ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-ring'} 
                  disabled:cursor-not-allowed disabled:opacity-50 w-full`}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="Search..."
              ref={searchInputRef}
              type="search"
              value={searchQuery}
            />

            {/* Search guidance tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="absolute right-10 flex items-center justify-center">
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="mt-4" side="bottom">
                  <p>For best results, use 5 or more characters in your search</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              aria-label="Submit search"
              className={`absolute right-0 h-full px-3
                ${searchQuery.trim().length < 5 ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}
              size="sm"
              type="submit"
              variant="ghost"
            >
              <Search className="h-3 w-3" />
              <span className="sr-only">Search</span>
            </Button>

            {isInvalid && (
              <div className="absolute -bottom-[80px] left-0 text-xs text-red-500 bg-black/20 p-1 rounded-md">
                Please enter at least 5 characters for better search results
              </div>
            )}

            {isFocused && searchQuery.trim().length < 5 && !isInvalid && (
              <div className="absolute -bottom-12 left-0 text-xs text-muted-foreground bg-black/20 p-1 rounded-md">
                Type at least 5 characters for accurate search
              </div>
            )}
          </form>

          <Button
            className="ml-2"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            size="icon"
            variant="ghost"
          >
            <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <nav className="flex items-center space-x-1">
            <Link href="/cart">
              <Button aria-label="Shopping Cart" size="icon" variant="ghost">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>
            {isLoggedIn ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-label="User Account" size="icon" variant="ghost">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href="/account">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/orders">My Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/wishlist">My Wishlist</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogoutClick}>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link className="hidden md:block" href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link className="hidden md:block" href="/sign-up">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
            <button
              className="inline-flex items-center justify-center rounded-md p-2 text-foreground/60 transition-colors hover:text-foreground md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </nav>
        </div>
      </div>

      <MobileMenu isLoggedIn={isLoggedIn} isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </header>
  );
}
