import { useEffect, useMemo, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import Spline from '@splinetool/react-spline'
import { ShoppingCart, Search, Heart, Star, Filter, Menu, X, ChevronRight, Plus, Minus } from 'lucide-react'

const BRAND = {
  name: 'TechParts Hub',
  colors: {
    primary: '#00E3FF',
    dark: '#0A0A0A',
    accent: '#FFB800',
  }
}

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

// ---------------------- UI PRIMITIVES ----------------------
const Container = ({ children, className='' }) => (
  <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
)

const Button = ({ children, onClick, variant='primary', className='', type='button' }) => {
  const variants = {
    primary: 'bg-cyan-500 hover:bg-cyan-400 text-black',
    secondary: 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700',
    ghost: 'bg-transparent hover:bg-white/5 text-cyan-300',
    accent: 'bg-amber-400 hover:bg-amber-300 text-black',
  }
  return (
    <button type={type} onClick={onClick} className={`rounded-lg px-4 py-2 transition-colors duration-200 ${variants[variant]} ${className}`}>
      {children}
    </button>
  )
}

const Badge = ({ children }) => (
  <span className="text-[10px] font-semibold px-2 py-1 rounded bg-amber-400/10 text-amber-300 border border-amber-300/20 uppercase tracking-wide">{children}</span>
)

const Price = ({ value }) => (
  <span className="text-cyan-300 font-semibold">${value.toFixed(2)}</span>
)

// ---------------------- DATA HELPERS ----------------------
async function api(path, opts={}) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { 'Content-Type': 'application/json' }, ...opts })
  if (!res.ok) throw new Error('API error')
  return res.json()
}

// ---------------------- LAYOUT ----------------------
function Navbar({ cartCount, onOpenCart }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [q, setQ] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  useEffect(() => {
    const ctrl = new AbortController()
    const run = async () => {
      if (!q) { setSuggestions([]); return }
      const list = await api(`/api/search/suggestions?q=${encodeURIComponent(q)}`).catch(() => [])
      setSuggestions(list)
    }
    const id = setTimeout(run, 180)
    return () => { clearTimeout(id); ctrl.abort() }
  }, [q])

  const goSearch = (s) => {
    const term = typeof s === 'string' ? s : q
    if (!term) return
    navigate(`/shop?q=${encodeURIComponent(term)}`)
    setSuggestions([])
  }

  const categories = ['Microcontrollers', 'Sensors', 'Tools', 'PC Components', 'Electrical', 'Robotics', 'DIY Kits', 'Components']

  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-black/40 bg-black/60 border-b border-white/10">
      <Container className="flex items-center gap-6 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-cyan-400 to-amber-300" />
          <span className="text-white font-bold tracking-tight">{BRAND.name}</span>
        </Link>
        <nav className="hidden lg:flex gap-4 text-sm">
          {categories.map(c => (
            <Link key={c} to={`/shop?category=${encodeURIComponent(c)}`} className="text-neutral-300 hover:text-cyan-300 transition-colors">{c}</Link>
          ))}
        </nav>
        <div className="relative flex-1 hidden md:block">
          <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&goSearch()} placeholder="Search microcontrollers, sensors, tools..." className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-neutral-400 outline-none focus:ring-2 ring-cyan-400" />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
          {suggestions.length>0 && (
            <div className="absolute mt-2 w-full bg-neutral-900/95 border border-white/10 rounded-lg p-2 max-h-64 overflow-auto">
              {suggestions.map(s => (
                <button key={s} onClick={()=>goSearch(s)} className="w-full text-left px-3 py-2 rounded hover:bg-white/5 text-neutral-200">{s}</button>
              ))}
            </div>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Link to="/wishlist" className="p-2 rounded-lg hover:bg-white/5 text-cyan-300"><Heart /></Link>
          <button onClick={onOpenCart} className="relative p-2 rounded-lg hover:bg-white/5 text-cyan-300">
            <ShoppingCart />
            {cartCount>0 && <span className="absolute -right-1 -top-1 text-[10px] bg-amber-400 text-black rounded-full px-1">{cartCount}</span>}
          </button>
          <button className="lg:hidden p-2 text-neutral-300" onClick={()=>setMobileOpen(v=>!v)}>{mobileOpen? <X/>:<Menu/>}</button>
        </div>
      </Container>
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/10 bg-black/80">
          <Container className="py-3 grid grid-cols-2 gap-2">
            {categories.map(c => (
              <Link key={c} to={`/shop?category=${encodeURIComponent(c)}`} className="px-3 py-2 rounded bg-white/5 text-neutral-200 hover:text-cyan-300">{c}</Link>
            ))}
          </Container>
        </div>
      )}
    </header>
  )
}

