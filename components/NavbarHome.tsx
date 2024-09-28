"use client";

import React from "react";
import {Navbar, NavbarBrand, NavbarMenuToggle, NavbarMenuItem, NavbarMenu, NavbarContent, NavbarItem, Link, Button} from "@nextui-org/react";
import {AcmeLogo} from "./AcmeLogo";
import { useSignOut } from "@/app/authtool/access/signOut"; // Import the custom hook
import { useRouter } from "next/navigation";

export default function NavbarHome({mfaVerified}: {mfaVerified : boolean}) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { signOut } = useSignOut(); // Use the custom sign-out hook
  const router = useRouter();

  function redirectDashboard() {
    router.push('/dashboard');
  }

  const menuItems = [
    "About",    
    "Docs",
    "Pricing",
    "Login",
    "Sign Up",
    "Sign Out",
  ];

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
            <Button color="warning" className="mr-2" variant="light" onClick={signOut}>
              Sign Out
            </Button>
            <Button color="success" variant="solid" onClick={redirectDashboard}>
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
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              className="w-full"
              href="#"
              size="lg"
            >
              {item}
            </Link>
            
          </NavbarMenuItem>
        ))}
        {/* Sign Out link in mobile menu */}
        {mfaVerified ? (
          <NavbarMenuItem>
            <Button className="w-full text-red-500" onClick={signOut}>
              Sign Out
            </Button>
          </NavbarMenuItem>
        ) : (
          <div>
            <NavbarMenuItem>
              <Link href="/sign-in" className="w-full" color="primary">
                Log In
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link href="/sign-up" className="w-full" color="success">
                Sign Up
              </Link>
            </NavbarMenuItem>
          </div>
        )}
        {/* Sign Out and Dashboard buttons in mobile menu */}
         {/* Dashboard button at the bottom of the mobile menu */}
         {mfaVerified && (
          <div className="absolute bottom-4 left-0 w-full px-4">
            <Button color="success" className="w-full" variant="solid" onClick={redirectDashboard}>
              Dashboard
            </Button>
          </div>
        )}
      </NavbarMenu>
    </Navbar>
  );
}    