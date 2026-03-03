import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ShoppingCart, Search, LayoutGrid, List, ChevronDown, Star, Heart, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
// Eliminado import no usado de Card
import { trackEvent } from '../../utils/userTracker';
import { AuthController } from '../../../controllers/AuthController';
import { motion, AnimatePresence } from 'motion/react';

const ALL_PRODUCTS = [
    { id: '1', nombre: 'Camiseta de Manga Corta Coqueta', precio: 60.36, categoria: 'Mujer', tags: ['Coqueta', 'Encaje'], rating: 4.0, reviews: 13, image: '/assets/ropa/prod1.png', brand: 'Solongshangmao' },
    { id: '2', nombre: 'Top de Retazos Estética Vintage', precio: 50.29, categoria: 'Mujer', tags: ['Vintage', 'E-Girl'], rating: 3.8, reviews: 154, image: '/assets/ropa/prod2.png', brand: 'Haphaphaphap' },
    { id: '3', nombre: 'Sudadera con Capucha Y2K Jofijuku', precio: 80.49, categoria: 'Mujer', tags: ['Y2K', 'Shoujo'], rating: 4.2, reviews: 73, image: '/assets/ropa/prod3.png', brand: 'CuteCore' },
    { id: '4', nombre: 'Rapbin Babydoll Tops 2026', precio: 50.26, categoria: 'Mujer', tags: ['Babydoll', 'Verano'], rating: 4.3, reviews: 28, image: '/assets/ropa/prod4.png', brand: 'Rapbin' },
    { id: '5', nombre: '5 Pares Calcetines Blancos Encaje', precio: 40.23, categoria: 'Accesorios', tags: ['Encaje', 'Casual'], rating: 4.1, reviews: 789, image: '/assets/ropa/prod5.png', brand: 'VIISION' },
    { id: '6', nombre: 'Chaqueta Zip Y2K Shoujo', precio: 95.00, categoria: 'Mujer', tags: ['Y2K', 'Zip'], rating: 4.5, reviews: 42, image: '/assets/ropa/prod1.png', brand: 'CuteCore' },
    { id: '7', nombre: 'Vestido Mini Estilo Hada', precio: 120.00, categoria: 'Mujer', tags: ['Hada', 'Mini'], rating: 4.7, reviews: 89, image: '/assets/ropa/prod2.png', brand: 'Solongshangmao' },
    { id: '8', nombre: 'Conjunto Casual Piezas Mujer', precio: 150.00, categoria: 'Mujer', tags: ['Casual', 'Set'], rating: 4.6, reviews: 210, image: '/assets/ropa/prod4.png', brand: 'VIISION' },
];

