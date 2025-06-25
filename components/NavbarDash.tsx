"use client";

import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarMenuToggle,
  NavbarMenuItem,
  NavbarMenu,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
} from "@nextui-org/react";
import { Settings } from "lucide-react"   
import { AcmeLogo } from "./AcmeLogo";
import { useSignOut } from "@/lib/signOut"; // Custom sign-out hook

export default function NavbarDash({ mfaVerified }: { mfaVerified: boolean }) {
  const { signOut } = useSignOut(); // Use the custom sign-out hook
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = [
    "Settings",
    "Sign Out",
  ];

  return (
    <Navbar
      isBordered
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
    >
      {/* Mobile View: Left Side - Menu Toggle */}
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle aria-label={isMenuOpen ? "Close menu" : "Open menu"} />
      </NavbarContent>

      {/* Centered Brand Logo for Mobile */}
      <NavbarContent className="sm:hidden pr-3" justify="center">
        <NavbarBrand>
          <AcmeLogo />
        </NavbarBrand>
      </NavbarContent>

      {/* Desktop View: Centered Menu Items */}
      <NavbarContent className="hidden sm:flex gap-6" justify="center">
        <NavbarBrand>
          <AcmeLogo />
        </NavbarBrand>
      </NavbarContent>

      

      {/* right-hand actions (desktop) */}
      <NavbarContent justify="end" className="items-center gap-4">
        {mfaVerified && (
          <NavbarItem className="hidden lg:flex">
            {/* gear icon → settings page */}
            <Link href="/settings/plan" aria-label="Settings">
              <Settings size={20} />             {/* <-- icon visible now */}
            </Link>
          </NavbarItem>
        )}

        {!mfaVerified && (
          <NavbarItem className="hidden lg:flex">
            <Link href="/sign-in">Login</Link>
          </NavbarItem>
        )}

        <NavbarItem>
          {mfaVerified ? (
            <Button color="warning" variant="flat" onPress={signOut}>
              Sign Out
            </Button>
          ) : (
            <Button as={Link} color="warning" href="/sign-up" variant="flat">
              Sign Up
            </Button>
          )}
        </NavbarItem>
      </NavbarContent>

      {/* mobile off-canvas menu */}
      <NavbarMenu>
        {menuItems.map((item) => {
          const href =
            item === "Sign Out"
              ? "#"
              : item === "Settings"
              ? "/settings/plan"
              : `/${item.toLowerCase()}`

          return (
            <NavbarMenuItem key={item}>
              <Link
                className="w-full"
                color={item === "Sign Out" ? "danger" : "foreground"}
                href={href}
                onClick={item === "Sign Out" ? signOut : undefined}
              >
                {item}
              </Link>
            </NavbarMenuItem>
          )
        })}
      </NavbarMenu>
    </Navbar>
  );
}
