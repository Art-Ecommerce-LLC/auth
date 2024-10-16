"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export function NavbarClient({ isAuth }: { isAuth: boolean }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Run this only in client-side
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        // Clean up when component is unmounted or menu state changes
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isMobileMenuOpen]); // Run when `isMobileMenuOpen` changes

    return (
        <nav className="flex items-center justify-between bg-primary p-4 shadow relative z-20">
            <div className="flex items-center z-30">
                <Link href="/">
                    <span className="text-2xl font-bold text-white">Art Ecommerce Auth</span>

                </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden custom-md:flex items-center space-x-4 custom-md:space-x-8 mr-8">
                <Link
                    href="/"
                    className="text-white hover:bg-white hover:text-[var(--hover-text-color)] transition-colors duration-300 ease-in-out px-4 py-2 rounded-md"
                >
                    Home
                </Link>
                <Link
                    href="/about"
                    className="text-white hover:bg-white hover:text-[var(--hover-text-color)] transition-colors duration-300 ease-in-out px-4 py-2 rounded-md"
                >
                    About
                </Link>
                <Link
                    href="/pricing"
                    className="text-white hover:bg-white hover:text-[var(--hover-text-color)] transition-colors duration-300 ease-in-out px-4 py-2 rounded-md"
                >
                    Pricing
                </Link>
                {isAuth ? (
                    <Link
                        href="/dashboard"
                        className="text-white hover:bg-white hover:text-[var(--hover-text-color)] transition-colors duration-300 ease-in-out px-4 py-2 rounded-md"
                    >
                        Dashboard
                    </Link>
                ) : (
                    <Link
                        href="/sign-in"
                        className="text-white hover:bg-white hover:text-[var(--hover-text-color)] transition-colors duration-300 ease-in-out px-4 py-2 rounded-md"
                    >
                        Sign In
                    </Link>
                )}
            </div>

            {/* Mobile Menu Button */}
            <div className="custom-md:hidden flex items-center z-30 ">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="text-white focus:outline-none"
                >
                    <div className="relative w-8 h-6 flex items-center justify-center">
                        <div
                            className={`absolute h-0.5 w-6 bg-white transform transition-transform duration-300 ease-in-out ${
                                isMobileMenuOpen ? 'rotate-45' : '-translate-y-2'
                            }`}
                        />
                        <div
                            className={`absolute h-0.5 w-6  bg-white transform transition-opacity duration-300 ease-in-out ${
                                isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                            }`}
                        />
                        <div
                            className={`absolute h-0.5 w-6  bg-white transform transition-transform duration-300 ease-in-out ${
                                isMobileMenuOpen ? '-rotate-45' : 'translate-y-2'
                            }`}
                        />
                    </div>
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 top-[70px] w-full h-[calc(100%-70px)] bg-white z-999 flex flex-col justify-center items-center overflow-hidden custom-md:hidden">
                    <Link
                        href="/"
                        className="w-full text-center text-xl py-4 border-b border-black last:border-none hover:bg-[var(--navbar-hover-background-color)] hover:text-blue-500 transition-colors duration-300 ease-in-out"
                    >
                        Home
                    </Link>
                    <Link
                        href="/about"
                        className="w-full text-center text-xl py-4 border-b border-black last:border-none hover:bg-[var(--navbar-hover-background-color)] hover:text-blue-500 transition-colors duration-300 ease-in-out"
                    >
                        About
                    </Link>
                    <Link
                        href="/pricing"
                        className="w-full text-center text-xl py-4 border-b border-black last:border-none hover:bg-[var(--navbar-hover-background-color)] hover:text-blue-500 transition-colors duration-300 ease-in-out"
                    >
                        Pricing
                    </Link>
                    {isAuth ? (
                    <Link
                        href="/dashboard"
                        className="text-white hover:bg-white hover:text-[var(--hover-text-color)] transition-colors duration-300 ease-in-out px-4 py-2 rounded-md"
                    >
                        Dashboard
                    </Link>
                ) : (
                    <Link
                        href="/sign-in"
                        className="text-white hover:bg-white hover:text-[var(--hover-text-color)] transition-colors duration-300 ease-in-out px-4 py-2 rounded-md"
                    >
                        Sign In
                    </Link>
                )}
                </div>
            )}
        </nav>
    );
};