export function ProductCatalogView() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const [priceRange, setPriceRange] = useState([0, 200]);

    useEffect(() => {
        const session = localStorage.getItem('session');
        if (session) {
            setCurrentUser(JSON.parse(session));
        }
        trackEvent('page_view', { page: 'Catalogo_Productos' });
    }, []);

    const filteredProducts = ALL_PRODUCTS.filter(p =>
        (selectedCategory === 'Todas' || p.categoria === selectedCategory) &&
        (p.nombre.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (p.precio >= priceRange[0] && p.precio <= priceRange[1])
    );

    const handleLogout = () => {
        AuthController.logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#FDFCF8] text-stone-900 font-sans selection:bg-stone-200">

            {/* Header / Nav de la Tienda */}
            <nav className="fixed w-full top-0 z-50 bg-[#FDFCF8]/90 backdrop-blur-md border-b border-stone-200">
                <div className="max-w-[1600px] mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-8">
                        <span className="text-2xl font-black text-stone-900 tracking-widest uppercase cursor-pointer" onClick={() => navigate('/tienda')}>
                            VII<span className="text-stone-400">S</span>ION
                        </span>
                        <div className="hidden lg:flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                            <button className="hover:text-stone-900 transition-colors" onClick={() => navigate('/tienda')}>Inicio</button>
                            <button className="text-stone-900 border-b border-stone-900 pb-1">Catálogo</button>
                            <button className="hover:text-stone-900 transition-colors">Colecciones</button>
                        </div>
                    </div>

                    <div className="flex-1 max-w-xl mx-8 relative hidden sm:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" strokeWidth={1.5} />
                        <Input
                            placeholder="Buscar productos por nombre, estilo o marca..."
                            className="bg-stone-100/50 border-stone-200 rounded-none pl-12 h-11 text-sm focus-visible:ring-stone-900 placeholder:text-stone-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        {currentUser ? (
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold uppercase tracking-widest hidden md:block">{currentUser.name}</span>
                                <div className="w-9 h-9 bg-stone-900 text-white flex items-center justify-center font-bold text-xs uppercase" title={currentUser.name}>
                                    {currentUser.name.charAt(0)}
                                </div>
                                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-stone-400 hover:text-stone-900">
                                    <LogOut size={18} strokeWidth={1.5} />
                                </Button>
                            </div>
                        ) : (
                            <Button onClick={() => navigate('/login')} className="bg-stone-900 hover:bg-stone-800 text-white rounded-none h-11 px-8 text-[10px] font-bold uppercase tracking-widest">
                                Acceder
                            </Button>
                        )}
                        <div className="relative cursor-pointer group ml-2">
                            <ShoppingCart size={22} strokeWidth={1.5} className="text-stone-700 group-hover:text-stone-900" />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-stone-900 text-white text-[9px] font-bold flex items-center justify-center rounded-full">0</span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-[1600px] mx-auto px-6 pt-32 pb-20">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Barra Lateral de Filtros */}
                    <aside className="w-full lg:w-64 space-y-10 shrink-0">
                        <div>
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-6 text-stone-900">Categoría</h3>
                            <div className="space-y-3">
                                {['Todas', 'Mujer', 'Hombre', 'Accesorios', 'Colección'].map(cat => (
                                    <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-4 h-4 border ${selectedCategory === cat ? 'bg-stone-900 border-stone-900' : 'border-stone-300 group-hover:border-stone-900'} transition-all`} />
                                        <input
                                            type="radio" className="hidden"
                                            checked={selectedCategory === cat}
                                            onChange={() => setSelectedCategory(cat)}
                                        />
                                        <span className={`text-xs uppercase tracking-widest ${selectedCategory === cat ? 'text-stone-900 font-bold' : 'text-stone-400 hover:text-stone-600'}`}>{cat}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="pt-8 border-t border-stone-100">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-6 text-stone-900">Precio</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-stone-400">
                                    <span>$0</span>
                                    <span>${priceRange[1]}</span>
                                </div>
                                <input
                                    type="range" min="0" max="200"
                                    className="w-full h-1 bg-stone-100 accent-stone-900 cursor-pointer"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                                />
                                <div className="text-[10px] italic text-stone-400">Mostrando hasta ${priceRange[1]} USD</div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-stone-100">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-6 text-stone-900">Vendedor / Marca</h3>
                            <div className="space-y-3">
                                {['VIISION Studios', 'Solongshangmao', 'Haphaphaphap', 'CuteCore'].map(brand => (
                                    <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                                        <div className="w-4 h-4 border border-stone-300 group-hover:border-stone-900 transition-all" />
                                        <span className="text-xs uppercase tracking-widest text-stone-400 hover:text-stone-600 transition-colors">{brand}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Contenido Principal / Grilla de Productos */}
                    <main className="flex-1">

                        {/* Header de Resultados */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 pb-6 border-b border-stone-100">
                            <div>
                                <h1 className="text-2xl font-light text-stone-900 tracking-tight mb-1">Resultados de Búsqueda</h1>
                                <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                                    {filteredProducts.length} Productos Encontrados
                                </p>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3 border-r border-stone-100 pr-6">
                                    <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'text-stone-900 bg-stone-100' : 'text-stone-300 hover:text-stone-600'} transition-all`}>
                                        <LayoutGrid size={18} />
                                    </button>
                                    <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'text-stone-900 bg-stone-100' : 'text-stone-300 hover:text-stone-600'} transition-all`}>
                                        <List size={18} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 cursor-pointer group">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-900">Ordenar por</span>
                                    <ChevronDown size={14} className="text-stone-400 group-hover:text-stone-900 transition-all" />
                                </div>
                            </div>
                        </div>

                        {/* Grilla / Lista */}
                        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-8 gap-y-12" : "space-y-8"}>
                            <AnimatePresence mode="popLayout">
                                {filteredProducts.map((prod, idx) => (
                                    <motion.div
                                        key={prod.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                                        className={viewMode === 'grid' ? "group flex flex-col" : "group flex flex-col md:flex-row gap-8 bg-white p-4 border border-stone-100"}
                                    >
                                        <div className={viewMode === 'grid' ? "relative aspect-[3/4] bg-stone-100 mb-6 overflow-hidden" : "relative w-full md:w-64 aspect-[3/4] bg-stone-100 overflow-hidden"}>
                                            <div className="absolute top-4 left-4 z-10">
                                                <span className="bg-stone-900 text-white text-[9px] font-bold tracking-[0.2em] uppercase px-3 py-1.5">NUEVO</span>
                                            </div>
                                            <button className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-stone-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 shadow-sm">
                                                <Heart size={14} />
                                            </button>
                                            <img src={prod.image} alt={prod.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out" />
                                            {viewMode === 'grid' && (
                                                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                    <Button className="w-full bg-white hover:bg-stone-900 hover:text-white text-stone-900 rounded-none uppercase text-[9px] font-black tracking-widest h-11 border border-stone-900 transition-all">
                                                        Agregar al Carrito
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 flex flex-col pt-2">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{prod.brand}</p>
                                                    <h3 className="text-sm font-medium text-stone-900 group-hover:text-stone-700 transition-colors line-clamp-2">{prod.nombre}</h3>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <div className="flex text-amber-500 gap-0.5 mb-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={10} fill={i < Math.floor(prod.rating) ? "currentColor" : "none"} className={i < Math.floor(prod.rating) ? "" : "text-stone-200"} />
                                                        ))}
                                                    </div>
                                                    <span className="text-[9px] text-stone-400 font-bold uppercase tracking-tighter">({prod.reviews})</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {prod.tags.map(tag => (
                                                    <span key={tag} className="text-[9px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-sm uppercase tracking-wider">{tag}</span>
                                                ))}
                                            </div>

                                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-stone-50">
                                                <div className="flex flex-col">
                                                    <span className="text-lg font-light text-stone-900 leading-none">PEN {prod.precio.toFixed(2)}</span>
                                                    <p className="text-[9px] text-stone-400 font-bold italic mt-1">Envío gratis disponible</p>
                                                </div>
                                                {viewMode === 'list' && (
                                                    <Button className="bg-stone-900 hover:bg-stone-800 text-white rounded-none uppercase text-[10px] font-bold tracking-widest h-10 px-8">
                                                        Agregar
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {filteredProducts.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-32 text-center">
                                <Search size={48} className="text-stone-200 mb-6" strokeWidth={1} />
                                <h3 className="text-xl font-light text-stone-900 mb-2">No se encontraron productos</h3>
                                <p className="text-sm text-stone-400 font-light max-w-sm">Intenta ajustar tus filtros o buscar con términos más generales.</p>
                                <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedCategory('Todas'); setPriceRange([0, 200]); }} className="mt-8 rounded-none border-stone-900 uppercase text-[10px] font-bold tracking-widest">
                                    Limpiar todos los filtros
                                </Button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Footer Minimalista */}
            <footer className="bg-stone-900 py-12 px-6 border-t border-stone-800">
                <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <span className="text-xl font-black text-white tracking-widest uppercase">VII<span className="text-stone-500">S</span>ION</span>
                    <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                        <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                        <a href="#" className="hover:text-white transition-colors">Términos</a>
                        <a href="#" className="hover:text-white transition-colors">Ayuda</a>
                        <a href="#" className="hover:text-white transition-colors">VIISION Studios © 2026</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
