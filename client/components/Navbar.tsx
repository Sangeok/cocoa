"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "@headlessui/react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { SunIcon, MoonIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";
import Switch from "./Switch";
import { useTheme } from "@/providers/ThemeProvider";
import Logo from "@/components/Logo";
import useActiveUsersStore from "@/store/useActiveUsersStore";

const navigation = [
  { name: "실시간 김프", href: "/premium" },
  { name: "코코아 뉴스", href: "/news" },
  { name: "송금 계산기", href: "/withdraw" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { count: activeUsers, initializeSocket } = useActiveUsersStore();

  useEffect(() => {
    initializeSocket();
  }, [initializeSocket]);

  return (
    <nav className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-900 relative z-30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                {item.name}
              </Link>
            ))}

            {/* Dark mode switch */}
            <div className="flex items-center pl-4 space-x-4">
              <Switch checked={theme === "dark"} onChange={toggleTheme}>
                <span className="sr-only">Toggle dark mode</span>
                {theme === "dark" ? (
                  <MoonIcon className="h-4 w-4 text-gray-300" />
                ) : (
                  <SunIcon className="h-4 w-4 text-gray-300" />
                )}
              </Switch>

              {/* Active Users Counter */}
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <span>현재 접속자:</span>
                <span>{activeUsers}</span>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden">
            <Menu as="div" className="relative inline-block text-left">
              <div className="flex items-center space-x-2">
                {/* Active Users Counter for mobile */}
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <UserGroupIcon className="h-4 w-4 mr-1" />
                  <span>{activeUsers}</span>
                </div>

                {/* Dark mode switch for mobile */}
                <Switch checked={theme === "dark"} onChange={toggleTheme}>
                  <span className="sr-only">Toggle dark mode</span>
                  {theme === "dark" ? (
                    <MoonIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  ) : (
                    <SunIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  )}
                </Switch>

                <Menu.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500 dark:focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                </Menu.Button>
              </div>

              <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-950 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                {navigation.map((item) => (
                  <Menu.Item key={item.name}>
                    {({ active }) => (
                      <Link
                        href={item.href}
                        className={clsx(
                          "block px-4 py-2 text-sm",
                          active || pathname === item.href
                            ? "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white"
                            : "text-gray-600 dark:text-gray-400"
                        )}
                      >
                        {item.name}
                      </Link>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Menu>
          </div>
        </div>
      </div>
    </nav>
  );
}
