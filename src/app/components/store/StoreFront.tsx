import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ShoppingCart, LogOut, Search, ArrowRight, Truck, ShieldCheck, RefreshCw, Heart, X, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { trackEvent } from '../../utils/userTracker';
import { AuthController } from '../../../controllers/AuthController';
import { motion, AnimatePresence } from 'motion/react';

const SAMPLE_PRODUCTS = [
    { id: '1', nombre: 'Polo Zip Ribbed Black', precio: 59.99, tag: 'NUEVO', desc: 'Polo texturizado de punto fino con cremallera frontal.', image: '/assets/ropa/prod1.png' },
    { id: '2', nombre: 'Set x3 Camisetas Sleeveless', precio: 45.00, tag: 'MÁS VENDIDO', desc: 'Pack de camisetas sin mangas en tonos neutros (Black, Beige, White).', image: '/assets/ropa/prod2.png' },
    { id: '3', nombre: 'Pantalón de Vestir Plisado Beige', precio: 89.99, tag: 'TENDENCIA', desc: 'Pantalón elegante de corte recto y pliegues marcados.', image: '/assets/ropa/prod3.png' },
    { id: '4', nombre: 'Knit T-Shirt Black & Pantalón Gris', precio: 129.99, tag: 'OUTFIT', desc: 'Conjunto premium. Camiseta tejida negra y pantalón sastre gris claro.', image: '/assets/ropa/prod4.png' },
];

