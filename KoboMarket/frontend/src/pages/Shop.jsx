import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, qs } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Button, Card, Empty, Field, Loading, PageHead, Select, naira, toKobo, act, useFetch } from '../components/ui'

const Stars=({n=0})=><span className="text-saffron" aria-label={`${n} out of 5`}>{'★'.repeat(Math.round(n))}<span className="text-ink/20">{'★'.repeat(5-Math.round(n))}</span></span>
const Img=({p,className=''})=><div className={`bg-kobo-50 ${className}`}>{p.images?.[0]?<img src={p.images[0]} alt={p.name} className="h-full w-full object-cover"/>:<div className="flex h-full items-center justify-center font-display text-4xl text-kobo-500/40">{p.name?.[0]}</div>}</div>

export function Shop(){
  const [f,setF]=useState({q:'',category:'',sort:'newest',minPrice:'',maxPrice:''}), [items,setItems]=useState([]), [cursor,setCursor]=useState(null), [next,setNext]=useState(null), [l,setL]=useState(true)
  const fetchPage=async(c,reset)=>{ setL(true); try{ const d=await api('/products'+qs({...f,minPrice:f.minPrice&&toKobo(f.minPrice),maxPrice:f.maxPrice&&toKobo(f.maxPrice),cursor:c,limit:12}))
    const arr=Array.isArray(d)?d:d.items||[]; setItems(x=>reset?arr:[...x,...arr]); setNext(d.nextCursor||null) }catch(e){ act(()=>{throw e}) } setL(false) }
  useEffect(()=>{ const t=setTimeout(()=>fetchPage(null,true),300); return()=>clearTimeout(t)},[f])
  const set=k=>e=>setF({...f,[k]:e.target.value})
  return <>
    <PageHead title="Find something good" sub="Every purchase is protected by escrow."/>
    <Card className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <div className="lg:col-span-2"><Field label="Search" placeholder="Sneakers, ankara, phone…" value={f.q} onChange={set('q')}/></div>
      <Field label="Category" value={f.category} onChange={set('category')}/>
      <Field label="Min ₦" type="number" min="0" value={f.minPrice} onChange={set('minPrice')}/>
      <Select label="Sort by" value={f.sort} onChange={set('sort')}><option value="newest">Newest</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option><option value="rating">Top rated</option></Select>
    </Card>
    {!items.length&&!l?<Empty title="No products match" hint="Try a different search or clear the filters."/>:
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{items.map(p=>
      <Link key={p._id||p.id} to={`/products/${p.slug}`} className="group overflow-hidden rounded-2xl bg-white ring-1 ring-ink/10 transition hover:ring-kobo-500">
        <Img p={p} className="aspect-square"/><div className="p-3"><p className="truncate font-medium">{p.name}</p>
        <div className="mt-1 flex items-center justify-between"><span className="font-display font-bold text-kobo-600">{naira(p.price)}</span><Stars n={p.averageRating}/></div></div></Link>)}</div>}
    {l&&<Loading/>}{next&&!l&&<div className="mt-6 text-center"><Button variant="ghost" onClick={()=>fetchPage(next)}>Load more</Button></div>}</>
}

export function Product(){
  const {slug}=useParams(), {user}=useAuth(), {data:p,loading,reload}=useFetch(`/products/${slug}`), [v,setV]=useState(null), [q,setQ]=useState(1), [r,setR]=useState({rating:5,comment:''})
  if(loading) return <Loading/>; if(!p) return <Empty title="Product not found"/>
  const price=v?.price??p.price
  const add=()=>act(()=>api('/cart/items',{method:'POST',body:{productId:p._id||p.id,variantId:v?._id,quantity:q}}),'Added to cart')
  const review=async e=>{ e.preventDefault(); (await act(()=>api(`/products/${p._id||p.id}/reviews`,{method:'POST',body:r}).then(()=>true),'Review posted'))&&reload() }
  return <div className="grid gap-8 lg:grid-cols-2">
    <Img p={p} className="aspect-square overflow-hidden rounded-2xl"/>
    <div><h1 className="text-3xl font-bold">{p.name}</h1><div className="mt-2 flex items-center gap-2"><Stars n={p.averageRating}/><span className="text-sm text-ink/60">{p.reviewCount||0} reviews</span></div>
      <p className="mt-4 font-display text-3xl font-extrabold text-kobo-600">{naira(price)}</p><p className="mt-4 text-ink/70">{p.description}</p>
      {p.variants?.length>0&&<div className="mt-5 flex flex-wrap gap-2">{p.variants.map(x=><button key={x._id||x.name} onClick={()=>setV(x)} className={`rounded-lg px-3 py-2 text-sm ring-1 ${v===x?'bg-ink text-white ring-ink':'ring-ink/20'}`}>{x.name} · {naira(x.price)}</button>)}</div>}
      <p className="mt-4 text-sm text-ink/60">{p.stock>0?`${p.stock} in stock`:'Out of stock'}</p>
      <div className="mt-5 flex gap-3"><input type="number" min="1" value={q} onChange={e=>setQ(+e.target.value)} className="w-20 rounded-lg px-3 ring-1 ring-ink/15" aria-label="Quantity"/>
        <Button disabled={!user||p.stock<1} onClick={add} className="flex-1">{user?'Add to cart':'Log in to buy'}</Button></div>
      <div className="mt-10"><h2 className="mb-3 text-xl font-bold">Reviews</h2>
        {(p.reviews||[]).map(x=><Card key={x._id} className="mb-2"><Stars n={x.rating}/><p className="mt-1 text-sm">{x.comment}</p></Card>)}
        {user&&<form onSubmit={review} className="mt-4 space-y-3"><Select label="Rating" value={r.rating} onChange={e=>setR({...r,rating:+e.target.value})}>{[5,4,3,2,1].map(n=><option key={n}>{n}</option>)}</Select>
          <Field label="Comment (only buyers with a completed order can review)" value={r.comment} onChange={e=>setR({...r,comment:e.target.value})}/><Button variant="dark">Post review</Button></form>}</div></div></div>
}
