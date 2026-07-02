import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import HistoryTimelineSlider from "@/components/HistoryTimelineSlider";

interface HistoryPageProps {
  params: Promise<{ subdomain: string }>;
}

async function getClubData(slug: string) {
  return await db.club.findUnique({
    where: { slug: slug.toLowerCase().trim() },
    include: { settings: true },
  });
}

interface SubMilestone {
  title: string;
  description: string;
  imageUrl?: string;
}

interface Milestone {
  year: string;
  title: string;
  description: string;
  imageUrl?: string;
  subMilestones?: SubMilestone[];
}

export default async function ClubHistoryPage({ params }: HistoryPageProps) {
  const { subdomain } = await params;
  const club = await getClubData(subdomain);

  if (!club) {
    return notFound();
  }

  const settings = club.settings;
  const primaryColor = settings?.primaryColor || "#0284c7";
  const secondaryColor = settings?.secondaryColor || "#0f172a";

  // Hitos y subhitos estructurados con abundante cantidad de fotos históricas (Unsplash)
  const milestones: Milestone[] = [
    {
      year: "1910",
      title: "Fundación del Club",
      description: "El 15 de Octubre de 1910, un grupo de vecinos y pioneros de la ciudad se reúne para dar vida al club con el objetivo de fomentar el deporte y el encuentro familiar.",
      imageUrl: "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=800&auto=format&fit=crop&q=80",
      subMilestones: [
        {
          title: "La Elección de los Colores",
          description: "Tras un intenso debate en la asamblea fundacional, se eligen el amarillo y el negro en homenaje a los ferroviarios de la zona y como emblema de sol y trabajo duro.",
          imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80"
        },
        {
          title: "El Primer Terreno de Juego",
          description: "Se obtiene la concesión de un predio fiscal de tierra batida para las primeras prácticas informales y encuentros amistosos de fútbol de la época.",
        }
      ]
    },
    {
      year: "1945",
      title: "Era Amateur y Primeras Copas",
      description: "Nuestra disciplina de fútbol ingresa a la liga asociativa regional y obtiene los primeros campeonatos oficiales de la institución.",
      imageUrl: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=800&auto=format&fit=crop&q=80",
      subMilestones: [
        {
          title: "Consagración del Bicampeonato",
          description: "La plantilla del club logra ganar el torneo local de forma invicta en dos temporadas consecutivas, ganando el respeto y la admiración de la provincia.",
          imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80"
        }
      ]
    },
    {
      year: "1978",
      title: "Inauguración de la Sede Social Céntrica",
      description: "Se concreta la construcción e inauguración de la Sede Central en el área céntrica, incorporando oficinas administrativas, salones sociales y el microestadio multideportes.",
      imageUrl: "https://images.unsplash.com/photo-1577416412292-747c6607f055?w=800&auto=format&fit=crop&q=80",
      subMilestones: [
        {
          title: "Apertura del Natatorio Olímpico",
          description: "Se inaugura la pileta climatizada, abriendo las puertas a la disciplina de natación competitiva y la escuela de natación infantil.",
          imageUrl: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&auto=format&fit=crop&q=80"
        }
      ]
    },
    {
      year: "2012",
      title: "Adquisición del Complejo Polideportivo",
      description: "Para dar abasto al masivo caudal de deportistas federados en hockey, básquet, vóley y tenis, el club adquiere terrenos periféricos y desarrolla el polideportivo actual.",
      imageUrl: "https://images.unsplash.com/photo-1526676001775-53ef69b8b7d9?w=800&auto=format&fit=crop&q=80",
      subMilestones: [
        {
          title: "Canchas de Césped Sintético",
          description: "Se colocan las primeras alfombras de césped sintético con certificación internacional para hockey y fútbol infantil.",
          imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&auto=format&fit=crop&q=80"
        }
      ]
    },
    {
      year: "Actualidad",
      title: "Era Digital y Modernización",
      description: "Conectados a la plataforma Clubify, el club gestiona a más de 5,000 socios activos y coordina 6 categorías competitivas por disciplina.",
      imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80"
    }
  ];

  const values = [
    {
      title: "Compromiso Social",
      description: "Promovemos un espacio de inclusión y contención para jóvenes y familias de la comunidad.",
      iconName: "users",
    },
    {
      title: "Fair Play y Respeto",
      description: "Fomentamos la sana competencia, el respeto por el rival y el apego estricto a las normas de juego.",
      iconName: "shield",
    },
    {
      title: "Excelencia Deportiva",
      description: "Trabajamos día a día en perfeccionar nuestros cuerpos técnicos y el equipamiento para todos los atletas.",
      iconName: "award",
    }
  ];

  const symbols = [
    {
      title: "El Escudo Oficial",
      description: "Las franjas verticales representan la rectitud en el deporte, la unión y la disciplina colectiva.",
    },
    {
      title: "Los Colores Históricos",
      description: "Amarillo sol (energía, dinamismo e iluminación) y Negro carbón (fuerza, resistencia y constancia).",
    },
    {
      title: "La Mascota & Lema",
      description: "El León Aurinegro encarna la valentía, el coraje y la garra con la que vestimos nuestra camiseta.",
    }
  ];

  return (
    <div 
      className="bg-white min-h-screen text-slate-900 pb-20 font-sans selection:bg-[var(--primary-club)] selection:text-white"
      style={{
        "--primary-club": primaryColor,
        "--secondary-club": secondaryColor,
      } as React.CSSProperties}
    >
      {/* Cabecera Estilo Editorial Minimalista */}
      <header className="bg-slate-950 text-white py-24 px-6 relative overflow-hidden border-b border-slate-900">
        <div className="absolute inset-0 opacity-20 bg-[var(--primary-club)]"></div>
        <div className="relative max-w-5xl mx-auto space-y-6 z-10">
          <Link
            href={`/about`}
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white transition-colors tracking-wider uppercase"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Volver a Institucional
          </Link>
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-[var(--primary-club)]">Trayectoria centenaria</span>
            <h1 className="text-4xl md:text-6xl font-outfit font-black uppercase tracking-tight leading-none">
              Nuestra Historia
            </h1>
          </div>
          <p className="text-sm md:text-lg text-slate-400 max-w-2xl font-medium leading-relaxed">
            Un recorrido por los hitos fundacionales, conquistas y los valores inalterables que forjaron la identidad de {club.name}.
          </p>
        </div>
      </header>

      {/* Cuerpo Principal (Envía datos al Slider Interactivo) */}
      <main className="max-w-5xl mx-auto px-6 py-20">
        <HistoryTimelineSlider 
          club={club} 
          milestones={milestones} 
          symbols={symbols} 
          values={values} 
        />
      </main>
    </div>
  );
}
