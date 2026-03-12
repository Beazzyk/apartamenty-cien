
import React, { useState } from 'react';

const faqItems = [
  {
    q: 'Czy apartament posiada bezpłatny parking?',
    a: 'Tak, goście apartamentu Cień Ducha Gór mają do dyspozycji dwa dedykowane, bezpłatne miejsca parkingowe bezpośrednio przy willi.'
  },
  {
    q: 'Czy można przyjechać ze zwierzakiem?',
    a: 'Niestety nie – mimo że uwielbiamy zwierzaki, w naszym apartamencie nie możemy gościć zwierząt. Ze względu na charakter obiektu musimy zachować tę zasadę. Dziękujemy serdecznie za zrozumienie!'
  },
  {
    q: 'Jak blisko znajduje się szlak turystyczny?',
    a: 'Nasz apartament jest idealnie położony dla miłośników wędrówek – szlak na Wysoki Kamień znajduje się zaledwie 130 metrów od budynku.'
  },
  {
    q: 'Czy w apartamencie jest prawdziwy kominek?',
    a: 'Tak, w salonie znajduje się klimatyczny, w pełni sprawny kominek na drewno. Zapewniamy opał na powitanie naszych gości.'
  },
  {
    q: 'Czy apartament znajduje się w samym centrum Szklarskiej Poręby?',
    a: 'Tak, ulica Dworcowa to ścisłe centrum (200m do głównej ulicy Jedności Narodowej), jednak sama willa położona jest w zacisznej enklawie.'
  },
  {
    q: 'Czy apartament jest przystosowany do pracy zdalnej?',
    a: 'Oczywiście. Zapewniamy szybkie WiFi oraz komfortowe miejsca do pracy z laptopem w salonie i sypialniach.'
  }
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-warm-beige">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="font-serif text-4xl text-center text-deep-brown mb-16 scroll-reveal">Najczęściej Zadawane Pytania</h2>
        
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <div key={i} className="border-b border-cappuccino/30 scroll-reveal" style={{ transitionDelay: `${i * 100}ms` }}>
              <button 
                className="w-full py-6 flex justify-between items-center text-left focus:outline-none group"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className={`text-lg font-serif transition-colors ${openIndex === i ? 'text-accent-gold' : 'text-deep-brown'}`}>{item.q}</span>
                <span className="text-accent-gold transform transition-transform duration-300">
                  {openIndex === i ? 
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"/></svg> : 
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                  }
                </span>
              </button>
              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openIndex === i ? 'max-h-60 pb-6' : 'max-h-0'}`}>
                <p className="text-deep-brown/70 leading-relaxed">
                  {item.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
