const BASE = import.meta.env.VITE_API_URL || '/api/v1'
const store = { get:k=>localStorage.getItem(k), set:(k,v)=>localStorage.setItem(k,v), del:k=>localStorage.removeItem(k) }
export const tokens = {
  set:(a,r)=>{ store.set('at',a); if(r) store.set('rt',r) },
  clear:()=>{ store.del('at'); store.del('rt') }, has:()=>!!store.get('at') }
export const newKey = () => crypto.randomUUID()

async function refresh(){
  const rt = store.get('rt'); if(!rt) return false
  const r = await fetch(`${BASE}/auth/refresh`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({refreshToken:rt})})
  if(!r.ok){ tokens.clear(); return false }
  const j = await r.json(); const d = j.data ?? j; tokens.set(d.accessToken, d.refreshToken); return true
}
export async function api(path,{method='GET',body,key,retry=true}={}){
  const headers={'Content-Type':'application/json'}
  if(store.get('at')) headers.Authorization=`Bearer ${store.get('at')}`
  if(key) headers['Idempotency-Key']=key
  const r = await fetch(BASE+path,{method,headers,body:body?JSON.stringify(body):undefined})
  if(r.status===401 && retry && await refresh()) return api(path,{method,body,key,retry:false})
  const j = await r.json().catch(()=>({}))
  if(!r.ok) throw Object.assign(new Error(j.error?.message||'Something went wrong'),{code:j.error?.code,status:r.status,details:j.error?.details})
  return j.data ?? j
}
export const qs = o => { const p=new URLSearchParams(); Object.entries(o).forEach(([k,v])=>v!==''&&v!=null&&p.set(k,v)); const s=p.toString(); return s?`?${s}`:'' }
