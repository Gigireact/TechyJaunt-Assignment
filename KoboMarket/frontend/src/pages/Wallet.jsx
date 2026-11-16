import { useRef, useState } from 'react'
import { api, newKey } from '../api/client'
import { Badge, Button, Card, Empty, Field, Loading, PageHead, naira, toKobo, act, useFetch, list } from '../components/ui'

export default function Wallet(){
  const w=useFetch('/wallet'), t=useFetch('/wallet/transactions'), [amt,setAmt]=useState(''), key=useRef(newKey()), [b,setB]=useState(false)
  const fund=async e=>{ e.preventDefault(); setB(true)
    const r=await act(()=>api('/wallet/fund',{method:'POST',key:key.current,body:{amountKobo:toKobo(amt)}})); setB(false)
    if(r){ key.current=newKey(); window.location.href=r.authorizationUrl||r.checkoutUrl||r.authorization_url } }
  if(w.loading) return <Loading/>
  return <><PageHead title="Wallet"/>
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl bg-kobo-700 p-6 text-white"><p className="text-kobo-100">Available balance</p><p className="mt-1 font-display text-4xl font-extrabold">{naira(w.data?.balanceKobo??w.data?.balance_kobo)}</p>
        <p className="mt-3 text-sm text-kobo-100/80">Escrowed funds are not shown here until released.</p></div>
        <form onSubmit={fund} className="flex items-end gap-3"><div className="flex-1"><Field label="Amount (₦)" type="number" min="100" required value={amt} onChange={e=>setAmt(e.target.value)} placeholder="5000"/></div><Button loading={b}>Pay with Paystack</Button></form>
        <div className="mt-3 flex gap-2">{[1000,5000,20000].map(n=><button key={n} onClick={()=>setAmt(n)} className="rounded-full px-3 py-1 text-sm ring-1 ring-ink/15 hover:bg-ink/5">₦{n.toLocaleString()}</button>)}</div></Card></div>
    <h2 className="mb-3 mt-8 text-xl font-bold">Transactions</h2>
    {t.loading?<Loading/>:!list(t.data).length?<Empty title="No transactions yet" hint="Fund your wallet to get started."/>:
    <Card className="divide-y divide-ink/10 !p-0">{list(t.data).map(x=><div key={x.id} className="flex items-center justify-between gap-3 p-4">
      <div><p className="font-medium">{String(x.type).replace(/_/g,' ')}</p><p className="text-xs text-ink/50">{new Date(x.createdAt||x.created_at).toLocaleString()} · {x.reference}</p></div>
      <div className="text-right"><p className={`font-display font-bold ${x.direction==='debit'?'text-red-600':'text-kobo-600'}`}>{x.direction==='debit'?'−':'+'}{naira(x.amountKobo??x.amount_kobo)}</p>{x.status&&<Badge s={x.status}/>}</div></div>)}</Card>}</>
}
