'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Zap, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { auth, signInWithGoogle } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-[#007AFF] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Zap size={24} fill="currentColor" />
          </div>
          <span className="text-2xl font-bold tracking-tight">FanLinky.nl</span>
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <Link 
              href="/dashboard" 
              className="px-6 py-2.5 bg-[#1A1A1A] text-white rounded-full font-medium hover:bg-black transition-all"
            >
              Dashboard
            </Link>
          ) : (
            <button 
              onClick={signInWithGoogle}
              className="px-6 py-2.5 bg-[#1A1A1A] text-white rounded-full font-medium hover:bg-black transition-all"
            >
              Inloggen
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 pt-20 pb-32 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[0.9]">
            Verkoop je digitale <br />
            <span className="text-[#007AFF]">producten in 5 minuten.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto mb-12 font-medium">
            De ultieme Link-in-Bio storefront voor Nederlandse creators. 
            Geoptimaliseerd voor iDEAL, Bancontact en Apple Pay via Mollie.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={signInWithGoogle}
              className="w-full sm:w-auto px-8 py-4 bg-[#007AFF] text-white rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              Start je winkel <ArrowRight size={20} />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-colors">
              Bekijk demo
            </button>
          </div>
        </motion.div>

        {/* Mockup */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-24 relative max-w-md mx-auto"
        >
          <div className="bg-white rounded-[3rem] p-4 shadow-2xl border-[8px] border-black aspect-[9/19] overflow-hidden">
            <div className="bg-gray-50 h-full rounded-[2rem] p-6 flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full mb-4" />
              <div className="h-4 w-32 bg-gray-200 rounded-full mb-2" />
              <div className="h-3 w-48 bg-gray-100 rounded-full mb-8" />
              
              <div className="w-full space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                      <ShoppingBag size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="h-3 w-24 bg-gray-100 rounded-full mb-2" />
                      <div className="h-2 w-16 bg-gray-50 rounded-full" />
                    </div>
                    <div className="h-6 w-12 bg-gray-100 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full" />
        </motion.div>
      </section>

      {/* Features */}
      <section className="bg-white py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                <Globe size={24} />
              </div>
              <h3 className="text-2xl font-bold">Lokaal Gefocust</h3>
              <p className="text-gray-500 leading-relaxed">
                Volledig ondersteuning voor iDEAL en Bancontact. Geen gedoe met internationale betaalmethoden die je klanten niet gebruiken.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-2xl font-bold">BTW Berekening</h3>
              <p className="text-gray-500 leading-relaxed">
                Automatische BTW-berekening voor Nederlandse ondernemers. Transparant voor jou en je klanten.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                <Zap size={24} />
              </div>
              <h3 className="text-2xl font-bold">Direct Toegang</h3>
              <p className="text-gray-500 leading-relaxed">
                Klanten krijgen direct toegang tot hun downloads na een succesvolle iDEAL betaling. Geen wachttijden.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 max-w-7xl mx-auto border-t border-gray-100 text-center">
        <p className="text-gray-400 font-medium">
          &copy; 2024 FanLinky.nl. Gemaakt voor Nederlandse Creators.
        </p>
      </footer>
    </div>
  );
}
