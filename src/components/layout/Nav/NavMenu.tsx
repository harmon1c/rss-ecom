'use client';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { Book, BookCopy, BookMarked, BookOpen, Bookmark, Library } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

const bookCategories = [
  {
    description: 'Immerse yourself in captivating stories and imaginary worlds',
    href: '/categories/fiction',
    icon: <BookOpen className="h-5 w-5 mb-1 text-primary" />,
    title: 'Fiction',
  },
  {
    description: 'Expand your knowledge with informative and insightful reads',
    href: '/categories/non-fiction',
    icon: <BookCopy className="h-5 w-5 mb-1 text-primary" />,
    title: 'Non-Fiction',
  },
  {
    description: 'Journey through magical realms and epic adventures',
    href: '/categories/fantasy',
    icon: <BookCopy className="h-5 w-5 mb-1 text-primary" />,
    title: 'Fantasy',
  },
  {
    description: 'Explore futuristic worlds and technological possibilities',
    href: '/categories/sci-fi',
    icon: <Bookmark className="h-5 w-5 mb-1 text-primary" />,
    title: 'Science Fiction',
  },
  {
    description: 'Solve puzzles and follow thrilling detective stories',
    href: '/categories/mystery',
    icon: <Bookmark className="h-5 w-5 mb-1 text-primary" />,
    title: 'Mystery',
  },
  {
    description: 'Experience heartwarming tales of love and relationships',
    href: '/categories/romance',
    icon: <BookOpen className="h-5 w-5 mb-1 text-primary" />,
    title: 'Romance',
  },
  {
    description: 'Magical stories and educational books for young readers',
    href: '/categories/children',
    icon: <BookMarked className="h-5 w-5 mb-1 text-primary" />,
    title: "Children's Books",
  },
  {
    description: 'True stories of remarkable people throughout history',
    href: '/categories/biography',
    icon: <BookCopy className="h-5 w-5 mb-1 text-primary" />,
    title: 'Biography',
  },
  {
    className:
      'col-span-full flex items-center bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-md',
    description: 'Explore our full collection of books from all genres and categories',
    href: '/products',
    icon: <Book className="h-5 w-5 mb-1 text-primary" />,
    title: 'Browse All Books',
  },
];

const featuredCategories = [
  bookCategories[0], // Fiction
  bookCategories[1], // Non-Fiction
  bookCategories[6], // Children's Books
  bookCategories[8], // Browse All Books
];

const clearNavigationMenuTriggerStyle = cn(
  'group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50',
  'bg-transparent hover:bg-transparent data-[state=open]:bg-transparent data-[active]:bg-transparent focus:bg-transparent',
);

const clearNavigationMenuLinkStyle = cn(
  'group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50',
  'bg-transparent hover:bg-transparent',
);

function NavMenu(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <NavigationMenu>
      <NavigationMenuList className="bg-transparent">
        <NavigationMenuItem className="relative group/books">
          <NavigationMenuTrigger className={clearNavigationMenuTriggerStyle}>
            Books
            <span className="h-[1px] inline-block bg-primary absolute left-0 -bottom-1 w-0 group-hover/books:w-full transition-[width] duration-300 ease-in-out" />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {featuredCategories.map((category) => (
                <ListItem Icon={category.icon} href={category.href} key={category.title} title={category.title}>
                  {category.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem className="relative group/categories">
          <NavigationMenuTrigger className={clearNavigationMenuTriggerStyle}>
            Categories
            <span className="h-[1px] inline-block bg-primary absolute left-0 -bottom-1 w-0 group-hover/categories:w-full transition-[width] duration-300 ease-in-out" />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[600px] grid-cols-2">
              <li className="row-span-3 col-span-2">
                <NavigationMenuLink asChild>
                  <Link
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-amber-500/80 to-amber-700/90 p-6 no-underline outline-none focus:shadow-md"
                    href="/categories"
                  >
                    <Library className="h-6 w-6 text-white" />
                    <div className="mb-2 mt-4 text-lg font-medium text-white">All Categories</div>
                    <p className="text-sm leading-tight text-white/90">
                      Browse our complete collection of book categories and genres
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>

              {bookCategories.slice(0, -1).map((category) => (
                <ListItem Icon={category.icon} href={category.href} key={category.title} title={category.title}>
                  {category.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem className="relative group/sale">
          <Link href="/sale" legacyBehavior passHref>
            <NavigationMenuLink className={cn(clearNavigationMenuLinkStyle, 'text-red-500 text-md')}>
              Sale
              <span
                className={cn(
                  'h-[1px] inline-block bg-primary absolute left-0 -bottom-1',
                  'group-hover/sale:w-full transition-[width] duration-300 ease-in-out',
                  pathname === '/sale' ? 'w-full' : 'w-0',
                )}
              />
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        {/* <NavigationMenuItem className="relative group/blog">
          <Link href="/blog" legacyBehavior passHref>
            <NavigationMenuLink className={clearNavigationMenuLinkStyle}>
              Blog
              <span
                className={cn(
                  'h-[1px] inline-block bg-primary absolute left-0 -bottom-1',
                  'group-hover/blog:w-full transition-[width] duration-300 ease-in-out',
                  pathname === '/blog' ? 'w-full' : 'w-0',
                )}
              />
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem> */}
        <NavigationMenuItem className="relative group/books">
          <NavigationMenuTrigger className={clearNavigationMenuTriggerStyle}>
            About
            <span className="h-[1px] inline-block bg-primary absolute left-0 -bottom-1 w-0 group-hover/books:w-full transition-[width] duration-300 ease-in-out" />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              <ListItem href={'/about'} key={'About Story Hive'} title={'About Story Hive'}></ListItem>
              <ListItem href={'/about-us'} key={'About us'} title={'About us'}></ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* <NavigationMenuItem className="relative group/about">
          <Link href="/about" legacyBehavior passHref>
            <NavigationMenuLink className={clearNavigationMenuLinkStyle}>
              About
              <span
                className={cn(
                  'h-[1px] inline-block bg-primary absolute left-0 -bottom-1',
                  'group-hover/about:w-full transition-[width] duration-300 ease-in-out',
                  pathname === '/about' ? 'w-full' : 'w-0',
                )}
              />
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem> */}

        <NavigationMenuItem className="relative group/contacts">
          <Link href="/contacts" legacyBehavior passHref>
            <NavigationMenuLink className={clearNavigationMenuLinkStyle}>
              Contact Us
              <span
                className={cn(
                  'h-[1px] inline-block bg-primary absolute left-0 -bottom-1',
                  'group-hover/contacts:w-full transition-[width] duration-300 ease-in-out',
                  pathname === '/contacts' ? 'w-full' : 'w-0',
                )}
              />
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

interface ListItemProps extends React.ComponentPropsWithoutRef<'a'> {
  Icon?: React.ReactNode;
  title: string;
}

const ListItem = React.forwardRef<React.ElementRef<'a'>, ListItemProps>(
  ({ Icon, children, className, title, ...props }, ref) => (
    <li>
      <NavigationMenuLink asChild>
        <a
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className,
          )}
          ref={ref}
          {...props}
        >
          <div className="flex items-center gap-2">
            {Icon && <span>{Icon}</span>}
            <div className="text-sm font-medium leading-none">{title}</div>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
        </a>
      </NavigationMenuLink>
    </li>
  ),
);
ListItem.displayName = 'ListItem';

export default NavMenu;
