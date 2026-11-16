import { useEffect, useState } from 'react'
import { api } from '../api/client'
export const naira = k => '₦' + ((k||0)/100).toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})
export const toKobo = n => Math.round(Number(n)*100)
const V={primary:'bg-kobo-500 text-white hover:bg-kobo-600',dark:'bg-ink text-white hover:bg-black',ghost:'bg-white text-ink ring-1 ring-ink/15 hover:bg-ink/5',danger:'bg-red-600 text-white hover:bg-red-700',accent:'bg-saffron text-ink hover:brightness-95'}
export const Spinner=()=><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"/>
export const Button=({variant='primary',className='',loading,children,...p})=>
  <button {...p} disabled={p.disabled||loading} className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${V[variant]} ${className}`}>{loading&&<Spinner/>}{children}</button>
export const Card=({className='',children})=><div className={`rounded-2xl bg-white p-5 ring-1 ring-ink/10 ${className}`}>{children}</div>
export const Field=({label,...p})=><label className="block text-sm"><span className="mb-1 block font-medium text-ink/70">{label}</span>
  <input {...p} className="w-full rounded-lg border-0 bg-white px-3 py-2.5 ring-1 ring-ink/15 placeholder:text-ink/30 focus:ring-2 focus:ring-kobo-500"/></label>
export const Select=({label,children,...p})=><label className="block text-sm">{label&&<span className="mb-1 block font-medium text-ink/70">{label}</span>}
  <select {...p} className="w-full rounded-lg border-0 bg-white px-3 py-2.5 ring-1 ring-ink/15 focus:ring-2 focus:ring-kobo-500">{children}</select></label>
const C={PAID:'bg-blue-100 text-blue-800',SHIPPED:'bg-amber-100 text-amber-800',DELIVERED:'bg-teal-100 text-teal-800',COMPLETED:'bg-kobo-100 text-kobo-700',CANCELLED:'bg-ink/10 text-ink/70',DISPUTED:'bg-red-100 text-red-700',PENDING:'bg-amber-100 text-amber-800',PENDING_PAYMENT:'bg-amber-100 text-amber-800',SUCCESS:'bg-kobo-100 text-kobo-700',FAILED:'bg-red-100 text-red-700',approved:'bg-kobo-100 text-kobo-700',pending:'bg-amber-100 text-amber-800',rejected:'bg-red-100 text-red-700',OPEN:'bg-red-100 text-red-700',RESOLVED:'bg-kobo-100 text-kobo-700'}
export const Badge=({s})=><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${C[s]||'bg-ink/10'}`}>{String(s).replace('_',' ')}</span>
export const Empty=({title,hint})=><div className="rounded-2xl border border-dashed border-ink/20 p-10 text-center"><p className="font-display text-lg font-semibold">{title}</p>{hint&&<p className="mt-1 text-sm text-ink/60">{hint}</p>}</div>
export const PageHead=({title,sub,children})=><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>{sub&&<p className="mt-1 text-ink/60">{sub}</p>}</div>{children}</div>
export function Modal({open,onClose,title,children}){
  if(!open) return null
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 sm:items-center sm:p-4" onClick={onClose}>
    <div className="w-full max-w-md rounded-t-2xl bg-white p-6 sm:rounded-2xl" onClick={e=>e.stopPropagation()}>
      <div className="mb-4 flex justify-between"><h3 className="text-lg font-bold">{title}</h3><button onClick={onClose} aria-label="Close" className="text-ink/50">✕</button></div>{children}</div></div>
}
export const toast=(msg,type='ok')=>window.dispatchEvent(new CustomEvent('toast',{detail:{msg,type,id:Math.random()}}))
export function Toaster(){
  const [t,setT]=useState([])
  useEffect(()=>{ const h=e=>{ setT(x=>[...x,e.detail]); setTimeout(()=>setT(x=>x.filter(i=>i.id!==e.detail.id)),4000) }
    window.addEventListener('toast',h); return()=>window.removeEventListener('toast',h)},[])
  return <div className="fixed bottom-4 right-4 z-[60] space-y-2" aria-live="polite">{t.map(i=><div key={i.id} className={`rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${i.type==='err'?'bg-red-600':'bg-ink'}`}>{i.msg}</div>)}</div>
}
export function useFetch(path,deps=[]){
  const [data,setData]=useState(null),[loading,setL]=useState(true),[error,setE]=useState(null)
  const run=()=>{ setL(true); api(path).then(setData).catch(e=>setE(e.message)).finally(()=>setL(false)) }
  useEffect(run,[path,...deps]); return {data,loading,error,reload:run,setData}
}
export async function act(fn,ok){ try{ const r=await fn(); ok&&toast(ok); return r }catch(e){ toast(e.message,'err') } }
export const Loading=()=><div className="flex justify-center p-12 text-kobo-500"><Spinner/></div>
export const list = d => Array.isArray(d)?d:d?.items||d?.data||[]
