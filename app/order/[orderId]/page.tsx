'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, Clock, Download, ArrowLeft, Zap } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function OrderStatus() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const unsubscribe = onSnapshot(doc(db, 'orders', orderId as string), async (snapshot) => {
      if (snapshot.exists()) {
        const orderData = snapshot.data();
        setOrder(orderData);

        const productDoc = await getDoc(doc(db, 'products', orderData.productId));
        if (productDoc.exists()) {
          setProduct(productDoc.data());
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-4">Bestelling niet gevonden.</h1>
          <Link href="/" className="text-blue-500 font-bold hover:underline">Terug naar home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 text-center"
      >
        {order.status === 'paid' ? (
          <>
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h1 className="text-3xl font-bold mb-2">Bedankt voor je aankoop!</h1>
            <p className="text-gray-500 font-medium mb-8">
              Je betaling is succesvol verwerkt. Je hebt nu toegang tot je product.
            </p>

            <div className="bg-gray-50 p-6 rounded-2xl mb-8 text-left border border-gray-100">
              <h3 className="font-bold text-lg mb-1">{product?.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{product?.description}</p>
              
              {product?.type === 'digital_download' && (
                <a 
                  href={product.fileUrl} 
                  target="_blank"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#1A1A1A] text-white rounded-xl font-bold hover:bg-black transition-all"
                >
                  <Download size={20} /> Download Nu
                </a>
              )}
              {product?.type === 'coaching' && (
                <div className="p-4 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm text-center">
                  De creator neemt contact met je op via {order.customerEmail}.
                </div>
              )}
            </div>
          </>
        ) : order.status === 'open' ? (
          <>
            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock size={40} className="animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Betaling in afwachting...</h1>
            <p className="text-gray-500 font-medium mb-8">
              We wachten op bevestiging van je bank. Dit duurt meestal enkele seconden.
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={40} />
            </div>
            <h1 className="text-3xl font-bold mb-2">Betaling mislukt.</h1>
            <p className="text-gray-500 font-medium mb-8">
              Er is iets misgegaan bij het verwerken van je betaling. Probeer het opnieuw.
            </p>
            <Link 
              href={`/api/checkout`} // This is a bit tricky, maybe just back to storefront
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#1A1A1A] text-white rounded-xl font-bold hover:bg-black transition-all"
            >
              Opnieuw Proberen
            </Link>
          </>
        )}

        <div className="flex flex-col gap-3">
          <Link 
            href="/" 
            className="text-gray-400 font-bold text-sm hover:text-gray-600 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} /> Terug naar de winkel
          </Link>
          <div className="pt-8 flex items-center justify-center gap-2 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            <Zap size={12} className="text-blue-500" fill="currentColor" />
            Beveiligd door Standaard
          </div>
        </div>
      </motion.div>
    </div>
  );
}
