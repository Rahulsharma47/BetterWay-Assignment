// import React, { useState, useEffect, useMemo, useCallback, createContext, useContext } from 'react';
// import { ShoppingCart, Search, X, Plus, Minus, Trash2, Filter, Package, Sparkles, CheckCircle, AlertCircle, Moon, Sun } from 'lucide-react';

// // ============================================
// // THEME CONTEXT
// // ============================================

// const ThemeContext = createContext();

// const ThemeProvider = ({ children }) => {
//   const [isDark, setIsDark] = useState(() => {
//     const saved = localStorage.getItem('theme');
//     return saved === 'dark';
//   });

//   useEffect(() => {
//     localStorage.setItem('theme', isDark ? 'dark' : 'light');
//     if (isDark) {
//       document.documentElement.classList.add('dark');
//     } else {
//       document.documentElement.classList.remove('dark');
//     }
//   }, [isDark]);

//   const toggleTheme = () => setIsDark(prev => !prev);

//   return (
//     <ThemeContext.Provider value={{ isDark, toggleTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// const useTheme = () => useContext(ThemeContext);

// // ============================================
// // TOAST CONTEXT
// // ============================================

// const ToastContext = createContext();

// const ToastProvider = ({ children }) => {
//   const [toasts, setToasts] = useState([]);

//   const addToast = useCallback((message, type = 'success') => {
//     const id = Date.now();
//     setToasts(prev => [...prev, { id, message, type }]);
//     setTimeout(() => {
//       setToasts(prev => prev.filter(toast => toast.id !== id));
//     }, 3000);
//   }, []);

//   return (
//     <ToastContext.Provider value={{ addToast }}>
//       {children}
//       <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] space-y-2">
//         {toasts.map(toast => (
//           <Toast key={toast.id} message={toast.message} type={toast.type} />
//         ))}
//       </div>
//     </ToastContext.Provider>
//   );
// };

// const useToast = () => useContext(ToastContext);

// const Toast = ({ message, type }) => {
//   const icons = {
//     success: <CheckCircle size={20} className="text-emerald-500" />,
//     error: <AlertCircle size={20} className="text-red-500" />,
//     warning: <AlertCircle size={20} className="text-amber-500" />
//   };

//   const bgColors = {
//     success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
//     error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
//     warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
//   };

//   return (
//     <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bgColors[type]} backdrop-blur-md shadow-lg animate-slide-down min-w-[300px]`}>
//       {icons[type]}
//       <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{message}</span>
//     </div>
//   );
// };

// // ============================================
// // CART CONTEXT
// // ============================================

// const CartContext = createContext();

// const CartProvider = ({ children }) => {
//   const [cart, setCart] = useState(() => {
//     const saved = localStorage.getItem('cart');
//     return saved ? JSON.parse(saved) : [];
//   });
//   const [cartAnimation, setCartAnimation] = useState(false);
//   const { addToast } = useToast();

//   useEffect(() => {
//     localStorage.setItem('cart', JSON.stringify(cart));
//   }, [cart]);

//   const addToCart = useCallback((product) => {
//     let didAdd = false;
//     let message = '';
  
//     setCart(prev => {
//       const existing = prev.find(item => item.id === product.id);
  
//       if (existing) {
//         if (existing.quantity >= product.stock) {
//           message = 'Stock limit reached';
//           return prev;
//         }
//         didAdd = true;
//         message = 'Quantity updated in cart';
//         return prev.map(item =>
//           item.id === product.id
//             ? { ...item, quantity: item.quantity + 1 }
//             : item
//         );
//       }
  
//       didAdd = true;
//       message = 'Added to cart successfully';
//       setCartAnimation(true);
//       setTimeout(() => setCartAnimation(false), 600);
  
//       return [...prev, { ...product, quantity: 1 }];
//     });
  
//     if (message) {
//       addToast(message, message.includes('limit') ? 'warning' : 'success');
//     }
//   }, [addToast]);
  

//   const removeFromCart = useCallback((productId) => {
//     setCart(prev => prev.filter(item => item.id !== productId));
//     addToast('Removed from cart', 'success');
//   }, [addToast]);

