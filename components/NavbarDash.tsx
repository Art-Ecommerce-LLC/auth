"use client";

// TODO: FIX Upgrade to plus so that you can upgrade from base to plus just by paying the difference
// TODO: Add the permit dashbaord and reload all permits
// TODO: Upgrade UI to production quality
// TODO: Change email smtp to no reply emails.

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
import { Settings } from "lucide-react";
import { usePathname } from "next/navigation";   // ← NEW
import { AcmeLogo } from "./AcmeLogo";
import { useRouter } from "next/navigation";
import { useSignOut } from "@/lib/signOut";

export default function NavbarDash({ mfaVerified }: { mfaVerified: boolean }) {
  const pathname = usePathname();                // ← NEW
  const onSettingsPage = pathname.startsWith("/settings");
  const { signOut } = useSignOut();
  const router = useRouter();
  
    function redirectDashboard() {
      router.push('/dashboard');
    }
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  /* ------------------------------------------------------------- */
  /*  mobile menu items – keep Dashboard & Settings both visible   */
  /* ------------------------------------------------------------- */
  const menuItems = ["Dashboard", "Settings", "Sign Out"];

  return (
    <Navbar isBordered isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen}>
      {/* Mobile: hamburger (left) + logo (center) */}
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        />
      </NavbarContent>
      <NavbarContent className="sm:hidden pr-3" justify="center">
        <NavbarBrand>
          <AcmeLogo />
        </NavbarBrand>
      </NavbarContent>

      {/* Desktop: brand centred */}
      <NavbarContent className="hidden sm:flex gap-6" justify="center">
        <NavbarBrand>
          <AcmeLogo />
        </NavbarBrand>
      </NavbarContent>

      {/* Right-hand actions (desktop) */}
      <NavbarContent justify="end" className="items-center gap-4">
        {mfaVerified && onSettingsPage && (            /* ← NEW block */
          <NavbarItem className="hidden lg:flex">
            <Button color="success" variant="solid" onPress={redirectDashboard}>
                          Dashboard
              </Button>
          </NavbarItem>
        )}

        {mfaVerified && (
          <NavbarItem className="hidden lg:flex">
            <Link href="/settings/plan" aria-label="Settings">
              <Settings size={20} />
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

      {/* Mobile off-canvas */}
      <NavbarMenu>
        {menuItems.map((item) => {
          const href =
            item === "Sign Out"
              ? "#"
              : item === "Settings"
              ? "/settings/plan"
              : `/${item.toLowerCase()}`;

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
          );
        })}
      </NavbarMenu>
    </Navbar>
  );
}
