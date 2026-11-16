import { useRef, useState } from 'react'
import { api, newKey } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Badge, Button, Card, Empty, Field, Loading, PageHead, naira, toKobo, act, useFetch, list } from '../components/ui'

const Tabs=({tabs,v,set})=><div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-ink/5 p-1">{tabs.map(t=><button key={t} onClick={()=>set(t)} className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize ${v===t?'bg-white shadow-sm':'text-ink/60'}`}>{t}</button>)}</div>

function Apply(){
  const {reload}=useAuth(), [f,setF]=useState({storeName:'',description:'',bankName:'',accountNumber:'',accountName:''}), s=k=>e=>setF({...f,[k]:e.target.value})
  const go=async e=>{ e.preventDefault(); (await act(()=>api('/vendors/apply',{method:'POST',body:{storeName:f.storeName,description:f.description,bankDetails:{bankName:f.bankName,accountNumber:f.accountNumber,accountName:f.accountName}}}).then(()=>true),'Application sent. An admin will review it.'))&&reload() }
  return <Card className="max-w-xl"><h2 className="text-xl font-bold">Start selling</h2><p className="mb-4 text-sm text-ink/60">Tell us about your store and where to send your earnings.</p>
    <form onSubmit={go} className="space-y-3"><Field label="Store name" required value={f.storeName} onChange={s('storeName')}/><Field label="Description" value={f.description} onChange={s('description')}/>
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Bank" required value={f.bankName} onChange={s('bankName')}/><Field label="Account number" required maxLength={10} value={f.accountNumber} onChange={s('accountNumber')}/></div>
      <Field label="Account name" required value={f.accountName} onChange={s('accountName')}/><Button>Apply to sell</Button></form></Card>
}
function Products(){
  const {data,reload}=useFetch('/products?vendor=me'), [f,setF]=useState({name:'',price:'',stock:'',category:'',description:''}), s=k=>e=>setF({...f,[k]:e.target.value})
  const add=async e=>{ e.preventDefault(); (await act(()=>api('/products',{method:'POST',body:{...f,price:toKobo(f.price),stock:+f.stock,slug:f.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}}).then(()=>true),'Product created'))&&(setF({name:'',price:'',stock:'',category:'',description:''}),reload()) }
  return <div className="grid gap-6 lg:grid-cols-3"><Card className="h-fit"><h3 className="mb-3 font-bold">New product</h3><form onSubmit={add} className="space-y-3">
    <Field label="Name" required value={f.name} onChange={s('name')}/><Field label="Price (₦)" type="number" min="1" required value={f.price} onChange={s('price')}/>
    <Field label="Stock" type="number" min="0" required value={f.stock} onChange={s('stock')}/><Field label="Category" required value={f.category} onChange={s('category')}/><Field label="Description" value={f.description} onChange={s('description')}/><Button className="w-full">Create product</Button></form></Card>
    <div className="space-y-2 lg:col-span-2">{!list(data).length?<Empty title="No products yet"/>:list(data).map(p=><Card key={p._id} className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate font-medium">{p.name}</p><p className="text-sm text-ink/60">{naira(p.price)} · {p.stock} in stock</p></div>
      <Button variant="ghost" onClick={()=>act(()=>api(`/products/${p._id}`,{method:'DELETE'}),'Product removed').then(reload)}>Remove</Button></Card>)}</div></div>
}
function VOrders(){
  const {data,loading,reload}=useFetch('/orders'); if(loading) return <Loading/>
  const subs=list(data).flatMap(o=>o.subOrders||o.sub_orders||[o])
  return !subs.length?<Empty title="No orders yet"/>:<div className="space-y-2">{subs.map(s=><Card key={s.id} className="flex flex-wrap items-center justify-between gap-3">
    <div><p className="font-medium">{(s.items||[]).map(i=>`${i.quantity}× ${i.name}`).join(', ')||`Sub-order ${String(s.id).slice(0,8)}`}</p><p className="text-sm text-ink/60">{naira(s.totalKobo??s.total_kobo)}</p></div>
    <div className="flex items-center gap-3"><Badge s={s.status}/>{s.status==='PAID'&&<Button onClick={()=>act(()=>api(`/sub-orders/${s.id}/ship`,{method:'PATCH'}),'Marked as shipped').then(reload)}>Mark shipped</Button>}</div></Card>)}</div>
}
function Payouts(){
  const w=useFetch('/wallet'), p=useFetch('/payouts'), [amt,setAmt]=useState(''), key=useRef(newKey())
  const go=async e=>{ e.preventDefault(); if(await act(()=>api('/payouts',{method:'POST',key:key.current,body:{amountKobo:toKobo(amt)}}),'Payout requested')){ key.current=newKey(); setAmt(''); w.reload(); p.reload() } }
  return <div className="grid gap-6 lg:grid-cols-3"><Card className="h-fit"><p className="text-ink/60">Available to withdraw</p><p className="mb-4 font-display text-3xl font-extrabold">{naira(w.data?.balanceKobo??w.data?.balance_kobo)}</p>
    <form onSubmit={go} className="space-y-3"><Field label="Amount (₦) · minimum ₦1,000" type="number" min="1000" required value={amt} onChange={e=>setAmt(e.target.value)}/><Button className="w-full">Request payout</Button></form></Card>
    <div className="space-y-2 lg:col-span-2">{!list(p.data).length?<Empty title="No payouts yet"/>:list(p.data).map(x=><Card key={x.id} className="flex items-center justify-between"><div><p className="font-display font-bold">{naira(x.amountKobo??x.amount_kobo)}</p><p className="text-xs text-ink/50">{new Date(x.createdAt||x.created_at).toLocaleString()}</p></div><Badge s={x.status}/></Card>)}</div></div>
}
export default function Vendor(){
  const {user}=useAuth(), [t,setT]=useState('orders'), st=user?.vendor?.status||user?.vendorStatus
  if(st!=='approved') return <><PageHead title="Sell on KoboMarket"/>{st?<Card className="max-w-xl">Your application is <Badge s={st}/>. We will notify you when it changes.</Card>:<Apply/>}</>
  return <><PageHead title={user.vendor?.storeName||'Your store'} sub="Ship orders, manage stock and withdraw earnings."/>
    <Tabs tabs={['orders','products','payouts']} v={t} set={setT}/>{t==='orders'?<VOrders/>:t==='products'?<Products/>:<Payouts/>}</>
}