//   const updateQuantity = useCallback((productId, quantity, maxStock) => {
//     if (quantity < 1) return;
//     if (quantity > maxStock) {
//       addToast('Stock limit reached', 'warning');
//       return;
//     }
    
//     setCart(prev =>
//       prev.map(item =>
//         item.id === productId ? { ...item, quantity } : item
//       )
//     );
//   }, [addToast]);

//   const cartTotal = useMemo(() => {
//     return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
//   }, [cart]);

//   const cartCount = useMemo(() => {
//     return cart.reduce((sum, item) => sum + item.quantity, 0);
//   }, [cart]);

//   return (
//     <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, cartTotal, cartCount, cartAnimation }}>
//       {children}
//     </CartContext.Provider>
//   );
// };

// const useCart = () => {
//   const context = useContext(CartContext);
//   if (!context) throw new Error('useCart must be used within CartProvider');
//   return context;
// };

// // ============================================
// // CUSTOM HOOKS
// // ============================================

// const useDebounce = (value, delay) => {
//   const [debouncedValue, setDebouncedValue] = useState(value);

//   useEffect(() => {
//     const handler = setTimeout(() => setDebouncedValue(value), delay);
//     return () => clearTimeout(handler);
//   }, [value, delay]);

//   return debouncedValue;
// };

// const useProducts = () => {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const response = await fetch('https://dummyjson.com/products?limit=20');
//         const data = await response.json();
//         setProducts(data.products);
//       } catch (err) {
//         setError('Failed to load products');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, []);

//   return { products, loading, error };
// };

// // ============================================
// // COMPONENTS
// // ============================================

// const ProductImage = ({ src, alt, className }) => {
//   const [error, setError] = useState(false);
//   const [loading, setLoading] = useState(true);

//   return (
//     <div className={`${className} relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700`}>
//       {loading && !error && (
//         <div className="absolute inset-0 flex items-center justify-center">
//           <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin"></div>
//         </div>
//       )}
//       {error ? (
//         <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
//           <Package size={48} className="mb-2" />
//           <span className="text-xs font-medium">Image unavailable</span>
//         </div>
//       ) : (
//         <img
//           src={src}
//           alt={alt}
//           onLoad={() => setLoading(false)}
//           onError={() => {
//             setError(true);
//             setLoading(false);
//           }}
//           className={`w-full h-full object-cover transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
//         />
//       )}
//     </div>
//   );
// };

// const ProductCard = ({ product }) => {
//   const { addToCart, cart } = useCart();
//   const inStock = product.stock > 0;
//   const cartItem = cart.find(item => item.id === product.id);
//   const canAddMore = !cartItem || cartItem.quantity < product.stock;

//   return (
//     <div className="group bg-white dark:bg-gray-800 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 hover:-translate-y-1">
//       <div className="relative h-56 overflow-hidden">
//         <ProductImage 
//           src={product.thumbnail}
//           alt={product.title}
//           className="w-full h-full group-hover:scale-105 transition-transform duration-500"
//         />
//         <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//         <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md ${
//           inStock 
//             ? 'bg-emerald-500/90 text-white' 
//             : 'bg-gray-900/90 text-white'
//         }`}>
//           {inStock ? `${product.stock} in stock` : 'Out of Stock'}
//         </span>
//       </div>
      
//       <div className="p-5">
//         <div className="mb-2">
//           <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{product.category}</span>
//         </div>
//         <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 leading-snug">{product.title}</h3>
        
//         <div className="flex items-center justify-between mb-4">
//           <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
//             ${product.price.toFixed(2)}
//           </span>
//         </div>

//         <button
//           onClick={() => addToCart(product)}
//           disabled={!inStock || !canAddMore}
//           className={`w-full py-2.5 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
//             !inStock || !canAddMore
//               ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
//               : 'bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-900 hover:from-gray-800 hover:to-gray-700 dark:hover:from-gray-200 dark:hover:to-gray-400 hover:shadow-lg hover:shadow-gray-900/30 dark:hover:shadow-gray-100/20 active:scale-95'
//           }`}
//         >
//           <ShoppingCart size={18} />
//           {!inStock ? 'Out of Stock' : !canAddMore ? 'Max Added' : 'Add to Cart'}
//         </button>
//       </div>
//     </div>
//   );
// };

