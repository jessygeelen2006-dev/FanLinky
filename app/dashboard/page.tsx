'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { getMollieAuthUrl } from '@/lib/mollie';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Settings, 
  Plus, 
  ExternalLink, 
  Zap, 
  CreditCard,
  TrendingUp,
  Users,
  LogOut,
  Video,
  Download,
  Repeat
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: 0,
    oldPrice: 0,
    ribbon: '',
    type: 'digital_download',
    currency: 'EUR'
  });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        
        // Fetch profile
        const profileDoc = await getDoc(doc(db, 'users', user.uid));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data());
        } else {
          // Create profile if it doesn't exist
          const newProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            username: user.email?.split('@')[0].replace(/[^a-zA-Z0-9]/g, ''),
            bio: 'Welkom op mijn storefront!',
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, 'users', user.uid), newProfile);
          setProfile(newProfile);
        }

        // Fetch products
        const productsQuery = query(collection(db, 'products'), where('creatorId', '==', user.uid));
        const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
          setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Fetch orders
        const ordersQuery = query(collection(db, 'orders'), where('creatorId', '==', user.uid));
        const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
          setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        setLoading(false);
        return () => {
          unsubscribeProducts();
          unsubscribeOrders();
        };
      } else {
        router.push('/');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleConnectMollie = () => {
    if (user) {
      window.location.assign(`/api/auth/mollie/connect?uid=${user.uid}`);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const productRef = doc(collection(db, 'products'));
      const productData = {
        id: productRef.id,
        creatorId: user.uid,
        ...newProduct,
        createdAt: new Date().toISOString(),
      };
      await setDoc(productRef, productData);
      setIsAddingProduct(false);
      setNewProduct({
        title: '',
        description: '',
        price: 0,
        oldPrice: 0,
        ribbon: '',
        type: 'digital_download',
        currency: 'EUR'
      });
    } catch (err) {
      console.error('Error adding product:', err);
      alert('Fout bij het toevoegen van product.');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: profile.displayName,
        bio: profile.bio,
        username: profile.username,
      });
      alert('Profiel bijgewerkt!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Fout bij het bijwerken van profiel.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalRevenue = orders
    .filter(o => o.status === 'paid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 p-6 flex flex-col">
        <Link href="/" className="flex items-center gap-2 mb-12 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-[#007AFF] rounded-lg flex items-center justify-center text-white">
            <Zap size={18} fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-tight">FanLinky.nl</span>
        </Link>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
            }`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'products' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
            }`}
          >
            <ShoppingBag size={20} /> Producten
          </button>
          <button 
            onClick={() => setActiveTab('customers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'customers' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
            }`}
          >
            <Users size={20} /> Klanten
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
            }`}
          >
            <Settings size={20} /> Instellingen
          </button>
        </nav>

        <button 
          onClick={() => auth.signOut()}
          className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl font-bold transition-all"
        >
          <LogOut size={20} /> Uitloggen
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welkom terug, {user?.displayName?.split(' ')[0]}!</h1>
            <p className="text-gray-400 font-medium">Beheer je storefront en bekijk je omzet.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href={`/${profile?.username}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all"
            >
              Bekijk Storefront <ExternalLink size={16} />
            </Link>
            <button 
              onClick={() => setIsAddingProduct(true)}
              className="flex items-center gap-2 px-6 py-2 bg-[#007AFF] text-white rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-blue-500/20"
            >
              <Plus size={18} /> Nieuw Product
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-12">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp size={20} />
                </div>
                <p className="text-gray-400 font-bold text-sm uppercase tracking-wider mb-1">Netto Omzet</p>
                <h2 className="text-3xl font-bold">€{totalRevenue.toFixed(2)}</h2>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-4">
                  <ShoppingBag size={20} />
                </div>
                <p className="text-gray-400 font-bold text-sm uppercase tracking-wider mb-1">Bestellingen</p>
                <h2 className="text-3xl font-bold">{orders.length}</h2>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center mb-4">
                  <CreditCard size={20} />
                </div>
                <p className="text-gray-400 font-bold text-sm uppercase tracking-wider mb-1">Mollie Status</p>
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-bold">{profile?.mollieAccessToken ? 'Verbonden' : 'Niet verbonden'}</h2>
                  {!profile?.mollieAccessToken && (
                    <button 
                      onClick={handleConnectMollie}
                      className="text-xs bg-orange-500 text-white px-2 py-1 rounded-md font-bold hover:bg-orange-600 transition-all"
                    >
                      Verbinden
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h3 className="text-xl font-bold">Recente Bestellingen</h3>
                <button onClick={() => setActiveTab('customers')} className="text-blue-500 font-bold text-sm">Bekijk alles</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Klant</th>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Bedrag</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Datum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">
                          Nog geen bestellingen gevonden.
                        </td>
                      </tr>
                    ) : (
                      orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-bold">{order.customerEmail}</td>
                          <td className="px-6 py-4 text-gray-500">
                            {products.find(p => p.id === order.productId)?.title || 'Onbekend product'}
                          </td>
                          <td className="px-6 py-4 font-bold">€{order.amount.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              order.status === 'paid' ? 'bg-green-50 text-green-500' : 
                              order.status === 'open' ? 'bg-blue-50 text-blue-500' : 
                              'bg-red-50 text-red-500'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {new Date(order.createdAt).toLocaleDateString('nl-NL')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Je Producten</h2>
            <div className="grid grid-cols-2 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                    {product.type === 'coaching' && <Video size={24} />}
                    {product.type === 'digital_download' && <Download size={24} />}
                    {product.type === 'subscription' && <Repeat size={24} />}
                    {!['coaching', 'digital_download', 'subscription'].includes(product.type) && <ShoppingBag size={24} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{product.title}</h3>
                      {product.ribbon && (
                        <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                          {product.ribbon}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm font-medium">
                      €{product.price.toFixed(2)} 
                      {product.oldPrice > 0 && <span className="line-through ml-2 text-gray-300">€{product.oldPrice.toFixed(2)}</span>}
                      • {product.type}
                    </p>
                  </div>
                  <button className="text-gray-300 hover:text-red-500 transition-colors">
                    <LogOut size={20} className="rotate-180" />
                  </button>
                </div>
              ))}
              {products.length === 0 && (
                <div className="col-span-2 py-20 text-center text-gray-400 font-medium bg-white rounded-2xl border border-dashed border-gray-200">
                  Je hebt nog geen producten. Klik op &quot;Nieuw Product&quot; om te beginnen.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Bestellingen & Klanten</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Klant</th>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Bedrag</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Datum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">
                        Nog geen bestellingen gevonden.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-bold">{order.customerEmail}</td>
                        <td className="px-6 py-4 text-gray-500">
                          {products.find(p => p.id === order.productId)?.title || 'Onbekend product'}
                        </td>
                        <td className="px-6 py-4 font-bold">€{order.amount.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            order.status === 'paid' ? 'bg-green-50 text-green-500' : 
                            order.status === 'open' ? 'bg-blue-50 text-blue-500' : 
                            'bg-red-50 text-red-500'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {new Date(order.createdAt).toLocaleDateString('nl-NL')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-8">
            <h2 className="text-2xl font-bold">Instellingen</h2>
            <form onSubmit={handleUpdateProfile} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Naam</label>
                <input 
                  type="text" 
                  value={profile?.displayName || ''} 
                  onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Gebruikersnaam (URL)</label>
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <span className="text-gray-400 font-medium">standaard.nl/</span>
                  <input 
                    type="text" 
                    value={profile?.username || ''} 
                    onChange={(e) => setProfile({...profile, username: e.target.value})}
                    className="flex-1 bg-transparent outline-none font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Bio</label>
                <textarea 
                  rows={4}
                  value={profile?.bio || ''} 
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <button type="submit" className="w-full py-4 bg-[#1A1A1A] text-white rounded-xl font-bold hover:bg-black transition-all">
                Wijzigingen Opslaan
              </button>
            </form>
          </div>
        )}

        {/* New Product Modal */}
        {isAddingProduct && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white w-full max-w-lg rounded-[2rem] p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-6">Nieuw Product Toevoegen</h2>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Titel</label>
                  <input 
                    required
                    type="text" 
                    value={newProduct.title}
                    onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="bijv. E-book: Geld verdienen met TikTok"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Omschrijving</label>
                  <textarea 
                    required
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Wat krijgt de klant?"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Ribbon / Badge (bijv. &quot;Stop morgen&quot;)</label>
                  <input 
                    type="text" 
                    value={newProduct.ribbon}
                    onChange={(e) => setNewProduct({...newProduct, ribbon: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optioneel"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Prijs (€)</label>
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Oude Prijs (€)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={newProduct.oldPrice}
                      onChange={(e) => setNewProduct({...newProduct, oldPrice: parseFloat(e.target.value)})}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Type</label>
                  <select 
                    value={newProduct.type}
                    onChange={(e) => setNewProduct({...newProduct, type: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="digital_download">Digitale Download</option>
                    <option value="coaching">Coaching Sessie</option>
                    <option value="subscription">Abonnement</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsAddingProduct(false)}
                    className="flex-1 py-4 text-gray-400 font-bold hover:bg-gray-50 rounded-xl transition-all"
                  >
                    Annuleren
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-[#007AFF] text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"
                  >
                    Product Aanmaken
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
