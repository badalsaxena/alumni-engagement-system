import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export default function AlumniChatPage() {
  const { connectionId } = useParams();
  const { user, getToken } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const endRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/messages/${connectionId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setMessages(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [connectionId, getToken]);

  useEffect(() => {
    fetchMessages();
    const token = getToken();
    fetch(`${API}/api/connections/my`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        const conn = (d.as_alumni || []).find(c => c.id === connectionId);
        if (conn) setOtherUser(conn.student);
      });
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [connectionId, fetchMessages, getToken]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setSending(true);
    try {
      await fetch(`${API}/api/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ connection_id: connectionId, content: newMsg.trim() }),
      });
      setNewMsg('');
      await fetchMessages();
    } catch (err) { console.error(err); }
    finally { setSending(false); }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-6rem)]" data-testid="alumni-chat-page">
        <div className="glass-panel p-4 flex items-center gap-4 mb-4">
          <Link to="/alumni/connections" className="text-white/40 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium">
            {otherUser?.full_name?.[0] || '?'}
          </div>
          <div>
            <h2 className="font-heading font-medium text-sm">{otherUser?.full_name || 'Loading...'}</h2>
            <p className="text-xs text-white/30">{otherUser?.department}</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {loading ? (
            <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-white/40" /></div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-white/30 text-sm">No messages yet</div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.sender_id === user?.id;
              return (
                <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-lg ${isOwn ? 'bg-white text-black' : 'glass-panel'}`}>
                    <p className="text-sm">{msg.content}</p>
                    <span className={`text-[10px] ${isOwn ? 'text-black/40' : 'text-white/20'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>
        <form onSubmit={sendMessage} className="mt-4 flex gap-2">
          <input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} placeholder="Type a message..." className="input-noir flex-1" data-testid="alumni-chat-input" />
          <button type="submit" disabled={!newMsg.trim() || sending} className="btn-primary px-4 disabled:opacity-50" data-testid="alumni-chat-send-btn">
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
