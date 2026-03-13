
import React from 'react';
import { useTranslation } from '../context/LanguageContext';

interface Attraction {
  name: string;
  namePl: string;
  distance: string;
  desc: { pl: string; de: string; cs: string; en: string };
  keyword: string;
}

const attractions: Attraction[] = [
  {
    name: 'Wysoki Kamień',
    namePl: 'Szlak Wysoki Kamień',
    distance: '130 m',
    desc: {
      pl: 'Szczyt Gór Izerskich (1058 m n.p.m.) z panoramą na Karkonosze. Szlak startuje tuż obok naszej willi.',
      de: 'Gipfel des Isergebirges (1058 m ü.d.M.) mit Panoramablick auf das Riesengebirge. Der Weg beginnt gleich neben unserer Villa.',
      cs: 'Vrchol Jizerských hor (1058 m n.m.) s panoramatem Krkonoš. Stezka začíná hned vedle naší vily.',
      en: 'Izera Mountains summit (1,058 m a.s.l.) with a panoramic view of the Karkonosze. The trail starts right next to our villa.',
    },
    keyword: 'szlak Wysoki Kamień Szklarska Poręba',
  },
  {
    name: 'Wodospad Kamieńczyka',
    namePl: 'Wodospad Kamieńczyka',
    distance: '2,7 km',
    desc: {
      pl: 'Najwyższy wodospad w polskich Sudetach (27 m). Trzy kaskady i Złota Jama, obowiązkowy punkt każdej wycieczki.',
      de: 'Der höchste Wasserfall der polnischen Sudeten (27 m). Drei Kaskaden und die Goldene Grotte, ein absolutes Muss.',
      cs: 'Nejvyšší vodopád polských Sudet (27 m). Tři kaskády a Zlatá jáma, povinná zastávka každého výletu.',
      en: 'The highest waterfall in the Polish Sudetes (27 m). Three cascades and the Golden Cave, a must-see on every itinerary.',
    },
    keyword: 'wodospad Kamieńczyka Szklarska Poręba',
  },
  {
    name: 'Ski Arena Szrenica',
    namePl: 'Ski Arena Szrenica',
    distance: '1,8 km',
    desc: {
      pl: 'Główny stok narciarski Szklarskiej Poręby. 12 km tras, 8 wyciągów, sezon XII–III. Idealny punkt wyjścia na narty.',
      de: 'Das Hauptskigebiet von Szklarska Poręba. 12 km Pisten, 8 Lifte, Saison XII–III. Idealer Ausgangspunkt für Ski.',
      cs: 'Hlavní lyžařské středisko Szklarské Poręby. 12 km tras, 8 vleků, sezóna XII–III. Ideální výchozí bod pro lyžování.',
      en: 'The main ski resort of Szklarska Poręba. 12 km of runs, 8 lifts, season Dec–Mar. Ideal starting point for skiing.',
    },
    keyword: 'narty Szklarska Poręba Ski Arena Szrenica',
  },
  {
    name: 'Jakuszyce',
    namePl: 'Jakuszyce, narciarstwo biegowe',
    distance: '7,3 km',
    desc: {
      pl: 'Centrum narciarstwa biegowego w Polsce. Dom Biegu Piastów i olimpijskie trasy biegowe w sercu Gór Izerskich.',
      de: 'Zentrum des Skilanglaufs in Polen. Heimat des Piastenlaufs und olympische Langlaufstrecken im Herzen des Isergebirges.',
      cs: 'Centrum běžeckého lyžování v Polsku. Domov Piasto Runn a olympijské běžecké tratě v srdci Jizerských hor.',
      en: 'Cross-country skiing centre of Poland. Home of the Bieg Piastów and Olympic-level trails in the heart of the Izera Mountains.',
    },
    keyword: 'narciarstwo biegowe Jakuszyce Karkonosze',
  },
  {
    name: 'Dinopark',
    namePl: 'Dinopark Szklarska Poręba',
    distance: '~1 km',
    desc: {
      pl: 'Park dinozaurów w lesie z rekonstrukcjami w skali 1:1, Kinem 6D i parkiem linowym. Idealna atrakcja dla rodzin z dziećmi.',
      de: 'Dinosaurier-Park im Wald mit 1:1-Rekonstruktionen, 6D-Kino und Kletterpark. Ideale Attraktion für Familien mit Kindern.',
      cs: 'Dinopark v lese s rekonstrukcemi v měřítku 1:1, Kinem 6D a lanovým parkem. Ideální atrakce pro rodiny s dětmi.',
      en: 'Dinosaur park in the forest with life-size reconstructions, a 6D Cinema and rope park. Perfect attraction for families with children.',
    },
    keyword: 'Dinopark Szklarska Poręba atrakcje dla dzieci',
  },
  {
    name: 'Muzeum Mineralogiczne',
    namePl: 'Muzeum Mineralogiczne Szklarska Poręba',
    distance: '~1 km',
    desc: {
      pl: '3000 eksponatów minerałów i meteorytów. Jedyny w Europie Las Karboński ze skamieniałymi drzewami sprzed 300 mln lat.',
      de: '3.000 Mineral- und Meteoriten-Exponate. Der einzige Karbonische Wald Europas mit versteinerten Bäumen aus 300 Millionen Jahren.',
      cs: '3000 exponátů minerálů a meteoritů. Jediný karbonský les v Evropě se zkamenělými stromy starými 300 milionů let.',
      en: '3,000 mineral and meteorite exhibits. Europe\'s only Carboniferous Forest, with petrified trees 300 million years old.',
    },
    keyword: 'Muzeum Mineralogiczne Szklarska Poręba',
  },
];