function Footer(){
  return (
    <footer className="mt-20 border-t border-white/10 bg-black/60">
      <Container className="py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-10 text-neutral-300">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-cyan-400 to-amber-300" />
            <span className="text-white font-bold">{BRAND.name}</span>
          </div>
          <p className="text-sm text-neutral-400">Quality components, fast shipping, maker-first support.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/shop?category=Microcontrollers" className="hover:text-cyan-300">Microcontrollers</Link></li>
            <li><Link to="/shop?category=Sensors" className="hover:text-cyan-300">Sensors & Modules</Link></li>
            <li><Link to="/shop?category=Tools" className="hover:text-cyan-300">Tools & Soldering</Link></li>
            <li><Link to="/shop?category=PC Components" className="hover:text-cyan-300">PC Components</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-cyan-300">About</Link></li>
            <li><Link to="/contact" className="hover:text-cyan-300">Contact</Link></li>
            <li><Link to="/support" className="hover:text-cyan-300">Support</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Contact</h4>
          <p className="text-sm text-neutral-400">support@techparts.hub<br/>Mon-Fri 9am-6pm</p>
        </div>
      </Container>
      <div className="py-4 text-center text-xs text-neutral-500">© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</div>
    </footer>
  )
}

// ---------------------- PAGES ----------------------
function Home(){
  const [newArrivals, setNewArrivals] = useState([])
  const [best, setBest] = useState([])
  useEffect(()=>{ api('/api/products/new').then(setNewArrivals).catch(()=>{}); api('/api/products/best').then(setBest).catch(()=>{}) },[])

  const categories = [
    { name: 'Electronics', icon: '🔌' },
    { name: 'Tools', icon: '🛠️' },
    { name: 'Robotics', icon: '🤖' },
    { name: 'Components', icon: '⚙️' },
  ]

  return (
    <div>
      <section className="relative min-h-[68vh] grid lg:grid-cols-2 items-center bg-[radial-gradient(600px_circle_at_10%_10%,rgba(0,227,255,.15),transparent),radial-gradient(600px_circle_at_90%_30%,rgba(255,184,0,.12),transparent)]">
        <div className="absolute inset-0 -z-0">
          <Spline scene="https://prod.spline.design/xXD1hOqciVNtJX50/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        </div>
        <Container className="relative z-10 py-16 lg:py-24">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">Power your projects with premium hardware</h1>
          <p className="mt-4 text-neutral-300 max-w-2xl">From microcontrollers to robotics kits, find everything you need to build, prototype, and ship faster. Curated by makers, for makers.</p>
          <div className="mt-8 flex gap-3">
            <Link to="/shop"><Button variant="primary">Shop now</Button></Link>
            <a href="#new"><Button variant="secondary">New arrivals</Button></a>
          </div>
        </Container>
      </section>

      <Container className="relative -mt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(c => (
            <Link key={c.name} to={`/shop?category=${encodeURIComponent(c.name)}`} className="group rounded-xl p-6 bg-neutral-900/70 border border-white/10 hover:border-cyan-400/40 transition-colors">
              <div className="text-3xl">{c.icon}</div>
              <div className="mt-3 text-white font-semibold">{c.name}</div>
              <div className="text-xs text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">Explore <ChevronRight className="inline h-3"/></div>
            </Link>
          ))}
        </div>
      </Container>

      <Container id="new" className="mt-16">
        <SectionHeader title="New arrivals" subtitle="Fresh picks for makers" />
        <ProductGrid items={newArrivals} />
      </Container>

      <Container className="mt-16">
        <SectionHeader title="Best sellers" subtitle="Loved by the community" />
        <ProductGrid items={best} />
      </Container>

      <Container className="mt-16">
        <SectionHeader title="What customers say" subtitle="Real reviews from real builders" />
        <ReviewsSlider />
      </Container>
    </div>
  )
}

