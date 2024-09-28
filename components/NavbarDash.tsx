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
import { AcmeLogo } from "./AcmeLogo";
import { useSignOut } from "@/app/authtool/access/signOut"; // Custom sign-out hook

export default function NavbarDash({ mfaVerified }: { mfaVerified: boolean }) {
  const { signOut } = useSignOut(); // Use the custom sign-out hook
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = [
    "Projects",
    "Clients",
    "Analytics",
    "Documentation",
    "Team",
    "My Settings",
    "Support",
    "Log Out",
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
        <NavbarItem>
          <Link color="foreground" href="#">
            Projects
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="#" aria-current="page">
            Clients
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#">
            Analytics
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="#">
            Documentation
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="#">
            Team
          </Link>
        </NavbarItem>
      </NavbarContent>

      {/* Right Side: Sign In/Sign Out Conditional */}
      <NavbarContent justify="end">
        {!mfaVerified && (
          <NavbarItem className="hidden lg:flex">
            <Link href="/sign-in">Login</Link>
          </NavbarItem>
        )}
        <NavbarItem>
          {mfaVerified ? (
            <Button color="warning" variant="flat" onClick={signOut}>
              Sign Out
            </Button>
          ) : (
            <Button as={Link} color="warning" href="/sign-up" variant="flat">
              Sign Up
            </Button>
          )}
        </NavbarItem>
      </NavbarContent>

      {/* Mobile Menu: Off-canvas */}
      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              className="w-full"
              color={index === menuItems.length - 1 ? "danger" : "foreground"}
              href={item === "Log Out" ? "#" : `/${item.toLowerCase()}`}
              size="lg"
              onClick={item === "Log Out" ? signOut : undefined}
            >
              {item}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}