// const FilterBar = ({ searchTerm, setSearchTerm, category, setCategory, sortBy, setSortBy, categories, onClearFilters }) => {
//   return (
//     <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-8 shadow-sm">
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         {/* Search */}
//         <div className="relative group">
//           <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300 transition-colors" size={18} />
//           <input
//             type="text"
//             placeholder="Search products..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all duration-200 text-sm text-gray-900 dark:text-gray-100"
//           />
//         </div>

//         {/* Category Filter */}
//         <select
//           value={category}
//           onChange={(e) => setCategory(e.target.value)}
//           className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all duration-200 text-sm cursor-pointer text-gray-900 dark:text-gray-100"
//         >
//           <option value="">All Categories</option>
//           {categories.map(cat => (
//             <option key={cat} value={cat}>{cat}</option>
//           ))}
//         </select>

//         {/* Sort */}
//         <select
//           value={sortBy}
//           onChange={(e) => setSortBy(e.target.value)}
//           className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all duration-200 text-sm cursor-pointer text-gray-900 dark:text-gray-100"
//         >
//           <option value="">Sort by Price</option>
//           <option value="low-high">Price: Low to High</option>
//           <option value="high-low">Price: High to Low</option>
//         </select>

//         {/* Clear Filters */}
//         <button
//           onClick={onClearFilters}
//           className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
//         >
//           <Filter size={16} />
//           Clear Filters
//         </button>
//       </div>
//     </div>
//   );
// };

// const Cart = ({ isOpen, onClose }) => {
//   const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

//   if (!isOpen) return null;

//   return (
//     <>
//       {/* Backdrop with blur effect */}
//       <div 
//         className="fixed inset-0 bg-gray-900/20 dark:bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300" 
//         onClick={onClose} 
//       />
      
//       <div className="fixed right-0 top-0 h-full w-full md:w-[420px] bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col animate-slide-in">
//         {/* Header */}
//         <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
//           <div>
//             <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Shopping Cart</h2>
//             <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{cartCount} {cartCount === 1 ? 'item' : 'items'}</p>
//           </div>
//           <button 
//             onClick={onClose} 
//             className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200"
//           >
//             <X size={22} className="text-gray-600 dark:text-gray-400" />
//           </button>
//         </div>

//         {/* Cart Items */}
//         <div className="flex-1 overflow-y-auto p-6">
//           {cart.length === 0 ? (
//             <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
//               <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
//                 <Package size={40} className="text-gray-300 dark:text-gray-600" />
//               </div>
//               <p className="text-lg font-medium text-gray-900 dark:text-gray-100">Your cart is empty</p>
//               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add some products to get started</p>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {cart.map(item => (
//                 <div key={item.id} className="flex gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600 hover:border-gray-200 dark:hover:border-gray-500 transition-colors">
//                   <ProductImage
//                     src={item.thumbnail}
//                     alt={item.title}
//                     className="w-20 h-20 rounded-lg flex-shrink-0"
//                   />
//                   <div className="flex-1 min-w-0">
//                     <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1 truncate">{item.title}</h3>
//                     <p className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-3">
//                       ${item.price.toFixed(2)}
//                     </p>
                    
//                     <div className="flex items-center gap-3">
//                       <div className="flex items-center gap-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg p-1">
//                         <button
//                           onClick={() => updateQuantity(item.id, item.quantity - 1, item.stock)}
//                           className="p-1 hover:bg-gray-100 dark:hover:bg-gray-500 rounded transition-colors"
//                         >
//                           <Minus size={14} className="text-gray-600 dark:text-gray-300" />
//                         </button>
//                         <span className="w-8 text-center font-semibold text-sm text-gray-900 dark:text-gray-100">{item.quantity}</span>
//                         <button
//                           onClick={() => updateQuantity(item.id, item.quantity + 1, item.stock)}
//                           disabled={item.quantity >= item.stock}
//                           className="p-1 hover:bg-gray-100 dark:hover:bg-gray-500 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
//                         >
//                           <Plus size={14} className="text-gray-600 dark:text-gray-300" />
//                         </button>
//                       </div>
//                       <button
//                         onClick={() => removeFromCart(item.id)}
//                         className="ml-auto p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
//                       >
//                         <Trash2 size={16} />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         {cart.length > 0 && (
//           <div className="border-t border-gray-100 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-700/50">
//             <div className="space-y-3 mb-4">
//               <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
//                 <span>Subtotal</span>
//                 <span className="font-medium">${cartTotal.toFixed(2)}</span>
//               </div>
//               <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
//                 <span>Shipping</span>
//                 <span className="font-medium">Free</span>
//               </div>
//               <div className="h-px bg-gray-200 dark:bg-gray-600" />
//               <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-gray-100">
//                 <span>Total</span>
//                 <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
//                   ${cartTotal.toFixed(2)}
//                 </span>
//               </div>
//             </div>
//             <button className="w-full bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-900 py-3.5 rounded-xl font-semibold hover:from-gray-800 hover:to-gray-700 dark:hover:from-gray-200 dark:hover:to-gray-400 transition-all duration-200 shadow-lg shadow-gray-900/30 dark:shadow-gray-100/20 hover:shadow-xl hover:shadow-gray-900/40 dark:hover:shadow-gray-100/30 active:scale-98">
//               Proceed to Checkout
//             </button>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// // ============================================
// // MAIN APP (COMPLETE)
// // ============================================

