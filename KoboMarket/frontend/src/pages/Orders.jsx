import { useState } from 'react'
import { api } from '../api/client'
import { Badge, Button, Card, Empty, Field, Loading, Modal, PageHead, naira, act, useFetch, list } from '../components/ui'
const STEPS=['PAID','SHIPPED','DELIVERED','COMPLETED']
const Track=({s})=>s==='CANCELLED'||s==='DISPUTED'?<Badge s={s}/>:<div className="flex items-center gap-1">{STEPS.map((x,i)=><span key={x} className={`h-1.5 w-8 rounded-full ${STEPS.indexOf(s)>=i?'bg-kobo-500':'bg-ink/15'}`}/>)}<span className="ml-2"><Badge s={s}/></span></div>

export default function Orders(){
  const {data,loading,reload}=useFetch('/orders'), [d,setD]=useState(null), [f,setF]=useState({reason:'',evidence:''})
  if(loading) return <Loading/>
  const run=(fn,m)=>act(fn,m).then(reload)
  const dispute=async e=>{ e.preventDefault(); (await act(()=>api(`/sub-orders/${d}/disputes`,{method:'POST',body:{reason:f.reason,evidence:f.evidence.split('\n').filter(Boolean)}}).then(()=>true),'Dispute opened. Escrow is frozen.'))&&(setD(null),reload()) }
  return <><PageHead title="Orders" sub="Confirm delivery to release payment to the vendor."/>
    {!list(data).length?<Empty title="No orders yet"/>:<div className="space-y-4">{list(data).map(o=><Card key={o.id}>
      <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-display font-bold">Order {String(o.id).slice(0,8)}</p><p className="text-xs text-ink/50">{new Date(o.createdAt||o.created_at).toLocaleString()}</p></div>
        <div className="flex items-center gap-3"><Badge s={o.status}/><span className="font-display font-bold">{naira(o.totalKobo??o.total_kobo)}</span>
          {['PENDING_PAYMENT','PAID'].includes(o.status)&&<Button variant="ghost" onClick={()=>run(()=>api(`/orders/${o.id}/cancel`,{method:'POST'}),'Order cancelled and refunded')}>Cancel</Button>}</div></div>
      <div className="mt-4 space-y-3">{(o.subOrders||o.sub_orders||[]).map(s=><div key={s.id} className="rounded-xl bg-paper p-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-medium">{s.vendorName||'Vendor order'}</p><p className="text-sm text-ink/60">{(s.items||[]).map(i=>`${i.quantity}× ${i.name}`).join(', ')}</p></div><Track s={s.status}/></div>
        <div className="mt-3 flex flex-wrap gap-2">
          {s.status==='SHIPPED'&&<Button onClick={()=>run(()=>api(`/sub-orders/${s.id}/confirm`,{method:'PATCH'}),'Delivery confirmed. Vendor paid.')}>Confirm delivery</Button>}
          {['SHIPPED','DELIVERED'].includes(s.status)&&<Button variant="danger" onClick={()=>setD(s.id)}>Open dispute</Button>}</div></div>)}</div></Card>)}</div>}
    <Modal open={!!d} onClose={()=>setD(null)} title="Open a dispute"><form onSubmit={dispute} className="space-y-3">
      <Field label="What went wrong?" required value={f.reason} onChange={e=>setF({...f,reason:e.target.value})}/>
      <label className="block text-sm"><span className="mb-1 block font-medium text-ink/70">Evidence (text or image URLs, one per line)</span><textarea rows="3" value={f.evidence} onChange={e=>setF({...f,evidence:e.target.value})} className="w-full rounded-lg px-3 py-2 ring-1 ring-ink/15"/></label>
      <Button variant="danger" className="w-full">Freeze funds and submit</Button></form></Modal></>
}
