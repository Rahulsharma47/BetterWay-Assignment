import React, { useState, useEffect, useMemo, useCallback, createContext, useContext } from 'react';
import { ShoppingCart, Search, X, Plus, Minus, Trash2, Filter, Package, Sparkles } from 'lucide-react';

// ============================================
// CONTEXT & STATE MANAGEMENT
// ============================================

const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity, maxStock) => {
    if (quantity < 1) return;
    if (quantity > maxStock) return;
    
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

// ============================================
// CUSTOM HOOKS
// ============================================

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://dummyjson.com/products?limit=20');
        const data = await response.json();
        setProducts(data.products);
      } catch (err) {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};

// ============================================
// COMPONENTS
// ============================================

const ProductCard = ({ product }) => {
  const { addToCart, cart } = useCart();
  const inStock = product.stock > 0;
  const cartItem = cart.find(item => item.id === product.id);
  const canAddMore = !cartItem || cartItem.quantity < product.stock;

  return (
    <div className="group bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1">
      <div className="relative h-56 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md ${
          inStock 
            ? 'bg-emerald-500/90 text-white' 
            : 'bg-gray-900/90 text-white'
        }`}>
          {inStock ? `${product.stock} in stock` : 'Out of Stock'}
        </span>
      </div>
      
      <div className="p-5">
        <div className="mb-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{product.category}</span>
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-3 line-clamp-2 leading-snug">{product.title}</h3>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            ${product.price.toFixed(2)}
          </span>
        </div>

        <button
          onClick={() => addToCart(product)}
          disabled={!inStock || !canAddMore}
          className={`w-full py-2.5 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            !inStock || !canAddMore
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:from-gray-800 hover:to-gray-700 hover:shadow-lg hover:shadow-gray-900/30 active:scale-95'
          }`}
        >
          <ShoppingCart size={18} />
          {!inStock ? 'Out of Stock' : !canAddMore ? 'Max Added' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

const FilterBar = ({ searchTerm, setSearchTerm, category, setCategory, sortBy, setSortBy, categories, onClearFilters }) => {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-all duration-200 text-sm"
          />
        </div>

        {/* Category Filter */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-all duration-200 text-sm cursor-pointer"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-all duration-200 text-sm cursor-pointer"
        >
          <option value="">Sort by Price</option>
          <option value="low-high">Price: Low to High</option>
          <option value="high-low">Price: High to Low</option>
        </select>

        {/* Clear Filters */}
        <button
          onClick={onClearFilters}
          className="px-4 py-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 border border-gray-200 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Filter size={16} />
          Clear Filters
        </button>
      </div>
    </div>
  );
};

const Cart = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur effect */}
      <div 
        className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 transition-opacity duration-300" 
        onClick={onClose} 
      />
      
      <div className="fixed right-0 top-0 h-full w-full md:w-[420px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
            <p className="text-sm text-gray-500 mt-0.5">{cartCount} {cartCount === 1 ? 'item' : 'items'}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
          >
            <X size={22} className="text-gray-600" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Package size={40} className="text-gray-300" />
              </div>
              <p className="text-lg font-medium text-gray-900">Your cart is empty</p>
              <p className="text-sm text-gray-500 mt-1">Add some products to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                  <img 
                    src={item.thumbnail} 
                    alt={item.title} 
                    className="w-20 h-20 object-cover rounded-lg" 
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{item.title}</h3>
                    <p className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                      ${item.price.toFixed(2)}
                    </p>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.stock)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Minus size={14} className="text-gray-600" />
                        </button>
                        <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.stock)}
                          disabled={item.quantity >= item.stock}
                          className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Plus size={14} className="text-gray-600" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-100 p-6 bg-gray-50">
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className="font-medium">Free</span>
              </div>
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  ${cartTotal.toFixed(2)}
                </span>
              </div>
            </div>
            <button className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3.5 rounded-xl font-semibold hover:from-gray-800 hover:to-gray-700 transition-all duration-200 shadow-lg shadow-gray-900/30 hover:shadow-xl hover:shadow-gray-900/40 active:scale-98">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ============================================
// MAIN APP
// ============================================

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  
  const { products, loading, error } = useProducts();
  const { cartCount } = useCart();
  const debouncedSearch = useDebounce(searchTerm, 300);

  const categories = useMemo(() => {
    return [...new Set(products.map(p => p.category))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (debouncedSearch) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }

    if (sortBy === 'low-high') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'high-low') {
      filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [products, debouncedSearch, category, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setCategory('');
    setSortBy('');
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X size={32} className="text-red-500" />
          </div>
          <p className="text-xl font-semibold text-gray-900 mb-2">{error}</p>
          <p className="text-sm text-gray-500 mb-6">Please try again later</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl font-medium hover:from-gray-800 hover:to-gray-700 transition-all duration-200 shadow-lg shadow-gray-900/30"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center shadow-lg shadow-gray-900/30">
              <Sparkles size={20} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              ShopHub
            </h1>
          </div>
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
          >
            <ShoppingCart size={24} className="text-gray-700 group-hover:text-gray-900 transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-br from-gray-900 to-gray-800 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg shadow-gray-900/40 animate-bounce-subtle">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <FilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          category={category}
          setCategory={setCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          categories={categories}
          onClearFilters={clearFilters}
        />

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={48} className="text-gray-300" />
            </div>
            <p className="text-2xl font-semibold text-gray-900 mb-2">No products found</p>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
            <button 
              onClick={clearFilters} 
              className="px-6 py-2.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl font-medium hover:from-gray-800 hover:to-gray-700 transition-all duration-200 shadow-lg shadow-gray-900/30"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        @keyframes bounce-subtle {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite;
        }
      `}</style>
    </div>
  );
};

// ============================================
// ROOT
// ============================================

export default function Root() {
  return (
    <CartProvider>
      <App />
    </CartProvider>
  );
}