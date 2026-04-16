import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Phone, User, CheckCircle2 } from 'lucide-react';
import { CONTACT_CONFIG } from '../config';

export function PromoBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [claimed, setClaimed] = useState(0);
  const [limit, setLimit] = useState(5);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch('/api/promo')
      .then(r => {
        if (!r.ok) throw new Error('API Offline');
        return r.json();
      })
      .then(d => {
        if(d.success) {
          setClaimed(d.claimed);
          setLimit(d.limit || 5);
        }
      })
      .catch(err => {
        console.warn('Simulando no ambiente local Vite, ou erro de API:', err);
        // Fallback for local Vite dev
        setClaimed(0);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !isVisible) return null;

  const isSoldOut = claimed >= limit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    
    try {
      const res = await fetch('/api/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, whatsapp })
      });
      if (!res.ok) throw new Error('API Frontend Endpoint Failed');
      const data = await res.json();
      
      if(data.success) {
        setSuccess(true);
        setClaimed(data.claimed);
        
        setTimeout(() => {
          window.open(`https://wa.me/${CONTACT_CONFIG.WHATSAPP_NUMBER}?text=Ol%C3%A1%21+Acabei+de+resgatar+o+cupom+de+inaugura%C3%A7%C3%A3o+de+R%24200+como+${encodeURIComponent(name)}.`, '_blank');
          setIsOpen(false);
        }, 2000);
      } else {
        setErrorMsg(data.error || 'Desculpe, erro ao resgatar vaga.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro de conexão com servidor. Tente novamente.');
    }
    
    setSubmitting(false);
  };

  return (
    <>
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative w-full z-50 bg-gradient-to-r from-purple-700 via-primary-600 to-blue-700 text-white shadow-md border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm sm:text-base font-medium">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span>
              <strong className="text-yellow-300 mr-1">OFERTA DE INAUGURAÇÃO:</strong> 
              Landing Page Completa por só R$ 200!
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold tracking-wider whitespace-nowrap">
              {isSoldOut ? 'ESGOTADO' : `Restam ${limit - claimed}/${limit} vagas`}
            </span>
            
            {!isSoldOut && (
              <button 
                onClick={() => setIsOpen(true)}
                className="bg-white text-purple-900 px-4 py-1 rounded-full text-sm font-bold shadow-sm hover:bg-gray-100 transition-colors whitespace-nowrap"
              >
                Resgatar Vaga
              </button>
            )}
            
            <button onClick={() => setIsVisible(false)} className="text-white/70 hover:text-white transition-colors p-1" aria-label="Fechar">
              <X size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && !isSoldOut && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full relative shadow-2xl"
            >
              <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 p-2">
                <X size={20} />
              </button>
              
              {!success ? (
                <>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary-100 shadow-inner">
                      <Sparkles className="text-primary-600" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Travar Cupom - R$ 200</h3>
                    <p className="text-gray-600 text-sm">Insira seus dados abaixo para trancar a sua vaga no sistema e falar comigo no WhatsApp.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Seu Nome</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="text" 
                          required
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all text-gray-900"
                          placeholder="Digite seu nome..."
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Seu WhatsApp</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="tel" 
                          required
                          value={whatsapp}
                          onChange={e => setWhatsapp(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all text-gray-900"
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                    </div>

                    {errorMsg && <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">{errorMsg}</p>}

                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="w-full mt-2 bg-gradient-to-r from-purple-600 to-primary-600 hover:from-purple-700 hover:to-primary-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30 flex justify-center items-center gap-2"
                    >
                      {submitting ? 'Reservando vaga...' : 'Resgatar Agora (Ir pro WhatsApp)'}
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-3">Você concorda em ser contatado para validar o cupom.</p>
                  </form>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-green-100">
                    <CheckCircle2 className="text-green-500" size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Vaga Garantida!</h3>
                  <p className="text-gray-600 mb-8">O cupom foi travado para você com sucesso no sistema. Redirecionando para o WhatsApp...</p>
                  <div className="animate-pulse flex space-x-2 justify-center">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
