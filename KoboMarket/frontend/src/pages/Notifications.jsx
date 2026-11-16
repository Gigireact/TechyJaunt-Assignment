import { api } from '../api/client'
import { Button, Empty, Loading, PageHead, act, useFetch, list } from '../components/ui'
export default function Notifications(){
  const {data,loading,reload}=useFetch('/notifications')
  if(loading) return <Loading/>
  const read=id=>act(()=>api(`/notifications/${id}/read`,{method:'PATCH'})).then(reload)
  return <><PageHead title="Notifications"><Button variant="ghost" onClick={()=>act(()=>api('/notifications/read-all',{method:'PATCH'}),'All marked as read').then(reload)}>Mark all as read</Button></PageHead>
    {!list(data).length?<Empty title="You're all caught up"/>:<div className="space-y-2">{list(data).map(n=>
      <button key={n._id} onClick={()=>!n.read&&read(n._id)} className={`flex w-full items-start gap-3 rounded-xl p-4 text-left ring-1 ring-ink/10 ${n.read?'bg-white/60':'bg-white'}`}>
        <span className={`mt-1.5 h-2 w-2 rounded-full ${n.read?'bg-transparent':'bg-saffron'}`}/><span><span className="block font-medium">{n.title||n.type}</span><span className="text-sm text-ink/60">{n.message}</span></span></button>)}</div>}</>
}
