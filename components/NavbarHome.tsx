"use client";

import React from "react";
import {Navbar, NavbarBrand, NavbarMenuToggle, NavbarMenuItem, NavbarMenu, NavbarContent, NavbarItem, Link, Button} from "@heroui/react";
import {AcmeLogo} from "./AcmeLogo";
import { useSignOut } from "@/lib/signOut"; // Import the custom hook
import { useRouter } from "next/navigation";

export default function NavbarHome({mfaVerified}: {mfaVerified : boolean}) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { signOut } = useSignOut(); // Use the custom sign-out hook
  const router = useRouter();

  function redirectDashboard() {
    router.push('/dashboard');
  }

  const menuItems : Record<string,string> = {
    "About" : "/about",    
    "Docs" : "/docs",
    "Pricing" : "/pricing",
    "Login" : "/sign-in",
    "Sign Up"  : "/sign-up",
};  

  // take ou tlogin and signup if mfaVerified and add signout
  if (mfaVerified) {
    // remove login and signup
    delete menuItems["Login"];
    delete menuItems["Sign Up"];
  }

  return (
    <Navbar
      isBordered
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      className="bg-white shadow-sm h-[4rem]"
      position="static"
    >
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle aria-label={isMenuOpen ? "Close menu" : "Open menu"} />
      </NavbarContent>

      <NavbarContent className="sm:hidden lg:pr-3" justify="center">
        <NavbarBrand >
          <AcmeLogo />
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarBrand>
          <AcmeLogo />
        </NavbarBrand>
        <NavbarItem>
          <Link color="foreground" href="#">
            About
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="#" aria-current="page">
            Docs
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#">
            Pricing
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end" className="hidden sm:flex">
        {/* Conditional rendering based on mfaVerified */}
        {!mfaVerified && (
          <NavbarItem className="lg:flex">
            <Link href="/sign-in">Login</Link>
          </NavbarItem>
        )}
        {mfaVerified ? (
          <div>
            <Button color="warning" className="mr-2" variant="light" onPress={signOut}>
              Sign Out
            </Button>
            <Button color="success" variant="solid" onPress={redirectDashboard}>
              Dashboard
            </Button>
          </div>
        ) : (
          <Button as={Link} color="warning" href="/sign-up" variant="flat">
            Sign Up
          </Button>
        )}
      </NavbarContent>

      <NavbarMenu>
        {Object.keys(menuItems).map((item: string, index: number) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            { item === "Sign Up" ? (
            <Link className="w-full" href={menuItems[item]} style={{ color: "green" }} size="lg">
              Sign Up
            </Link>
          ) : (
            <Link className="w-full" href={menuItems[item]} size="lg">
              {item}
            </Link>
          )}
        </NavbarMenuItem>
        ))}
         {mfaVerified && (
          <div className="absolute bottom-4 left-0 w-full px-4">
            <Button color="warning" className="w-full mb-2" variant="ghost" onPress={signOut}>
              Sign Out
            </Button>
            <Button color="success" className="w-full" variant="solid" onPress={redirectDashboard}>
              Dashboard
            </Button>
          </div>
        )}
      </NavbarMenu>
    </Navbar>
  );
}    