// const App = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [category, setCategory] = useState('');
//   const [sortBy, setSortBy] = useState('');
//   const [cartOpen, setCartOpen] = useState(false);
  
//   const { products, loading, error } = useProducts();
//   const { cartCount, cartAnimation } = useCart();
//   const { isDark, toggleTheme } = useTheme();
//   const debouncedSearch = useDebounce(searchTerm, 300);

//   const categories = useMemo(() => {
//     return [...new Set(products.map(p => p.category))];
//   }, [products]);

//   const filteredProducts = useMemo(() => {
//     let filtered = [...products];

//     if (debouncedSearch) {
//       filtered = filtered.filter(p =>
//         p.title.toLowerCase().includes(debouncedSearch.toLowerCase())
//       );
//     }

//     if (category) {
//       filtered = filtered.filter(p => p.category === category);
//     }

//     if (sortBy === 'low-high') {
//       filtered.sort((a, b) => a.price - b.price);
//     } else if (sortBy === 'high-low') {
//       filtered.sort((a, b) => b.price - a.price);
//     }

//     return filtered;
//   }, [products, debouncedSearch, category, sortBy]);

//   const clearFilters = () => {
//     setSearchTerm('');
//     setCategory('');
//     setSortBy('');
//   };

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
//         <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
//           <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
//             <X size={32} className="text-red-500" />
//           </div>
//           <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{error}</p>
//           <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Please try again later</p>
//           <button 
//             onClick={() => window.location.reload()} 
//             className="px-6 py-2.5 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-900 rounded-xl font-medium hover:from-gray-800 hover:to-gray-700 dark:hover:from-gray-200 dark:hover:to-gray-400 transition-all duration-200 shadow-lg shadow-gray-900/30 dark:shadow-gray-100/20"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
//       {/* Header */}
//       <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-700 sticky top-0 z-30 shadow-sm">
//         <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 rounded-xl flex items-center justify-center shadow-lg shadow-gray-900/30 dark:shadow-gray-100/20">
//               <Sparkles size={20} className="text-white dark:text-gray-900" />
//             </div>
//             <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
//               ShopHub
//             </h1>
//           </div>
//           <div className="flex items-center gap-3">
//             <button
//               onClick={toggleTheme}
//               className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
//               aria-label="Toggle theme"
//             >
//               {isDark ? (
//                 <Sun size={20} className="text-gray-300" />
//               ) : (
//                 <Moon size={20} className="text-gray-700" />
//               )}
//             </button>
//             <button
//               onClick={() => setCartOpen(true)}
//               className="relative p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 group"
//             >
//               <ShoppingCart size={24} className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors" />
//               {cartCount > 0 && (
//                 <span className={`absolute -top-1 -right-1 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg shadow-gray-900/40 dark:shadow-gray-100/30 ${cartAnimation ? 'animate-ping-once' : ''}`}>
//                   {cartCount}
//                 </span>
//               )}
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-6 py-10">
//         <FilterBar
//           searchTerm={searchTerm}
//           setSearchTerm={setSearchTerm}
//           category={category}
//           setCategory={setCategory}
//           sortBy={sortBy}
//           setSortBy={setSortBy}
//           categories={categories}
//           onClearFilters={clearFilters}
//         />

