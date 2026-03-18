'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { ShoppingBag, ChevronLeft, ShieldCheck, Zap, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { productId } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        const docRef = doc(db, 'products', productId as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isProcessing) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, customerEmail: email }),
      });

      const data = await response.json();
      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
      } else {
        alert('Fout bij het aanmaken van de betaling: ' + data.error);
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Er is een fout opgetreden bij het verwerken van je bestelling.');
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-4">Product niet gevonden.</h1>
          <button onClick={() => router.back()} className="text-blue-500 font-bold hover:underline">Ga terug</button>
        </div>
      </div>
    );
  }

  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans pb-20">
      <div className="max-w-4xl mx-auto px-6 pt-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 font-bold text-sm mb-8 hover:text-gray-600 transition-colors"
        >
          <ChevronLeft size={16} /> Terug naar winkel
        </button>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="relative aspect-square bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100">
              {product.imageUrl ? (
                <Image 
                  src={product.imageUrl} 
                  alt={product.title} 
                  fill 
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-blue-500 bg-blue-50">
                  <ShoppingBag size={64} />
                </div>
              )}
              {discount > 0 && (
                <div className="absolute top-6 right-6 bg-red-500 text-white px-4 py-2 rounded-full font-black text-sm shadow-lg">
                  -{discount}% KORTING
                </div>
              )}
            </div>

            <div className="px-2">
              <div className="flex items-center gap-1 text-orange-400 mb-2">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                <span className="text-gray-400 text-xs font-bold ml-2">4.9/5 (128 reviews)</span>
              </div>
              <h1 className="text-3xl font-black mb-4 tracking-tight leading-tight">{product.title}</h1>
              <p className="text-gray-500 font-medium leading-relaxed mb-6">
                {product.description}
              </p>
              
              <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-green-50 text-green-500 rounded-lg flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Veilige Betaling</p>
                  <p className="text-sm font-bold">100% Tevredenheidsgarantie</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Checkout Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 sticky top-8"
          >
            <div className="mb-8">
              <p className="text-xs font-black text-gray-300 uppercase tracking-[0.2em] mb-2">Totaalbedrag</p>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-black tracking-tighter">€{product.price.toFixed(2)}</span>
                {product.oldPrice && (
                  <span className="text-xl text-gray-300 font-bold line-through">€{product.oldPrice.toFixed(2)}</span>
                )}
              </div>
            </div>

            <form onSubmit={handleCheckout} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">
                  E-mailadres voor levering
                </label>
                <input 
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jouw@email.nl"
                  className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-lg"
                />
              </div>

              <button 
                type="submit"
                disabled={isProcessing}
                className="w-full py-6 bg-[#007AFF] text-white rounded-2xl font-black text-xl shadow-2xl shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Nu Afrekenen <Zap size={20} fill="currentColor" /></>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-50 text-center">
              <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-4">Betaal veilig met</p>
              <div className="flex items-center justify-center gap-4 opacity-30 grayscale">
                <Image src="https://picsum.photos/seed/ideal/100/40" alt="iDEAL" width={40} height={16} className="object-contain" />
                <Image src="https://picsum.photos/seed/bancontact/100/40" alt="Bancontact" width={50} height={16} className="object-contain" />
                <Image src="https://picsum.photos/seed/visa/100/40" alt="Visa" width={40} height={16} className="object-contain" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
