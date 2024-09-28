// pages/index.js (Client Component)
"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ChatIcon, ShieldCheckIcon } from '@heroicons/react/solid';

export default function HomeComponent() {
  // Function to adjust hero section height
  return (
    <main>
      <section className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <motion.div
          className="text-center p-10 text-white align-bottom"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
       
        >
          <h1 className="text-5xl font-bold mb-4">
            Welcome to Developer Hub
          </h1>
          <p className="text-lg mb-8">
            The ultimate platform for developers and project managers to streamline project delivery and collaboration.
          </p>
          <div className="space-x-4">
            <Link href="/sign-up" className="bg-white text-indigo-500 px-6 py-3 rounded-lg font-semibold shadow-lg">
              Get Started
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white text-black">
        <div className="container mx-auto text-center">
          <motion.h2
            className="text-4xl font-bold mb-12"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            Why Choose Developer Hub?
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <motion.div
              className="p-6 border rounded-lg shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <CheckCircleIcon className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-4">Project Management</h3>
              <p>
                Organize, track, and manage your development projects efficiently with intuitive tools.
              </p>
            </motion.div>
            <motion.div
              className="p-6 border rounded-lg shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChatIcon className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-4">Collaboration Tools</h3>
              <p>
                Real-time communication and version control to ensure seamless collaboration between teams.
              </p>
            </motion.div>
            <motion.div
              className="p-6 border rounded-lg shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShieldCheckIcon className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-4">Secure & Reliable</h3>
              <p>
                Keep your data safe with industry-leading security protocols and multi-factor authentication.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto text-center">
          <motion.h2
            className="text-4xl font-bold mb-12"
            initial={{ opacity: 0, y: -50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            What Our Users Say
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <motion.div
              className="p-6 border rounded-lg shadow-lg"
              whileHover={{ scale: 1.05 }}
            >
              <p>
                "Developer Hub has revolutionized the way our team works together. It's the perfect tool for keeping everyone on track!"
              </p>
              <p className="mt-4 text-sm font-semibold">- Jane Doe, Senior Developer</p>
            </motion.div>
            <motion.div
              className="p-6 border rounded-lg shadow-lg"
              whileHover={{ scale: 1.05 }}
            >
              <p>
                "The real-time collaboration features are top-notch. We've seen a 30% increase in our project delivery speed!"
              </p>
              <p className="mt-4 text-sm font-semibold">- John Smith, Project Manager</p>
            </motion.div>
            <motion.div
              className="p-6 border rounded-lg shadow-lg"
              whileHover={{ scale: 1.05 }}
            >
              <p>
                "I love the intuitive design and the secure environment. It helps us work better without worrying about security."
              </p>
              <p className="mt-4 text-sm font-semibold">- Sarah Lee, Software Engineer</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-500 text-white text-center">
        <motion.div
          className="container mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold mb-6">
            Ready to Elevate Your Development?
          </h2>
          <p className="text-lg mb-8">
            Sign up today and transform how you deliver projects as a developer or project manager.
          </p>
          <Link href="/sign-up" className="bg-white text-indigo-500 px-8 py-4 rounded-lg font-semibold shadow-lg">
            Sign Up Now
          </Link>
        </motion.div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-800 text-gray-400 py-10">
        <div className="container mx-auto text-center space-y-6">
          <div className="space-x-4">
            <Link href="/terms-of-service" className="hover:text-white">Terms of Service</Link>
            <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-white">Contact Us</Link>
          </div>
          <p>&copy; 2024 Art Ecommerce, LLC. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
