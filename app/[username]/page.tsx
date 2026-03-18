'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { motion } from 'motion/react';
import { ShoppingBag, Globe, Zap, CreditCard, ChevronRight, Video, Download, Repeat, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function Storefront() {
  const { username } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStorefront = async () => {
      try {
        const userQuery = query(collection(db, 'users'), where('username', '==', username), limit(1));
        const userSnapshot = await getDocs(userQuery);

        if (userSnapshot.empty) {
          setError('Creator niet gevonden.');
          setLoading(false);
          return;
        }

        const userData = userSnapshot.docs[0].data();
        const userId = userSnapshot.docs[0].id;
        setProfile(userData);

        const productsQuery = query(collection(db, 'products'), where('creatorId', '==', userId));
        const productsSnapshot = await getDocs(productsQuery);
        setProducts(productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        setLoading(false);
      } catch (err) {
        console.error('Error fetching storefront:', err);
        setError('Er is iets misgegaan bij het laden van de winkel.');
        setLoading(false);
      }
    };

    if (username) {
      fetchStorefront();
    }
  }, [username]);

  const handlePurchase = (productId: string) => {
    window.location.assign(`/checkout/${productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-4">{error}</h1>
          <Link href="/" className="text-blue-500 font-bold hover:underline">Terug naar home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans pb-20">
      {/* Header */}
      <div className="max-w-md mx-auto px-6 pt-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-24 h-24 mx-auto mb-6"
        >
          <Image 
            src={profile?.photoURL || 'https://picsum.photos/seed/avatar/200/200'} 
            alt={profile?.displayName}
            fill
            className="rounded-full object-cover border-4 border-white shadow-xl"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        <h1 className="text-2xl font-bold mb-2 tracking-tight">{profile?.displayName}</h1>
        <p className="text-gray-500 font-medium mb-8 leading-relaxed">
          {profile?.bio}
        </p>
      </div>

      {/* Products */}
      <div className="max-w-md mx-auto px-4 space-y-4">
        {products.length === 0 ? (
          <div className="text-center py-12 text-gray-400 font-medium">
            Nog geen producten beschikbaar.
          </div>
        ) : (
          products.map((product, index) => (
            <motion.button
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handlePurchase(product.id)}
              className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:scale-[1.02] transition-all group text-left"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 overflow-hidden relative">
                {product.imageUrl ? (
                  <Image src={product.imageUrl} alt={product.title} fill className="object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <>
                    {product.type === 'coaching' && <Video size={24} />}
                    {product.type === 'digital_download' && <Download size={24} />}
                    {product.type === 'subscription' && <Repeat size={24} />}
                    {!['coaching', 'digital_download', 'subscription'].includes(product.type) && <ShoppingBag size={24} />}
                  </>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg leading-tight">{product.title}</h3>
                  {product.ribbon && (
                    <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm">
                      {product.ribbon}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-orange-400 mb-1">
                  {[...Array(5)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                  <span className="text-[10px] text-gray-300 font-bold ml-1">5.0</span>
                </div>
                <p className="text-gray-400 text-sm font-medium line-clamp-1">{product.description}</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">€{product.price.toFixed(2)}</div>
                <div className="text-[10px] text-gray-300 font-bold uppercase tracking-widest flex items-center gap-1 justify-end">
                  iDEAL <ChevronRight size={10} />
                </div>
              </div>
            </motion.button>
          ))
        )}
      </div>

      {/* Trust Badge */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 text-xs font-bold text-gray-400">
          <Zap size={14} className="text-blue-500" fill="currentColor" />
          Powered by Standaard | iDEAL
        </div>
      </div>
    </div>
  );
}
