import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, newKey } from '../api/client'
import { Button, Card, Empty, Loading, PageHead, naira, act, useFetch, list } from '../components/ui'

export default function Cart(){
  const {data,loading,reload}=useFetch('/cart'), nav=useNavigate(), key=useRef(newKey()), [busy,setB]=useState(false)
  if(loading) return <Loading/>
  const items=list(data?.items?data:data?.items||data), total=items.reduce((s,i)=>s+i.price*i.quantity,0)
  const upd=(i,q)=>act(()=>api(`/cart/items/${i._id}`,{method:'PATCH',body:{quantity:q}})).then(reload)
  const del=i=>act(()=>api(`/cart/items/${i._id}`,{method:'DELETE'})).then(reload)
  const checkout=async()=>{ setB(true); const r=await act(()=>api('/orders/checkout',{method:'POST',key:key.current,body:{cartId:data?._id}}),'Order placed. Funds are held in escrow.'); setB(false); if(r){ key.current=newKey(); nav('/orders') } }
  return <><PageHead title="Your cart" sub="Prices are re-checked at checkout."/>
    {!items.length?<Empty title="Your cart is empty" hint="Add something from the shop."/>:
    <div className="grid gap-6 lg:grid-cols-3"><div className="space-y-3 lg:col-span-2">{items.map(i=>
      <Card key={i._id} className="flex items-center gap-4"><div className="min-w-0 flex-1"><p className="truncate font-medium">{i.name}</p><p className="text-sm text-ink/60">{naira(i.price)} each</p></div>
        <div className="flex items-center gap-2"><Button variant="ghost" className="!px-3" onClick={()=>i.quantity>1?upd(i,i.quantity-1):del(i)}>−</Button><span className="w-6 text-center">{i.quantity}</span><Button variant="ghost" className="!px-3" onClick={()=>upd(i,i.quantity+1)}>+</Button></div>
        <p className="w-28 text-right font-display font-bold">{naira(i.price*i.quantity)}</p><button onClick={()=>del(i)} className="text-ink/40 hover:text-red-600" aria-label="Remove">✕</button></Card>)}</div>
      <Card className="h-fit"><p className="text-ink/60">Total</p><p className="font-display text-3xl font-extrabold">{naira(total)}</p>
        <p className="mb-4 mt-2 text-xs text-ink/60">Paid from your wallet and held in escrow until you confirm delivery.</p><Button loading={busy} onClick={checkout} className="w-full">Pay with wallet</Button></Card></div>}</>
}
