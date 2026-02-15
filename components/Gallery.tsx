
import React from 'react';

const images = [
  { url: '/1.jpeg', title: 'Salon z biblioteką', span: 'col-span-2 row-span-2' },
  { url: '/2.jpeg', title: 'Wnętrze', span: 'col-span-1 row-span-1' },
  { url: '/3.jpeg', title: 'Wnętrze', span: 'col-span-1 row-span-1' },
  { url: '/4.jpeg', title: 'Wnętrze', span: 'col-span-2 row-span-1' },
  { url: '/5.jpeg', title: 'Wnętrze', span: 'col-span-1 row-span-1' },
  { url: '/6.jpeg', title: 'Wnętrze', span: 'col-span-1 row-span-1' },
  { url: '/7.jpeg', title: 'Wnętrze', span: 'col-span-1 row-span-1' },
  { url: '/8.jpeg', title: 'Wnętrze', span: 'col-span-1 row-span-1' },
];

const Gallery: React.FC = () => {
  return (
    <section className="py-24 bg-warm-beige overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 scroll-reveal">
          <span className="text-accent-gold uppercase tracking-[0.4em] text-xs font-bold mb-2 block">Visual Experience</span>
          <h2 className="font-serif text-4xl md:text-5xl text-deep-brown mb-4">Wnętrza Pełne Charakteru</h2>
          <div className="w-24 h-px bg-accent-gold mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[280px]">
          {images.map((img, i) => (
            <div 
              key={i} 
              className={`${img.span} relative overflow-hidden group scroll-reveal rounded-lg cursor-pointer shadow-xl`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <img 
                src={img.url} 
                alt={img.title} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-deep-brown/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center p-6 text-center">
                <p className="text-white font-serif italic text-2xl mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{img.title}</p>
                <div className="w-12 h-px bg-accent-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 delay-100"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
