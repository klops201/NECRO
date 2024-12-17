'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const leftModules = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
  },
  {
    id: 'chat',
    label: 'Chat me',
    href: '/chat',
  },
  {
    id: 'dancemacabre',
    label: 'Danse Macabre',
    href: '/dance',
  },
];

const rightModules = [
  {
    id: 'pump',
    label: 'Pump.fun',
    href: "https://pump.fun/profile/...",
    external: true
  },
  {
    id: 'twitter',
    label: 'Twitter',
    href: "https://x.com/...",
    external: true
  }
];

// Combine modules for mobile menu
const allModules = [...leftModules, ...rightModules];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-black/80 backdrop-blur-xl border-b border-red-500/20"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {leftModules.map((module) => (
                <motion.div key={module.id} whileHover={{ scale: 1.05 }}>
                  <Link
                    href={module.href}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors group"
                  >
                    <span className="text-red-400 text-sm">
                      {module.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Center Logo */}
            <motion.div 
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-2xl font-bold text-red-400">$Necro</span>
              <div className="hidden md:block h-6 w-px bg-red-500/20" />
              <span className="hidden md:block text-red-400/70 text-sm">HODL till grave</span>
            </motion.div>

            {/* Right Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {rightModules.map((module) => (
                <motion.div key={module.id} whileHover={{ scale: 1.05 }}>
                  <a
                    href={module.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors group"
                  >
                    <span className="text-red-400 text-sm">
                      {module.label}
                    </span>
                  </a>
                </motion.div>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="lg:hidden p-2 rounded-lg hover:bg-red-500/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="text-red-400 text-2xl">
                {isMobileMenuOpen ? '✕' : '☰'}
              </span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden bg-black/95 backdrop-blur-xl border-b border-red-500/20"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
              {allModules.map((module) => (
                <motion.div
                  key={module.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* {module.external ? (
                    <a
                      href={module.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-500/10 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-red-400">{module.label}</span>
                    </a>
                  ) : (
                    <Link
                      href={module.href}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-500/10 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-red-400">{module.label}</span>
                    </Link>
                  )} */}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
