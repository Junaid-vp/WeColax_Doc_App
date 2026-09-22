'use client';

import { motion } from 'framer-motion';
import { Home, FileText, Image as ImageIcon, Users, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function FloatingDock() {
  const pathname = usePathname();

  const links = [
    { href: '/', icon: Home, label: 'Dashboard' },
    { href: '/docs', icon: FileText, label: 'Vault' },
    { href: '/assets', icon: ImageIcon, label: 'Assets' },
    { href: '/influencers', icon: Users, label: 'Influencers' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[calc(100vw-2rem)] sm:max-w-max px-2">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-2xl bg-white/70 backdrop-blur-2xl border border-slate-200 shadow-xl justify-between sm:justify-center w-full"
      >
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          
          return (
            <Link key={link.href} href={link.href} className="flex-1 sm:flex-none">
              <motion.div
                whileHover={{ scale: 1.1, y: -4 }}
                whileTap={{ scale: 0.9 }}
                className={`relative p-2 sm:p-3 rounded-xl flex items-center justify-center transition-colors group ${
                  isActive ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
                }`}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                
                {/* Tooltip */}
                <div className="absolute -top-10 scale-0 sm:group-hover:scale-100 transition-transform bg-white/90 text-slate-800 shadow-md text-xs py-1 px-2 rounded-md border border-slate-200 whitespace-nowrap hidden sm:block">
                  {link.label}
                </div>

                {isActive && (
                  <motion.div
                    layoutId="dock-indicator"
                    className="absolute -bottom-1 w-1 h-1 bg-purple-600 rounded-full"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}

        <div className="w-[1px] h-6 sm:h-8 bg-slate-200 mx-0.5 sm:mx-1 shrink-0" />

        {/* Logout Button */}
        <form action="/api/auth/logout" method="POST" className="flex-1 sm:flex-none">
          <motion.button
            whileHover={{ scale: 1.1, y: -4 }}
            whileTap={{ scale: 0.9 }}
            type="submit"
            className="relative p-2.5 sm:p-3 rounded-xl flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors group cursor-pointer border-0 outline-none"
          >
            <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
            <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-white/90 text-slate-800 shadow-md text-xs py-1 px-2 rounded-md border border-slate-200 whitespace-nowrap">
              Log Out
            </div>
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