const AttractionsBanner: React.FC = () => {
  const { lang } = useTranslation();

  const labelsByLang: Record<string, { heading: string; sub: string; cta: string }> = {
    pl: {
      heading: 'Atrakcje w pobliżu Szklarskiej Poręby',
      sub: 'Apartament Cień Ducha Gór to idealna baza wypadowa na najważniejsze atrakcje Karkonoszy.',
      cta: 'Zarezerwuj pobyt',
    },
    de: {
      heading: 'Sehenswürdigkeiten in der Nähe von Szklarska Poręba',
      sub: 'Das Apartment Cień Ducha Gór ist die ideale Ausgangsbasis für die wichtigsten Sehenswürdigkeiten des Riesengebirges.',
      cta: 'Aufenthalt buchen',
    },
    cs: {
      heading: 'Atrakce v okolí Szklarské Poręby',
      sub: 'Apartmán Cień Ducha Gór je ideální výchozí základnou pro nejdůležitější atrakce Krkonoš.',
      cta: 'Rezervovat pobyt',
    },
    en: {
      heading: 'Nearby Attractions in Szklarska Poręba',
      sub: 'Cień Ducha Gór Apartment is the ideal base for exploring the most important attractions of the Karkonosze Mountains.',
      cta: 'Book your stay',
    },
  };

  const labels = labelsByLang[lang] ?? labelsByLang.pl;

  return (
    <section
      className="py-20 px-6 bg-paper-white"
      aria-label={labels.heading}
    >
      <div className="container mx-auto max-w-6xl scroll-reveal">
        <div className="text-center mb-14">
          <span className="text-accent-gold uppercase tracking-[0.3em] text-sm font-semibold">
            Karkonosze
          </span>
          <h2 className="font-serif text-3xl md:text-4xl mt-3 mb-4 text-deep-brown">
            {labels.heading}
          </h2>
          <p className="text-deep-brown/60 font-light max-w-2xl mx-auto">
            {labels.sub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attractions.map((a) => (
            <article
              key={a.name}
              className="bg-warm-beige border border-cappuccino/20 rounded-2xl p-6 hover:border-accent-gold/60 hover:shadow-md transition-all duration-300"
              itemScope
              itemType="https://schema.org/TouristAttraction"
            >
              <div className="flex items-center justify-between mb-3">
                <h3
                  className="font-serif text-lg text-deep-brown"
                  itemProp="name"
                >
                  {a.namePl}
                </h3>
                <span
                  className="text-xs font-semibold text-accent-gold bg-accent-gold/10 px-2 py-1 rounded-full whitespace-nowrap ml-3 flex-shrink-0"
                  itemProp="distance"
                >
                  {a.distance}
                </span>
              </div>
              <p
                className="text-sm text-deep-brown/65 font-light leading-relaxed"
                itemProp="description"
              >
                {a.desc[lang as keyof typeof a.desc] ?? a.desc.pl}
              </p>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="#rezerwacja"
            className="inline-block bg-deep-brown text-warm-beige font-semibold text-sm uppercase tracking-[0.2em] px-10 py-4 rounded-full hover:bg-accent-gold transition-colors duration-300"
            title="Zarezerwuj apartament Cień Ducha Gór w Szklarskiej Porębie, noclegi Karkonosze"
          >
            {labels.cta}
          </a>
        </div>
      </div>
    </section>
  );
};

export default AttractionsBanner;
