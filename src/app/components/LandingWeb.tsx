import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ShoppingBag, Search, User, Menu, ChevronRight, Star, Truck, ShieldCheck, RefreshCcw, X, Plus, Minus, LogOut, ArrowRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    category?: string;
}

export function LandingWeb() {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState<any>(null);

    interface CartItem {
        product: Product;
        quantity: number;
    }
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Load cart from LocalStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('viision_cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Error parsing cart", e);
            }
        }
    }, []);

    // Save cart to LocalStorage on change
    useEffect(() => {
        localStorage.setItem('viision_cart', JSON.stringify(cart));
    }, [cart]);

    // Check for logged user
    useEffect(() => {
        const savedUser = localStorage.getItem('viision_user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error("Error parsing user", e);
            }
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('viision_user');
        setUser(null);
        navigate('/');
    };

    // Header scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        fetch('http://localhost:3001/api/products')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.products.length > 0) {
                    setProducts(data.products);
                } else {
                    // Fallback a periféricos modernos
                    setProducts([
                        {
                            id: '1',
                            name: 'Teclado Mecánico RGB Pro',
                            description: 'Switches táctiles silenciosos, chasis de aluminio y retroiluminación personalizable por tecla.',
                            price: 129.99,
                            image_url: 'https://m.media-amazon.com/images/I/61NGLA8LrpL._AC_SL1500_.jpg'
                        },
                        {
                            id: '2',
                            name: 'Mouse Inalámbrico Ultra-Light',
                            description: 'Sensor óptico de 25K DPI, peso pluma de 60g y batería de 70 horas.',
                            price: 89.99,
                            image_url: 'https://m.media-amazon.com/images/I/71wZqT-B92L._AC_SL1500_.jpg'
                        },
                        {
                            id: '3',
                            name: 'Memoria RAM Trident Z 32GB',
                            description: 'Kit DDR5 a 6000MHz con disipador de calor de aluminio y RGB direccional.',
                            price: 189.50,
                            image_url: 'https://m.media-amazon.com/images/I/61EukqONX2L._AC_SL1000_.jpg'
                        },
                        {
                            id: '4',
                            name: 'Monitor Gaming 27" 165Hz',
                            description: 'Panel IPS con tiempo de respuesta de 1ms y compatibilidad G-Sync.',
                            price: 349.99,
                            image_url: 'https://m.media-amazon.com/images/I/81xD2Pux-GL._AC_SL1500_.jpg'
                        },
                    ]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error cargando productos:", err);
                setLoading(false);
            });
    }, []);

    const addToCart = (product: Product) => {
        // Rastrear clic en el backend
        fetch('http://localhost:3001/api/analytics/product-click', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: (product.id && product.id.length > 5) ? product.id : null }),
        }).catch(e => console.error("Error tracking click", e));

        setCart(prev => {
            const item = prev.find(i => i.product.id === product.id);
            if (item) {
                return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { product, quantity: 1 }];
        });
        setIsCartOpen(true);
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(i => {
            if (i.product.id === productId) {
                const newQ = i.quantity + delta;
                return newQ > 0 ? { ...i, quantity: newQ } : i;
            }
            return i;
        }));
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(i => i.product.id !== productId));
    };

    const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        // REGLA: Si no está logueado, mandarlo al login antes de pagar
        if (!user) {
            toast.info("Por favor, inicia sesión para finalizar tu compra.");
            navigate('/login');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('http://localhost:3001/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cart: cart,
                    customer_email: user.email
                })
            });
            const result = await response.json();

            if (result.success) {
                setCart([]);
                setIsCartOpen(false);
                toast.success("¡Compra realizada con éxito!", {
                    description: `Se ha enviado un correo de confirmación a ${user.email}.`,
                    duration: 5000,
                });
            } else {
                toast.error(result.message || 'Error al procesar la compra.');
            }
        } catch (e) {
            toast.error('Hubo un error al procesar la compra.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900">
            {/* ANNOUNCEMENT BAR */}
            <div className="bg-black text-white text-xs text-center py-2 px-4 font-medium tracking-wide">
                Envíos gratis en pedidos superiores a $150. Oferta por tiempo limitado.
            </div>

            {/* HEADER */}
            <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled
                ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200 py-3'
                : 'bg-transparent py-5'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    {/* Mobile Menu Icon */}
                    <button className="lg:hidden p-2 -ml-2 text-gray-600">
                        <Menu className="w-6 h-6" />
                    </button>

                    {/* Logo */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center transform rotate-3">
                            <span className="text-white font-bold text-lg leading-none -rotate-3">V</span>
                        </div>
                        <span className="text-2xl font-black tracking-tighter">VIISION STORE</span>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-8">
                        <a href="#perifericos" className="text-sm font-semibold hover:text-black hover:underline underline-offset-4 decoration-2">Periféricos</a>
                        <a href="#componentes" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">Componentes</a>
                        <a href="#monitores" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">Monitores</a>
                        <a href="#ofertas" className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors">Ofertas</a>
                    </nav>

                    {/* Icons */}
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-600 hover:text-black transition-colors hidden sm:block">
                            <Search className="w-5 h-5" />
                        </button>
                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Cliente</p>
                                    <p className="text-sm font-black truncate max-w-[100px]">{user.name}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Cerrar Sesión"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => navigate('/login')}
                                className="p-2 text-gray-600 hover:text-black transition-colors flex items-center gap-2 group"
                                title="Mi Cuenta / Iniciar Sesión"
                            >
                                <User className="w-5 h-5 group-hover:fill-black/10 transition-colors" />
                                <span className="hidden sm:inline text-sm font-medium">Cuenta</span>
                            </button>
                        )}
                        <button onClick={() => setIsCartOpen(true)} className="p-2 text-gray-600 hover:text-black transition-colors relative">
                            <ShoppingBag className="w-5 h-5" />
                            {cart.length > 0 && (
                                <span className="absolute top-1 right-0.5 w-4 h-4 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {cart.reduce((a, c) => a + c.quantity, 0)}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* HERO SECTION */}
            <section className="relative h-screen min-h-[700px] flex items-center overflow-hidden bg-black">
                {/* Background Image with Parallax-like effect */}
                <motion.div
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-0"
                >
                    <img
                        src="https://images.unsplash.com/photo-1615663245857-ac1eeb536628?q=80&w=2000&auto=format&fit=crop"
                        alt="Gaming Setup"
                        className="w-full h-full object-cover object-center opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                </motion.div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full mt-20">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-viision-600/20 backdrop-blur-md text-viision-400 text-[10px] font-black tracking-[0.2em] uppercase mb-8 border border-viision-500/30">
                                <Zap className="w-3 h-3 fill-current" /> Future of Hardware
                            </span>
                            <h1 className="text-6xl lg:text-8xl font-black text-white leading-[0.9] mb-8 tracking-tighter">
                                NEXT GEN <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-viision-400 via-emerald-400 to-blue-500">EXPERIENCE</span>
                            </h1>
                            <p className="text-xl text-gray-400 mb-12 leading-relaxed max-w-xl font-medium">
                                Redefinimos los límites del hardware. Rendimiento extremo, estética impecable y tecnología de vanguardia para tu setup profesional.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-5">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="px-10 py-5 bg-white text-black font-black rounded-2xl hover:bg-viision-50 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 group"
                                >
                                    Explorar Catálogo <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-10 py-5 bg-transparent border-2 border-white/10 text-white font-bold rounded-2xl hover:bg-white/5 transition-colors backdrop-blur-md"
                                >
                                    Ver Ofertas Especiales
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Floating Stats or features */}
                <div className="absolute bottom-12 left-12 right-12 z-10 hidden lg:flex justify-between items-end border-t border-white/10 pt-8">
                    <div className="flex gap-16">
                        <div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Latencia</p>
                            <p className="text-2xl font-black text-white">0.5ms <span className="text-viision-400 text-sm">Ultra-fast</span></p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Conectividad</p>
                            <p className="text-2xl font-black text-white">Lightspeed</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Scrolling</p>
                        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-1">
                            <motion.div
                                animate={{ y: [0, 12, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-1.5 h-1.5 bg-viision-400 rounded-full"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* VALUE PROPS */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="group p-10 rounded-[2rem] bg-gray-50 border border-transparent hover:border-viision-600/10 hover:bg-white hover:shadow-2xl hover:shadow-viision-600/5 transition-all duration-500"
                        >
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
                                <Truck className="w-6 h-6 text-viision-600" strokeWidth={2} />
                            </div>
                            <h4 className="font-black text-xl mb-3 tracking-tight">Envío prioritario</h4>
                            <p className="text-gray-400 text-sm leading-relaxed font-medium">Logística optimizada para entregas en 24h a nivel nacional.</p>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className="group p-10 rounded-[2rem] bg-gray-50 border border-transparent hover:border-viision-600/10 hover:bg-white hover:shadow-2xl hover:shadow-viision-600/5 transition-all duration-500"
                        >
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-6 h-6 text-viision-600" strokeWidth={2} />
                            </div>
                            <h4 className="font-black text-xl mb-3 tracking-tight">Protección Total</h4>
                            <p className="text-gray-400 text-sm leading-relaxed font-medium">Garantía premium de 2 años en todos nuestros componentes.</p>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className="group p-10 rounded-[2rem] bg-gray-50 border border-transparent hover:border-viision-600/10 hover:bg-white hover:shadow-2xl hover:shadow-viision-600/5 transition-all duration-500"
                        >
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
                                <RefreshCcw className="w-6 h-6 text-viision-600" strokeWidth={2} />
                            </div>
                            <h4 className="font-black text-xl mb-3 tracking-tight">Retorno Simple</h4>
                            <p className="text-gray-400 text-sm leading-relaxed font-medium">Proceso de devolución automatizado y sin complicaciones.</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* PRODUCT GRID */}
            <section id="products" className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h2 className="text-3xl font-black tracking-tight mb-2">Destacados</h2>
                            <p className="text-gray-500">Lo más vendido del mes</p>
                        </div>
                        <button className="hidden sm:flex items-center gap-1 font-semibold hover:underline">
                            Ver todo <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-20">
                            <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                            {products.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group cursor-pointer"
                                >
                                    {/* Image Container */}
                                    <div className="relative aspect-[4/5] bg-white rounded-3xl overflow-hidden mb-6 shadow-sm group-hover:shadow-2xl group-hover:shadow-viision-600/10 transition-all duration-500 border border-gray-100">
                                        <div className="absolute top-4 left-4 z-10">
                                            {product.price > 200 ? (
                                                <span className="bg-black text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">Premium</span>
                                            ) : (
                                                <span className="bg-viision-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">Nuevo</span>
                                            )}
                                        </div>
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-1000 ease-out p-4"
                                        />
                                        {/* Quick Add Button with Better Design */}
                                        <div className="absolute inset-x-0 bottom-0 p-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                                className="w-full py-4 bg-black text-white font-black rounded-2xl shadow-xl hover:bg-viision-700 transition-all active:scale-95"
                                            >
                                                Comprar Ahora
                                            </button>
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="space-y-2 px-1">
                                        <p className="text-[10px] text-viision-600 font-black uppercase tracking-widest">{product.category || 'Novedad'}</p>
                                        <h3 className="font-bold text-xl leading-tight group-hover:text-viision-600 transition-colors">{product.name}</h3>
                                        <p className="text-gray-400 text-sm font-medium leading-relaxed line-clamp-2">{product.description}</p>
                                        <div className="flex items-center justify-between pt-2">
                                            <p className="font-black text-2xl tracking-tighter">${product.price}</p>
                                            <div className="flex items-center gap-1 text-viision-400">
                                                <Star className="w-3 h-3 fill-current" />
                                                <span className="text-[10px] font-black">4.9</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* SEPARATOR / BANNER */}
            <section className="py-32 bg-black overflow-hidden relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-viision-600 to-transparent opacity-50"></div>
                <div className="max-w-4xl mx-auto px-6 text-center space-y-10 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="w-20 h-2 bg-viision-600 mx-auto rounded-full"
                    ></motion.div>
                    <h2 className="text-5xl md:text-7xl font-black leading-[0.9] text-white tracking-tighter italic">
                        PERFORMANCE <br /> WITHOUT LIMITS.
                    </h2>
                    <p className="text-gray-500 text-lg max-w-xl mx-auto font-medium">
                        Únete a miles de profesionales que confían en <span className="text-white">VIISION</span> para sus estaciones de batalla.
                    </p>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-1">
                            <span className="text-2xl font-black tracking-tighter mb-6 block">VIISION</span>
                            <p className="text-gray-500 text-sm leading-relaxed mb-6">Equipando a la próxima generación de creadores y gamers con hardware de primer nivel.</p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Tienda</h4>
                            <ul className="space-y-3 text-sm text-gray-500">
                                <li><a href="#" className="hover:text-black">Nuevos Lanzamientos</a></li>
                                <li><a href="#" className="hover:text-black">Periféricos</a></li>
                                <li><a href="#" className="hover:text-black">Componentes PC</a></li>
                                <li><a href="#" className="hover:text-black">Monitores</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Soporte</h4>
                            <ul className="space-y-3 text-sm text-gray-500">
                                <li><a href="#" className="hover:text-black">Centro de Ayuda</a></li>
                                <li><a href="#" className="hover:text-black">Rastrear Pedido</a></li>
                                <li><a href="#" className="hover:text-black">Garantías y Devoluciones</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Newsletter</h4>
                            <p className="text-gray-500 text-sm mb-4">Recibe ofertas exclusivas y novedades.</p>
                            <div className="flex gap-2">
                                <input type="email" placeholder="Tu correo electrónico" className="bg-gray-100 border-transparent rounded-lg px-4 py-2 w-full text-sm focus:bg-white focus:border-gray-300 focus:ring-0" />
                                <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold">Unirme</button>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
                        <p>© {new Date().getFullYear()} VIISION STORE. Todos los derechos reservados.</p>
                        <div className="flex gap-4">
                            <a href="#" className="hover:text-black">Privacidad</a>
                            <a href="#" className="hover:text-black">Términos</a>
                            <a href="#" className="hover:text-black">Accesibilidad</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* SLIDE-OVER CART */}
            <AnimatePresence>
                {isCartOpen && (
                    <div className="fixed inset-0 z-[100] flex justify-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCartOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-md bg-white/90 backdrop-blur-2xl h-full shadow-[-20px_0_50px_rgba(0,0,0,0.2)] flex flex-col border-l border-white/20"
                        >
                            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-3xl font-black tracking-tight">Tu Carrito</h2>
                                <button onClick={() => setIsCartOpen(false)} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                {cart.length === 0 ? (
                                    <div className="text-center text-gray-400 mt-20">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <ShoppingBag className="w-10 h-10 opacity-20" />
                                        </div>
                                        <p className="font-medium">Tu carrito está vacío.</p>
                                        <button onClick={() => setIsCartOpen(false)} className="mt-6 text-viision-600 font-black uppercase tracking-widest text-xs hover:underline underline-offset-8">Seguir comprando</button>
                                    </div>
                                ) : (
                                    cart.map((item) => (
                                        <motion.div
                                            layout
                                            key={item.product.id}
                                            className="flex gap-6 group/item"
                                        >
                                            <div className="relative w-24 h-28 shrink-0 bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                                                <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover p-2" />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-center">
                                                <h3 className="font-bold text-base leading-tight group-hover/item:text-viision-600 transition-colors">{item.product.name}</h3>
                                                <p className="text-viision-600 font-black text-sm mt-1">${item.product.price.toFixed(2)}</p>
                                                <div className="flex items-center gap-4 mt-4">
                                                    <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                                                        <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-gray-500 transition-all"><Minus className="w-3.5 h-3.5" /></button>
                                                        <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-gray-500 transition-all"><Plus className="w-3.5 h-3.5" /></button>
                                                    </div>
                                                    <button onClick={() => removeFromCart(item.product.id)} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors">Eliminar</button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            {cart.length > 0 && (
                                <div className="p-8 border-t border-gray-100 bg-white/50">
                                    <div className="flex justify-between items-center mb-8">
                                        <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Subtotal Estimado</span>
                                        <span className="text-3xl font-black tracking-tighter">${cartTotal.toFixed(2)}</span>
                                    </div>
                                    <button
                                        onClick={handleCheckout}
                                        disabled={loading}
                                        className="w-full py-5 bg-black text-white font-black rounded-2xl hover:bg-viision-700 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex items-center justify-center gap-3 active:scale-[0.98]"
                                    >
                                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (
                                            <>
                                                <span>Finalizar Compra</span>
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                    <p className="text-center text-[10px] text-gray-400 mt-6 font-medium">Impuestos y envío calculados al finalizar la compra.</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