function SectionHeader({ title, subtitle }){
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className="text-white text-2xl md:text-3xl font-bold">{title}</h2>
        <p className="text-neutral-400 text-sm">{subtitle}</p>
      </div>
      <div className="hidden md:block h-px flex-1 mx-6 bg-gradient-to-r from-cyan-400/50 to-transparent" />
    </div>
  )
}

function ProductGrid({ items=[] }){
  if (!items || items.length===0) return <p className="text-neutral-400">No products yet. Use the seed action on the test page.</p>
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {items.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}

function ProductCard({ product }){
  return (
    <Link to={`/product/${product.id}`} className="group bg-neutral-900/70 border border-white/10 rounded-xl overflow-hidden hover:border-cyan-400/40 transition">
      <div className="aspect-[4/3] bg-black/60">
        <img src={(product.images&&product.images[0])||'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop'} alt={product.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform" />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {product.is_new && <Badge>New</Badge>}
          {product.is_best_seller && <Badge>Best</Badge>}
          {product.discount_percent && <Badge>-{product.discount_percent}%</Badge>}
        </div>
        <h3 className="text-white font-semibold line-clamp-1">{product.title}</h3>
        <p className="text-xs text-neutral-400 line-clamp-2 min-h-[32px]">{product.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <Price value={product.price} />
          <div className="flex items-center gap-1 text-amber-300">
            <Star className="h-4 w-4 fill-amber-300"/> <span className="text-xs text-neutral-300">{product.rating?.toFixed?.(1)||'4.5'}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function Shop(){
  const { search } = useLocation()
  const params = useMemo(()=>new URLSearchParams(search),[search])
  const [list, setList] = useState({ items: [], total: 0 })
  const [openFilters, setOpenFilters] = useState(false)

  const [filters, setFilters] = useState({
    q: params.get('q')||'',
    category: params.get('category')||'',
    brand: '',
    minPrice: '',
    maxPrice: '',
    rating: '',
    sort: 'newest',
  })

  useEffect(()=>{
    const qs = new URLSearchParams()
    Object.entries(filters).forEach(([k,v])=>{ if(v!=='' && v!==null) qs.set(k, v) })
    api(`/api/products?${qs.toString()}`).then(setList).catch(()=>setList({items:[], total:0}))
  }, [filters])

  const setF = (k,v)=> setFilters(prev=>({ ...prev, [k]: v }))

  return (
    <Container className="py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-white text-2xl font-bold">Shop</h1>
        <button onClick={()=>setOpenFilters(v=>!v)} className="md:hidden text-neutral-300 flex items-center gap-2"><Filter className="h-4"/> Filters</button>
      </div>
      <div className="grid md:grid-cols-4 gap-6">
        <aside className={`md:col-span-1 ${openFilters? 'block':'hidden md:block'}`}>
          <div className="bg-neutral-900/70 border border-white/10 rounded-xl p-4 space-y-4">
            <input value={filters.q} onChange={e=>setF('q', e.target.value)} placeholder="Search..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-400" />
            <div>
              <label className="text-xs text-neutral-400">Category</label>
              <select value={filters.category} onChange={e=>setF('category', e.target.value)} className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                <option value="">All</option>
                {['Microcontrollers','Sensors','Tools','PC Components','Electrical','Robotics','DIY Kits','Components'].map(c=> <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-neutral-400">Min Price</label>
                <input value={filters.minPrice} onChange={e=>setF('minPrice', e.target.value)} type="number" className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-xs text-neutral-400">Max Price</label>
                <input value={filters.maxPrice} onChange={e=>setF('maxPrice', e.target.value)} type="number" className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
            </div>
            <div>
              <label className="text-xs text-neutral-400">Min Rating</label>
              <input value={filters.rating} onChange={e=>setF('rating', e.target.value)} type="number" min="0" max="5" step="0.1" className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs text-neutral-400">Sort</label>
              <select value={filters.sort} onChange={e=>setF('sort', e.target.value)} className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating_desc">Rating</option>
              </select>
            </div>
          </div>
        </aside>
        <section className="md:col-span-3">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {list.items.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      </div>
    </Container>
  )
}

function ProductPage(){
  const { pathname } = useLocation()
  const id = pathname.split('/').pop()
  const [product, setProduct] = useState(null)
  const [qty, setQty] = useState(1)

  useEffect(()=>{ api(`/api/products/${id}`).then(setProduct).catch(()=>{}) },[id])

  if (!product) return <Container className="py-16"><div className="text-neutral-400">Loading...</div></Container>

  return (
    <Container className="py-8">
      <div className="grid lg:grid-cols-2 gap-10">
        <div>
          <div className="aspect-square rounded-xl overflow-hidden bg-neutral-900/60 border border-white/10">
            <img src={(product.images&&product.images[0])||'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop'} alt={product.title} className="w-full h-full object-cover" />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {(product.images||[]).slice(0,4).map((img,i)=> (
              <img key={i} src={img} className="aspect-square rounded-lg object-cover border border-white/10" />
            ))}
          </div>
        </div>
        <div>
          <h1 className="text-white text-3xl font-bold">{product.title}</h1>
          <div className="mt-2 flex items-center gap-2 text-amber-300"><Star className="h-4 w-4 fill-amber-300"/> <span className="text-sm text-neutral-300">{product.rating?.toFixed?.(1) || '4.5'} · {product.reviews_count || 0} reviews</span></div>
          <p className="mt-3 text-neutral-300">{product.description}</p>

          <div className="mt-6 flex items-center gap-4">
            <Price value={product.price} />
            <div className="flex items-center gap-2">
              <button onClick={()=>setQty(q=>Math.max(1,q-1))} className="p-1 rounded bg-white/5 border border-white/10 text-white"><Minus/></button>
              <span className="text-white">{qty}</span>
              <button onClick={()=>setQty(q=>q+1)} className="p-1 rounded bg-white/5 border border-white/10 text-white"><Plus/></button>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <Button variant="primary">Add to cart</Button>
            <Button variant="accent">Buy now</Button>
          </div>

          <div className="mt-8">
            <h3 className="text-white font-semibold mb-2">Specifications</h3>
            <div className="bg-neutral-900/70 border border-white/10 rounded-xl divide-y divide-white/10">
              {Object.entries(product.specs||{}).map(([k,v])=> (
                <div key={k} className="flex justify-between px-4 py-3 text-sm text-neutral-300"><span className="text-neutral-400">{k}</span><span>{String(v)}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <SectionHeader title="You may also like" subtitle="More picks for you" />
        <RelatedProducts category={product.category} currentId={product.id} />
      </div>
    </Container>
  )
}

function RelatedProducts({ category, currentId }){
  const [data, setData] = useState([])
  useEffect(()=>{ api(`/api/products?category=${encodeURIComponent(category)}&limit=4`).then(r=>setData(r.items||[])).catch(()=>{}) },[category])
  return <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">{data.filter(p=>p.id!==currentId).map(p=> <ProductCard key={p.id} product={p} />)}</div>
}

function ReviewsSlider(){
  const items = [
    { name: 'Alex', text: 'Fast delivery and genuine parts. My go-to store for robotics gear.' },
    { name: 'Priya', text: 'Loved the curated kits. The ESP32 kit was perfect for my class.' },
    { name: 'Marco', text: 'Great prices on SSDs and top-notch support. Highly recommend.' },
  ]
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-neutral-900/70">
      <div className="flex animate-[scroll_20s_linear_infinite] hover:[animation-play-state:paused]">
        {[...items, ...items].map((r,i)=> (
          <div key={i} className="min-w-[300px] sm:min-w-[420px] p-6 border-r border-white/10">
            <div className="text-white font-semibold">{r.name}</div>
            <p className="text-neutral-300 text-sm">{r.text}</p>
          </div>
        ))}
      </div>
      <style>{`@keyframes scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </div>
  )
}

function About(){
  return (
    <Container className="py-12 text-neutral-300">
      <h1 className="text-white text-3xl font-bold">About {BRAND.name}</h1>
      <p className="mt-4">We are a team of engineers and makers on a mission to deliver quality, reliability, and fast delivery to builders worldwide. Our values are simple: ship quality parts, support projects, and keep learning.</p>
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        {["Quality","Reliability","Fast Delivery"].map(v=> (
          <div key={v} className="p-6 rounded-xl bg-neutral-900/70 border border-white/10">
            <h3 className="text-white font-semibold">{v}</h3>
            <p className="text-sm text-neutral-400 mt-2">{v==='Quality'? 'We source from trusted brands and test parts.': v==='Reliability'? 'Stock visibility and accurate specs you can trust.':'Same-day dispatch on most orders.'}</p>
          </div>
        ))}
      </div>
    </Container>
  )
}

function Contact(){
  return (
    <Container className="py-12 text-neutral-300">
      <h1 className="text-white text-3xl font-bold">Contact</h1>
      <form className="mt-6 grid md:grid-cols-2 gap-4">
        <input placeholder="Name" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"/>
        <input placeholder="Email" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"/>
        <textarea placeholder="Message" className="md:col-span-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white min-h-[120px]"/>
        <Button className="md:col-span-2" variant="primary">Send message</Button>
      </form>
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-neutral-900/70 border border-white/10">
          <h3 className="text-white font-semibold mb-2">Support hours</h3>
          <p className="text-sm text-neutral-400">Mon-Fri 9am-6pm (UTC)</p>
        </div>
        <div className="p-6 rounded-xl bg-neutral-900/70 border border-white/10">
          <h3 className="text-white font-semibold mb-2">Map</h3>
          <iframe title="map" className="w-full h-48 rounded-lg" src="https://www.openstreetmap.org/export/embed.html?bbox=-0.15%2C51.5%2C-0.1%2C51.52&layer=mapnik"></iframe>
        </div>
      </div>
    </Container>
  )
}

function Cart(){
  return (
    <Container className="py-12 text-neutral-300">
      <h1 className="text-white text-3xl font-bold">Cart</h1>
      <p className="mt-4 text-neutral-400">Cart UI placeholder. Use the Buy Now flow on product pages for a quick demo checkout.</p>
    </Container>
  )
}

function Checkout(){
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [addr, setAddr] = useState('')
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState('')

  const place = async () => {
    setLoading(true)
    try{
      const payload = { customer_name: name, email, shipping_address: addr, payment_method: 'card', items: [], notes: '' }
      const res = await api('/api/checkout', { method: 'POST', body: JSON.stringify(payload) })
      setOrderId(res.order_id)
    }catch(e){}
    setLoading(false)
  }

  return (
    <Container className="py-12 text-neutral-300">
      <h1 className="text-white text-3xl font-bold">Checkout</h1>
      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"/>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"/>
          <textarea value={addr} onChange={e=>setAddr(e.target.value)} placeholder="Shipping address" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white min-h-[100px]"/>
        </div>
        <div className="p-6 rounded-xl bg-neutral-900/70 border border-white/10">
          <h3 className="text-white font-semibold">Order summary</h3>
          <p className="text-sm text-neutral-400">This demo confirms orders without real payment.</p>
          <Button className="mt-4 w-full" variant="accent" onClick={place}>{loading? 'Placing...':'Place order'}</Button>
          {orderId && <p className="mt-3 text-cyan-300 text-sm">Order confirmed: {orderId}</p>}
        </div>
      </div>
    </Container>
  )
}

// ---------------------- APP SHELL ----------------------
function Shell(){
  const [cartOpen, setCartOpen] = useState(false)
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-neutral-200 selection:bg-cyan-400/30 selection:text-white">
      <Navbar cartCount={0} onOpenCart={()=>setCartOpen(true)} />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/shop" element={<Shop/>} />
        <Route path="/product/:id" element={<ProductPage/>} />
        <Route path="/about" element={<About/>} />
        <Route path="/contact" element={<Contact/>} />
        <Route path="/cart" element={<Cart/>} />
        <Route path="/checkout" element={<Checkout/>} />
      </Routes>
      <Footer />
    </div>
  )
}

export default function App(){
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}