export function StoreFront() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Estados para el Carrito
    const [cart, setCart] = useState<any[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    useEffect(() => {
        const session = localStorage.getItem('session');
        if (session) {
            setCurrentUser(JSON.parse(session));
        }
        trackEvent('page_view', { page: 'StoreFront_Ropa_Elegante' });
    }, []);

    const handleProductClick = (prod: any) => {
        trackEvent('click_producto', { producto_id: prod.id, nombre: prod.nombre });
    };

    const handleBuy = (prod: any) => {
        trackEvent('intento_compra', { producto_id: prod.id, nombre: prod.nombre, precio: prod.precio });
        if (!currentUser) {
            alert('Por favor inicia sesión para poder comprar.');
            navigate('/login');
        } else {
            setCart([...cart, prod]);
            setIsCartOpen(true);
        }
    };

    const handleRemoveFromCart = (index: number) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const cartTotal = cart.reduce((acc, item) => acc + item.precio, 0);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setIsProcessing(true);

        try {
            const response = await fetch('http://localhost:3001/api/sales/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: currentUser.name,
                    customerEmail: currentUser.email,
                    items: cart,
                    total: cartTotal
                }),
            });

            const data = await response.json();
            if (data.success) {
                trackEvent('checkout_completado', { total: cartTotal, items: cart.length });
                setOrderSuccess(true);
                setCart([]); // Vaciar carrito
                setTimeout(() => {
                    setOrderSuccess(false);
                    setIsCartOpen(false);
                }, 4000);
            } else {
                alert('Error al procesar el pedido: ' + data.message);
            }
        } catch (error) {
            console.error('Error Checkout:', error);
            alert('Hubo un error de conexión al procesar el pago o enviar el correo.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleLogout = () => {
        AuthController.logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#FDFCF8] text-stone-900 font-sans selection:bg-stone-200 selection:text-stone-900 relative">

            {/* NAVEGACIÓN */}
            <nav className="fixed w-full top-0 z-40 bg-[#FDFCF8]/90 backdrop-blur-md border-b border-stone-200 transition-all">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
                        <span className="text-2xl font-black text-stone-900 tracking-widest uppercase">
                            VII<span className="text-stone-400">S</span>ION
                        </span>
                    </div>

                    <div className="hidden md:flex gap-10 text-xs font-semibold text-stone-500 uppercase tracking-[0.2em]">
                        <a href="#inicio" className="hover:text-stone-900 transition-colors">Hombre</a>
                        <a href="#inicio" className="hover:text-stone-900 transition-colors">Mujer</a>
                        <a href="#coleccion" className="hover:text-stone-900 transition-colors">Colección</a>
                        <a href="#coleccion" className="hover:text-stone-900 transition-colors text-stone-900 font-bold">Esenciales</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-stone-500 hover:text-stone-900 transition-colors hidden sm:block">
                            <Search size={20} strokeWidth={1.5} />
                        </button>
                        <button
                            onClick={() => {
                                if (!currentUser) {
                                    alert('Inicia sesión para ver tu carrito');
                                    navigate('/login');
                                } else {
                                    setIsCartOpen(true);
                                }
                            }}
                            className="p-2 text-stone-500 hover:text-stone-900 transition-colors relative mr-2"
                        >
                            <ShoppingCart size={20} strokeWidth={1.5} />
                            {cart.length > 0 && (
                                <span className="absolute top-0 right-0 w-4 h-4 bg-stone-900 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                                    {cart.length}
                                </span>
                            )}
                        </button>
                        {currentUser ? (
                            <div className="flex items-center gap-3 border-l border-stone-200 pl-4">
                                <div className="w-8 h-8 bg-stone-200 text-stone-800 rounded-full flex items-center justify-center font-bold text-xs" title={currentUser.name}>
                                    {currentUser.name.charAt(0).toUpperCase()}
                                </div>
                                <Button onClick={handleLogout} variant="ghost" size="icon" className="text-stone-400 hover:text-stone-900 rounded-full">
                                    <LogOut size={16} strokeWidth={1.5} />
                                </Button>
                            </div>
                        ) : (
                            <Button onClick={() => navigate('/login')} className="bg-stone-900 hover:bg-stone-800 text-white rounded-none px-6 shadow-sm transition-transform active:scale-95 font-medium text-xs tracking-widest uppercase h-10">
                                Acceder
                            </Button>
                        )}
                    </div>
                </div>
            </nav>

            {/* MODAL CARRITO (SIDEBAR) */}
            <AnimatePresence>
                {isCartOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50"
                            onClick={() => !isProcessing && setIsCartOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#FDFCF8] z-50 shadow-2xl border-l border-stone-200 flex flex-col"
                        >
                            {/* Header Carrito */}
                            <div className="h-20 flex items-center justify-between px-6 border-b border-stone-200 bg-white">
                                <h2 className="text-lg font-medium text-stone-900 tracking-widest uppercase">Tu Carrito ({cart.length})</h2>
                                <button onClick={() => !isProcessing && setIsCartOpen(false)} className="p-2 text-stone-400 hover:text-stone-900 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Contenido Carrito */}
                            <div className="flex-1 overflow-y-auto px-6 py-6">
                                {orderSuccess ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                        <CheckCircle2 size={64} className="text-green-600 mb-4" />
                                        <h3 className="text-2xl font-light text-stone-900">¡Pedido Confirmado!</h3>
                                        <p className="text-stone-500 font-light text-sm max-w-[250px]">
                                            Hemos enviado la cotización y los detalles de pago a <strong>{currentUser?.email}</strong>.
                                        </p>
                                    </div>
                                ) : cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-4">
                                        <ShoppingCart size={48} strokeWidth={1} />
                                        <p className="text-sm font-light tracking-wide">Tu carrito está vacío</p>
                                        <Button variant="outline" onClick={() => setIsCartOpen(false)} className="mt-4 rounded-none border-stone-300">
                                            Seguir Comprando
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {cart.map((item, id) => (
                                            <div key={id} className="flex gap-4 border-b border-stone-100 pb-6">
                                                <div className="w-20 h-24 bg-stone-100 shrink-0">
                                                    <img src={item.image} alt={item.nombre} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <h4 className="text-xs font-medium text-stone-900 uppercase">{item.nombre}</h4>
                                                        <p className="text-xs text-stone-500 mt-1">Talla: M | Color: Único</p>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-4">
                                                        <span className="text-sm font-medium">${item.precio.toFixed(2)}</span>
                                                        <button onClick={() => handleRemoveFromCart(id)} className="text-[10px] uppercase tracking-widest text-stone-400 hover:text-red-500 transition-colors">
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer Carrito (Checkout) */}
                            {!orderSuccess && cart.length > 0 && (
                                <div className="border-t border-stone-200 bg-white p-6 space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-stone-500 font-light">
                                            <span>Subtotal</span>
                                            <span>${cartTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-stone-500 font-light">
                                            <span>Envío</span>
                                            <span>Calculado en el checkout</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-medium text-stone-900 pt-4 border-t border-stone-100">
                                            <span>Total Estimado</span>
                                            <span>${cartTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleCheckout}
                                        disabled={isProcessing}
                                        className="w-full h-14 bg-stone-900 hover:bg-stone-800 text-white rounded-none uppercase text-xs tracking-[0.2em] font-medium"
                                    >
                                        {isProcessing ? 'Procesando Pedido...' : 'Pagar / Cotizar'}
                                    </Button>
                                    <p className="text-[10px] text-center text-stone-400 font-light">
                                        Al proceder, aceptas nuestros Términos de Servicio.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* HERO SECTION DE LUJO */}
            <section id="inicio" className="relative pt-20 pb-0 overflow-hidden bg-[#FDFCF8]">
                <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center border-b border-stone-200">

                    <div className="w-full md:w-1/2 px-8 py-20 md:py-32 z-10 flex flex-col items-center md:items-start text-center md:text-left">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <span className="inline-block py-1.5 px-4 bg-stone-100 text-stone-600 font-semibold text-[10px] tracking-[0.3em] uppercase mb-8 border border-stone-200">
                                Nueva Colección
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-5xl md:text-6xl lg:text-7xl font-light text-stone-900 tracking-tighter leading-[1] mb-8"
                        >
                            Elegancia en <br />
                            <span className="font-serif italic font-medium">cada detalle.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-base text-stone-500 mb-12 max-w-sm leading-relaxed font-light"
                        >
                            Siluetas depuradas y materiales premium. Redescubre el minimalismo contemporáneo con nuestra última selección de esenciales.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            <Button
                                size="lg"
                                className="bg-stone-900 hover:bg-stone-800 text-white rounded-none px-12 h-14 text-xs tracking-[0.2em] uppercase font-medium shadow-xl shadow-stone-900/10 transition-all"
                                onClick={() => {
                                    navigate('/tienda/productos');
                                    trackEvent('click_ver_coleccion');
                                }}
                            >
                                Descubrir
                            </Button>
                        </motion.div>
                    </div>

                    {/* Imagen Hero - Abrigo */}
                    <div className="w-full md:w-1/2 h-[60vh] md:h-[85vh] relative object-cover flex justify-center items-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}
                            className="absolute inset-0 bg-cover bg-center md:bg-top"
                            style={{ backgroundImage: 'url("/assets/ropa/prod5.png")' }}
                        >
                            <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#FDFCF8] via-[#FDFCF8]/30 to-transparent w-1/3"></div>
                        </motion.div>
                    </div>

                </div>
            </section>

            {/* BENEFICIOS DE TIENDA */}
            <section className="bg-[#FDFCF8] py-16">
                <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-stone-200">
                    <div className="flex flex-col items-center pt-4 md:pt-0">
                        <Truck className="w-6 h-6 text-stone-900 mb-5" strokeWidth={1} />
                        <h3 className="text-sm font-semibold tracking-widest uppercase text-stone-900 mb-2">Envío Gratuito</h3>
                        <p className="text-stone-500 text-xs font-light">En todos los pedidos superiores a $150</p>
                    </div>
                    <div className="flex flex-col items-center pt-8 md:pt-0">
                        <RefreshCw className="w-6 h-6 text-stone-900 mb-5" strokeWidth={1} />
                        <h3 className="text-sm font-semibold tracking-widest uppercase text-stone-900 mb-2">Devoluciones</h3>
                        <p className="text-stone-500 text-xs font-light">Cambios gratuitos hasta los 30 días</p>
                    </div>
                    <div className="flex flex-col items-center pt-8 md:pt-0">
                        <ShieldCheck className="w-6 h-6 text-stone-900 mb-5" strokeWidth={1} />
                        <h3 className="text-sm font-semibold tracking-widest uppercase text-stone-900 mb-2">Compra Segura</h3>
                        <p className="text-stone-500 text-xs font-light">Garantía de calidad y pago cifrado</p>
                    </div>
                </div>
            </section>

            {/* LISTADO DE PRODUCTOS - ROPA */}
            <section id="coleccion" className="py-24 px-6 bg-stone-100/50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-light text-stone-900 mb-3 tracking-tight">
                                Selección Destacada
                            </h2>
                            <p className="text-stone-500 font-light max-w-md">Piezas atemporales diseñadas para el armario de hoy.</p>
                        </div>
                        <button onClick={() => navigate('/tienda/productos')} className="hidden sm:flex text-xs font-medium text-stone-900 hover:text-stone-500 uppercase tracking-widest items-center gap-2 border-b border-stone-900 hover:border-stone-500 pb-1 pb-transition-all">
                            Ver colección completa <ArrowRight size={14} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                        {SAMPLE_PRODUCTS.map((prod, index) => (
                            <motion.div
                                key={prod.id}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.7, delay: index * 0.15 }}
                                className="group cursor-pointer flex flex-col"
                            >
                                {/* Imagen del Producto */}
                                <div className="relative aspect-[3/4] bg-stone-200 mb-6 overflow-hidden">
                                    <div className="absolute top-4 left-4 z-10">
                                        <span className="bg-stone-900 text-white text-[9px] font-medium tracking-[0.2em] uppercase px-3 py-1.5">
                                            {prod.tag}
                                        </span>
                                    </div>
                                    <button className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center text-stone-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100 shadow-sm">
                                        <Heart size={16} strokeWidth={1.5} />
                                    </button>
                                    <img
                                        src={prod.image}
                                        alt={prod.nombre}
                                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-1000 ease-out"
                                    />

                                    {/* Botón flotante al hover */}
                                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                        <Button
                                            className="w-full bg-white hover:bg-stone-100 text-stone-900 rounded-none uppercase text-[10px] font-bold tracking-widest h-12 shadow-lg"
                                            onClick={(e) => { e.stopPropagation(); handleBuy(prod); }}
                                        >
                                            Añadir al carrito
                                        </Button>
                                    </div>
                                </div>

                                {/* Info del Producto */}
                                <div onClick={() => handleProductClick(prod)} className="flex flex-col flex-1">
                                    <h3 className="text-sm font-medium text-stone-900 mb-1">{prod.nombre}</h3>
                                    <p className="text-xs text-stone-500 font-light mb-3 line-clamp-2">{prod.desc}</p>

                                    <div className="mt-auto flex items-center justify-between">
                                        <span className="text-sm font-medium text-stone-900">${prod.precio.toFixed(2)}</span>
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-stone-900 border border-stone-300"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#E5E5D8] border border-stone-300"></div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-stone-950 pt-24 pb-12 px-6 text-stone-400 border-t border-stone-900">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16">
                    <div className="md:w-1/3">
                        <span className="text-2xl font-black text-white tracking-widest uppercase mb-6 block">
                            VII<span className="text-stone-500">S</span>ION
                        </span>
                        <p className="text-sm font-light leading-relaxed text-stone-500 max-w-sm">
                            Ropa diseñada para trascender temporadas. Materiales exquisitos y un corte impecable para el armario contemporáneo.
                        </p>
                    </div>

                    <div className="md:w-2/3 grid grid-cols-2 md:grid-cols-3 gap-12 w-full">
                        <div>
                            <h4 className="text-white font-medium uppercase tracking-widest text-xs mb-6">Comprar</h4>
                            <ul className="space-y-4 text-xs font-light tracking-wide">
                                <li><a href="#" className="hover:text-white transition-colors">Novedades</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Hombre</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Mujer</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Accesorios</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-medium uppercase tracking-widest text-xs mb-6">Servicio</h4>
                            <ul className="space-y-4 text-xs font-light tracking-wide">
                                <li><a href="#" className="hover:text-white transition-colors">Envíos y Devoluciones</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Guía de Tallas</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Cuidado de Prendas</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
                            </ul>
                        </div>
                        <div className="col-span-2 md:col-span-1 border-t border-stone-800 pt-8 md:pt-0 md:border-t-0">
                            <h4 className="text-white font-medium uppercase tracking-widest text-xs mb-6">Newsletter</h4>
                            <p className="text-xs font-light mb-4">Suscríbete para acceso anticipado a nuevas colecciones.</p>
                            <div className="flex border-b border-stone-700 pb-2">
                                <input type="email" placeholder="Dirección Email" className="bg-transparent border-none outline-none text-xs w-full text-white placeholder:text-stone-600" />
                                <button className="text-white text-xs font-medium uppercase tracking-widest hover:text-stone-300">Enviar</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-stone-900 flex flex-col sm:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-widest text-stone-600 font-medium">
                    <p>© 2026 VIISION Studios.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-stone-400 transition-colors">Legal</a>
                        <a href="#" className="hover:text-stone-400 transition-colors">Privacidad</a>
                        <a href="#" className="hover:text-stone-400 transition-colors">Cookies</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
