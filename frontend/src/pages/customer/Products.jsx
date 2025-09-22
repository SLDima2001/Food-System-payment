import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const sortFunctions = {
  'price-asc': (a,b) => (a.price||0) - (b.price||0),
  'price-desc': (a,b) => (b.price||0) - (a.price||0),
  'name-asc': (a,b) => (a.name||'').localeCompare(b.name||''),
  'name-desc': (a,b) => (b.name||'').localeCompare(a.name||'')
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('price-asc');
  const [addingId, setAddingId] = useState(null);
  const navigate = useNavigate();

  useEffect(()=>{
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await api.getProducts();
        if (mounted) setProducts(data.products || []);
      } catch(e){
        if (mounted) setError(e.message || 'Failed to load products');
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  },[]);

  const categories = useMemo(()=>{
    const set = new Set();
    products.forEach(p => { if (p.category) set.add(p.category); });
    return ['All', ...Array.from(set).sort()];
  },[products]);

  const filtered = products.filter(p => {
    const name = (p.name||'').toLowerCase();
    const termOk = name.includes(search.toLowerCase());
    const catOk = selectedCategory === 'All' || p.category === selectedCategory;
    return termOk && catOk;
  }).sort(sortFunctions[sortBy]);

  const handleAdd = async (prod) => {
    try {
      setAddingId(prod.id || prod._id);
      await api.addToCart(prod.id || prod._id, 1);
      setTimeout(()=> setAddingId(null), 1000);
    } catch(e) {
      alert(e.message || 'Failed to add to cart');
      setAddingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Banner */}
      <div className="w-full h-48 md:h-56 bg-gradient-to-r from-green-900 to-green-600 flex items-center justify-center text-center text-white">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight">The lowest prices just for you</h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Top bar */}
        <div className="flex flex-col md:flex-row gap-4 md:items-center mb-6">
          <div className="flex items-center gap-2 w-full md:w-72">
            <label className="text-sm font-medium text-gray-600">Categories</label>
            <select
              value={selectedCategory}
              onChange={e=>setSelectedCategory(e.target.value)}
              className="flex-1 border rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
            >
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1 relative">
            <input
              value={search}
              onChange={e=>setSearch(e.target.value)}
              placeholder="Search products"
              className="w-full border rounded-md pl-10 pr-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-56">
            <label className="text-sm font-medium text-gray-600">Sort by</label>
            <select
              value={sortBy}
              onChange={e=>setSortBy(e.target.value)}
              className="flex-1 border rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
            >
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="name-asc">Name (A - Z)</option>
              <option value="name-desc">Name (Z - A)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar categories list */}
          <aside className="col-span-12 md:col-span-3 lg:col-span-2 border-r md:pr-4">
            <h2 className="text-sm font-semibold mb-3 text-gray-700">Shop by Category</h2>
            <ul className="max-h-[480px] overflow-auto pr-2 text-sm space-y-1 custom-scroll">
              {categories.map(c => (
                <li key={c}>
                  <button
                    onClick={()=>setSelectedCategory(c)}
                    className={`w-full text-left px-2 py-1 rounded hover:bg-green-50 ${selectedCategory===c?'bg-green-100 text-green-700 font-medium':''}`}
                  >{c}</button>
                </li>
              ))}
              <li className="pt-2">
                <button onClick={()=>setSelectedCategory('All')} className="text-xs text-gray-500 hover:text-green-600">Reset Selection</button>
              </li>
            </ul>
          </aside>

          {/* Products grid */}
          <main className="col-span-12 md:col-span-9 lg:col-span-10">
            {loading && <div className="py-20 text-center text-gray-500">Loading products...</div>}
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-sm text-red-700 rounded">{error}</div>}
            {!loading && !filtered.length && <div className="py-12 text-center text-gray-500">No products match your filters.</div>}
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map(p => {
                const pid = p.id || p._id;
                const img = p.image || (p.images && p.images[0]) || '/src/assets/1.jpg';
                return (
                  <div key={pid} className="group border rounded-lg p-4 flex flex-col hover:shadow-md transition-shadow">
                    <Link to={`/product/${pid}`} className="block mb-3 aspect-[4/3] bg-white overflow-hidden rounded border">
                      <img src={img} alt={p.name} className="object-contain w-full h-full group-hover:scale-105 transition-transform" />
                    </Link>
                    <div className="flex-1 flex flex-col">
                      <Link to={`/product/${pid}`} className="text-sm font-medium text-gray-800 leading-tight mb-1 line-clamp-2 group-hover:text-green-700">{p.name}</Link>
                      <div className="text-xs text-gray-500 mb-2">{p.category || 'General'}</div>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div>
                          <div className="text-sm font-semibold text-green-700">Rs {(p.price||0).toFixed(2)}</div>
                        </div>
                        <button
                          onClick={()=>handleAdd(p)}
                          disabled={addingId === pid || (p.stock !== undefined && p.stock < 1)}
                          className="text-xs px-3 py-2 rounded-md text-white font-medium disabled:opacity-50"
                          style={{backgroundColor:'#51ac37'}}
                        >{addingId === pid ? 'Adding...' : (p.stock === 0 ? 'Out' : 'Add to Cart')}</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
