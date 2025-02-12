"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  SunIcon,
  MoonIcon,
  UserGroupIcon,
  UserCircleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { clsx } from "clsx";
import Switch from "../common/Switch";
import { useTheme } from "@/providers/ThemeProvider";
import Logo from "@/components/common/Logo";
import useActiveUsersStore from "@/store/useActiveUsersStore";
import useAuthStore from "@/store/useAuthStore";

const navigation = [
  { name: "실시간 김프", href: "/premium" },
  { name: "코코아 뉴스", href: "/news" },
  { name: "송금 계산기", href: "/withdraw" },
  { name: "국내 KOL 목록", href: "/kol" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { count: activeUsers, initializeSocket } = useActiveUsersStore();
  const { user, isAuthenticated } = useAuthStore();

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

          {/* Desktop Navigation (lg 이상에서만 표시) */}
          <div className="hidden lg:ml-6 lg:flex lg:items-center lg:space-x-4">
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

              {/* User Menu or Login Button */}
              {isAuthenticated ? (
                <Menu as="div" className="relative">
                  <Menu.Button
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium 
                                        text-gray-700 dark:text-gray-200 hover:bg-gray-100 
                                        dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <UserCircleIcon className="h-5 w-5" />
                    <span>{user?.name}</span>
                    <ChevronDownIcon className="h-4 w-4" />
                  </Menu.Button>

                  <Transition
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items
                      className="absolute right-0 mt-2 w-48 rounded-lg bg-white 
                                         dark:bg-gray-950 shadow-lg border border-gray-200 
                                         dark:border-gray-800 py-1"
                    >
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/profile"
                            className={`block px-4 py-2 text-sm ${
                              active
                                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                                : "text-gray-700 dark:text-gray-200"
                            }`}
                          >
                            프로필
                          </Link>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              ) : (
                <Link
                  href="/signin"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 
                           hover:bg-green-700 rounded-lg transition-colors"
                >
                  로그인
                </Link>
              )}
            </div>
          </div>

          {/* Mobile & Tablet menu button */}
          <div className="lg:hidden">
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

                {/* Login/Profile button for mobile */}
                {isAuthenticated ? (
                  <Menu as="div" className="relative">
                    <Menu.Button
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 
                                         dark:hover:bg-gray-800 rounded-lg"
                    >
                      <UserCircleIcon className="h-5 w-5" />
                    </Menu.Button>
                    <Transition
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items
                        className="absolute right-0 mt-2 w-48 rounded-lg bg-white 
                                           dark:bg-gray-950 shadow-lg border border-gray-200 
                                           dark:border-gray-800 py-1"
                      >
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="/profile"
                              className={`block px-4 py-2 text-sm ${
                                active
                                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                                  : "text-gray-700 dark:text-gray-200"
                              }`}
                            >
                              프로필
                            </Link>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <Link
                    href="/signin"
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 
                             dark:hover:bg-gray-800 rounded-lg"
                  >
                    <UserCircleIcon className="h-5 w-5" />
                  </Link>
                )}

                {/* Hamburger menu button */}
                <Menu.Button
                  className="inline-flex items-center justify-center rounded-md p-2 
                                      text-gray-600 dark:text-gray-400 hover:bg-gray-100 
                                      dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white 
                                      focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500 
                                      dark:focus:ring-white"
                >
                  <span className="sr-only">Open main menu</span>
                  <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                </Menu.Button>
              </div>

              {/* Mobile menu items */}
              <Menu.Items
                className="absolute right-0 mt-2 w-48 origin-top-right rounded-md 
                                   bg-white dark:bg-gray-950 py-1 shadow-lg ring-1 ring-black 
                                   ring-opacity-5 focus:outline-none z-10"
              >
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