//         {loading ? (
//           <div className="flex items-center justify-center py-32">
//             <div className="relative">
//               <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
//               <div className="w-16 h-16 border-4 border-gray-900 dark:border-gray-100 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
//             </div>
//           </div>
//         ) : filteredProducts.length === 0 ? (
//           <div className="text-center py-32">
//             <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
//               <Package size={48} className="text-gray-300 dark:text-gray-600" />
//             </div>
//             <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No products found</p>
//             <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your filters or search terms</p>
//             <button 
//               onClick={clearFilters} 
//               className="px-6 py-2.5 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-900 rounded-xl font-medium hover:from-gray-800 hover:to-gray-700 dark:hover:from-gray-200 dark:hover:to-gray-400 transition-all duration-200 shadow-lg shadow-gray-900/30 dark:shadow-gray-100/20"
//             >
//               Clear All Filters
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {filteredProducts.map(product => (
//               <ProductCard key={product.id} product={product} />
//             ))}
//           </div>
//         )}
//       </main>

//       {/* Cart Sidebar */}
//       <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} />

//       {/* Styles for animations */}
//       <style>{`
//         @keyframes slide-in {
//           from {
//             transform: translateX(100%);
//           }
//           to {
//             transform: translateX(0);
//           }
//         }
//         .animate-slide-in {
//           animation: slide-in 0.3s ease-out;
//         }
//         @keyframes slide-down {
//           from {
//             transform: translateY(-100%);
//             opacity: 0;
//           }
//           to {
//             transform: translateY(0);
//             opacity: 1;
//           }
//         }
//         .animate-slide-down {
//           animation: slide-down 0.3s ease-out;
//         }
//         @keyframes ping-once {
//           0% {
//             transform: scale(1);
//             opacity: 1;
//           }
//           50% {
//             transform: scale(1.3);
//             opacity: 0.8;
//           }
//           100% {
//             transform: scale(1);
//             opacity: 1;
//           }
//         }
//         .animate-ping-once {
//           animation: ping-once 0.6s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// };

// // ============================================
// // ROOT (COMPLETE)
// // ============================================

// export default function Root() {
//   return (
//     <ThemeProvider>
//       <ToastProvider>
//         <CartProvider>
//           <App />
//         </CartProvider>
//       </ToastProvider>
//     </ThemeProvider>
//   );
// }

import React, { useState, useEffect, useMemo, useCallback, createContext, useContext } from 'react';
import { ShoppingCart, Search, X, Plus, Minus, Trash2, Filter, Package, Sparkles, CheckCircle, AlertCircle, Moon, Sun, Star, ZoomIn } from 'lucide-react';

// ============================================
// THEME CONTEXT
// ============================================

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => useContext(ThemeContext);

// ============================================
// TOAST CONTEXT
// ============================================

const ToastContext = createContext();

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] space-y-2">
        {toasts.map(toast => (
          <Toast key={toast.id} message={toast.message} type={toast.type} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const useToast = () => useContext(ToastContext);

const Toast = ({ message, type }) => {
  const icons = {
    success: <CheckCircle size={20} className="text-emerald-500" />,
    error: <AlertCircle size={20} className="text-red-500" />,
    warning: <AlertCircle size={20} className="text-amber-500" />
  };

  const bgColors = {
    success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bgColors[type]} backdrop-blur-md shadow-lg animate-slide-down min-w-[300px]`}>
      {icons[type]}
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{message}</span>
    </div>
  );
};

// ============================================
// CART CONTEXT
// ============================================

const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [cartAnimation, setCartAnimation] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((product) => {
    let didAdd = false;
    let message = '';
  
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
  
      if (existing) {
        if (existing.quantity >= product.stock) {
          message = 'Stock limit reached';
          return prev;
        }
        didAdd = true;
        message = 'Quantity updated in cart';
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
  
      didAdd = true;
      message = 'Added to cart successfully';
      setCartAnimation(true);
      setTimeout(() => setCartAnimation(false), 600);
  
      return [...prev, { ...product, quantity: 1 }];
    });
  
    if (message) {
      addToast(message, message.includes('limit') ? 'warning' : 'success');
    }
  }, [addToast]);

  const removeFromCart = useCallback((productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    addToast('Removed from cart', 'success');
  }, [addToast]);

  const updateQuantity = useCallback((productId, quantity, maxStock) => {
    if (quantity < 1) return;
    if (quantity > maxStock) {
      addToast('Stock limit reached', 'warning');
      return;
    }
    
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, [addToast]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, cartTotal, cartCount, cartAnimation }}>
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

const ProductImage = ({ src, alt, className }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  return (
    <div className={`${className} relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700`}>
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin"></div>
        </div>
      )}
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
          <Package size={48} className="mb-2" />
          <span className="text-xs font-medium">Image unavailable</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoading(false)}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
          className={`w-full h-full object-cover transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        />
      )}
    </div>
  );
};

const SkeletonCard = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-pulse">
      <div className="h-56 bg-gray-200 dark:bg-gray-700"></div>
      <div className="p-5">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
        <div className="flex items-center justify-between mb-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      </div>
    </div>
  );
};

const ProductModal = ({ product, isOpen, onClose }) => {
  const { addToCart, cart } = useCart();
  
  if (!isOpen || !product) return null;

  const cartItem = cart.find(item => item.id === product.id);
  const canAddMore = !cartItem || cartItem.quantity < product.stock;
  const inStock = product.stock > 0;

  return (
    <>
      <div 
        className="fixed inset-0 bg-gray-900/50 dark:bg-black/70 backdrop-blur-sm z-50 transition-opacity duration-300 animate-fade-in" 
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 p-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Product Details</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              <X size={24} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Image Section */}
              <div className="space-y-4">
                <ProductImage
                  src={product.images?.[0] || product.thumbnail}
                  alt={product.title}
                  className="w-full h-96 rounded-2xl overflow-hidden"
                />
                <div className="grid grid-cols-4 gap-2">
                  {product.images?.slice(0, 4).map((img, idx) => (
                    <ProductImage
                      key={idx}
                      src={img}
                      alt={`${product.title} ${idx + 1}`}
                      className="w-full h-20 rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity"
                    />
                  ))}
                </div>
              </div>

              {/* Details Section */}
              <div className="space-y-6">
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {product.category}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                    {product.title}
                  </h1>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={i < Math.floor(product.rating || 4) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {product.rating?.toFixed(1) || '4.0'} ({product.reviews?.length || 0} reviews)
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.discountPercentage > 0 && (
                    <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                      ${(product.price / (1 - product.discountPercentage / 100)).toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    inStock 
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {inStock ? `${product.stock} in stock` : 'Out of Stock'}
                  </span>
                  {product.discountPercentage > 0 && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                      {product.discountPercentage}% OFF
                    </span>
                  )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Description</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {product.description || 'No description available for this product.'}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      addToCart(product);
                    }}
                    disabled={!inStock || !canAddMore}
                    className={`w-full py-3.5 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                      !inStock || !canAddMore
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-900 hover:from-gray-800 hover:to-gray-700 dark:hover:from-gray-200 dark:hover:to-gray-400 hover:shadow-lg hover:shadow-gray-900/30 dark:hover:shadow-gray-100/20 active:scale-95'
                    }`}
                  >
                    <ShoppingCart size={20} />
                    {!inStock ? 'Out of Stock' : !canAddMore ? 'Max Added' : 'Add to Cart'}
                  </button>
                </div>

                {product.brand && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Brand</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{product.brand}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const ProductCard = ({ product, onQuickView }) => {
  const { addToCart, cart } = useCart();
  const inStock = product.stock > 0;
  const cartItem = cart.find(item => item.id === product.id);
  const canAddMore = !cartItem || cartItem.quantity < product.stock;

  return (
    <div className="group bg-white dark:bg-gray-800 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 hover:-translate-y-1">
      <div className="relative h-56 overflow-hidden">
        <ProductImage 
          src={product.thumbnail}
          alt={product.title}
          className="w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Quick View Button */}
        <button
          onClick={() => onQuickView(product)}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-xl font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 shadow-lg hover:scale-105"
        >
          <ZoomIn size={18} />
          Quick View
        </button>

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
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{product.category}</span>
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 leading-snug">{product.title}</h3>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
            ${product.price.toFixed(2)}
          </span>
        </div>

        <button
          onClick={() => addToCart(product)}
          disabled={!inStock || !canAddMore}
          className={`w-full py-2.5 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            !inStock || !canAddMore
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-900 hover:from-gray-800 hover:to-gray-700 dark:hover:from-gray-200 dark:hover:to-gray-400 hover:shadow-lg hover:shadow-gray-900/30 dark:hover:shadow-gray-100/20 active:scale-95'
          }`}
        >
          <ShoppingCart size={18} />
          {!inStock ? 'Out of Stock' : !canAddMore ? 'Max Added' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

const FilterChip = ({ label, onRemove }) => {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-600 animate-fade-in">
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-0.5 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
};

const FilterBar = ({ searchTerm, setSearchTerm, category, setCategory, sortBy, setSortBy, categories, onClearFilters }) => {
  const activeFilters = [];
  
  if (searchTerm) activeFilters.push({ type: 'search', label: `Search: "${searchTerm}"`, clear: () => setSearchTerm('') });
  if (category) activeFilters.push({ type: 'category', label: `Category: ${category}`, clear: () => setCategory('') });
  if (sortBy) {
    const sortLabel = sortBy === 'low-high' ? 'Price: Low to High' : 'Price: High to Low';
    activeFilters.push({ type: 'sort', label: sortLabel, clear: () => setSortBy('') });
  }

  return (
    <div className="space-y-4 mb-8">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all duration-200 text-sm text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all duration-200 text-sm cursor-pointer text-gray-900 dark:text-gray-100"
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
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all duration-200 text-sm cursor-pointer text-gray-900 dark:text-gray-100"
          >
            <option value="">Sort by Price</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={onClearFilters}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Filter size={16} />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, idx) => (
            <FilterChip key={idx} label={filter.label} onRemove={filter.clear} />
          ))}
        </div>
      )}
    </div>
  );
};

const Cart = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/20 dark:bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[420px] bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col animate-slide-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Shopping Cart
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
          >
            <X size={22} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Package size={48} />
              <p className="mt-4 font-medium">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div
                  key={item.id}
                  className="flex gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border"
                >
                  <ProductImage
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-20 h-20 rounded-lg"
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold truncate">
                      {item.title}
                    </h3>

                    <p className="font-bold mt-1">
                      ${item.price.toFixed(2)}
                    </p>

                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-2 bg-white dark:bg-gray-600 rounded-lg p-1">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1, item.stock)
                          }
                        >
                          <Minus size={14} />
                        </button>

                        <span className="w-6 text-center">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1, item.stock)
                          }
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto text-red-500"
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

        {/* Footer (ONLY ONCE) */}
        {cart.length > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-700 p-6">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>

            <button className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-900 font-semibold">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ============================================
// APP HEADER
// ============================================

const AppHeader = ({ onCartOpen }) => {
  const { cartCount, cartAnimation } = useCart();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
        <Sparkles className="text-gray-900 dark:text-white" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">Modern Store</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-900 dark:text-white"
          >

            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Cart Button */}
          <button
            onClick={onCartOpen}
            className={`relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-900 dark:text-white ${
              cartAnimation ? 'animate-bounce' : ''
            }`}
          >

            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

// ============================================
// MAIN APP
// ============================================

const App = () => {
  const { products, loading, error } = useProducts();

  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);

  const categories = useMemo(() => {
    return [...new Set(products.map(p => p.category))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (debouncedSearch) {
      result = result.filter(p =>
        p.title.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    if (category) {
      result = result.filter(p => p.category === category);
    }

    if (sortBy === 'low-high') {
      result.sort((a, b) => a.price - b.price);
    }

    if (sortBy === 'high-low') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, debouncedSearch, category, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setCategory('');
    setSortBy('');
  };

  return (
    <>
      <AppHeader onCartOpen={() => setIsCartOpen(true)} />

      <main className="max-w-7xl mx-auto px-6 py-8">
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

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="text-center text-red-500 font-medium">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setSelectedProduct}
              />
            ))}
          </div>
        )}
      </main>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Cart Drawer */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
};

// ============================================
// ROOT EXPORT
// ============================================

export default function Root() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <CartProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <App />
          </div>
        </CartProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
