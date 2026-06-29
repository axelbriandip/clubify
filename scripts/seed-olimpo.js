const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

// 1. Cargar variables de entorno desde el archivo .env local
const envPath = path.join(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const firstEqual = trimmed.indexOf("=");
    if (firstEqual !== -1) {
      const key = trimmed.slice(0, firstEqual).trim();
      const val = trimmed.slice(firstEqual + 1).trim().replace(/^["']|["']$/g, "");
      process.env[key] = val;
    }
  });
}

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando carga de datos de prueba para Olimpo...");

  // 2. Buscar el club "olimpo"
  let club = await prisma.club.findFirst({
    where: { slug: "olimpo" },
  });

  if (!club) {
    club = await prisma.club.findFirst();
  }

  if (!club) {
    console.error("❌ No se encontró ningún club registrado en la base de datos.");
    return;
  }

  const clubId = club.id;
  console.log(`Club seleccionado: ${club.name} (ID: ${clubId})`);

  // 3. Limpiar datos existentes
  console.log("Limpiando datos anteriores del club...");
  
  await prisma.match.deleteMany({ where: { clubId } });
  await prisma.team.deleteMany({ where: { clubId } });
  await prisma.person.deleteMany({ where: { clubId } });
  await prisma.discipline.deleteMany({ where: { clubId } });
  await prisma.news.deleteMany({ where: { clubId } });
  await prisma.sponsor.deleteMany({ where: { clubId } });
  await prisma.heroImage.deleteMany({ where: { clubId } });
  await prisma.contactSubmission.deleteMany({ where: { clubId } });
  await prisma.newsletterSubscriber.deleteMany({ where: { clubId } });

  console.log("✅ Limpieza completada.");

  // 4. Crear Imagen de Portada (HeroImage)
  console.log("Creando imagen de portada (Hero)...");
  await prisma.heroImage.create({
    data: {
      clubId,
      imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1600&auto=format&fit=crop&q=80",
      title: "Esto es Olimpo",
      subtitle: "El portal oficial de la institución deportiva aurinegra",
      isActive: true,
      sortOrder: 1,
    },
  });

  // 5. Crear Deportes (Disciplinas) y Categorías
  console.log("Creando disciplinas y categorías...");
  
  const futbolMasc = await prisma.discipline.create({
    data: {
      clubId,
      name: "Fútbol Masculino",
      slug: "futbol-masculino",
      description: "Disciplina principal competitiva de la institución.",
      sortOrder: 1,
      categories: {
        create: [
          { name: "Primera División", ageRange: "Libre", gender: "MALE", sortOrder: 1 },
          { name: "Reserva", ageRange: "Sub-23", gender: "MALE", sortOrder: 2 },
          { name: "Sub-17", ageRange: "15 a 17 años", gender: "MALE", sortOrder: 3 },
        ],
      },
    },
    include: { categories: true },
  });

  const basquet = await prisma.discipline.create({
    data: {
      clubId,
      name: "Básquetbol",
      slug: "basquetbol",
      description: "Sección de básquet asociativa del club.",
      sortOrder: 2,
      categories: {
        create: [
          { name: "Primera", ageRange: "Libre", gender: "MALE", sortOrder: 1 },
          { name: "Juveniles U19", ageRange: "Sub-19", gender: "MALE", sortOrder: 2 },
        ],
      },
    },
    include: { categories: true },
  });

  const futbolFem = await prisma.discipline.create({
    data: {
      clubId,
      name: "Fútbol Femenino",
      slug: "futbol-femenino",
      description: "Sección de fútbol femenino competitivo.",
      sortOrder: 3,
      categories: {
        create: [
          { name: "Primera", ageRange: "Libre", gender: "FEMALE", sortOrder: 1 },
        ],
      },
    },
    include: { categories: true },
  });

  console.log("✅ Disciplinas creadas.");

  // 6. Crear Equipos para el Fixture (Propio y Rivales)
  console.log("Creando equipos de juego...");
  
  const propioTeam = await prisma.team.create({
    data: {
      clubId,
      name: club.name,
      shortName: club.name.substring(0, 3).toUpperCase(),
      isOwnClub: true,
      logoColorUrl: "",
    },
  });

  const rivalMitre = await prisma.team.create({
    data: { clubId, name: "Villa Mitre", shortName: "VMI", isOwnClub: false },
  });

  const rivalSansinena = await prisma.team.create({
    data: { clubId, name: "Sansinena", shortName: "SAN", isOwnClub: false },
  });

  const rivalLiniers = await prisma.team.create({
    data: { clubId, name: "Liniers", shortName: "LIN", isOwnClub: false },
  });

  const rivalAlmagro = await prisma.team.create({
    data: { clubId, name: "Almagro", shortName: "ALM", isOwnClub: false },
  });

  console.log("✅ Equipos creados.");

  // 7. Crear Personas (Dirigentes, Staff, Jugadores)
  console.log("Cargando planteles y personas...");

  // Dirigentes (con sortOrder!)
  await prisma.person.create({
    data: {
      clubId,
      firstName: "Alejandro",
      lastName: "Domínguez",
      documentId: "24555111",
      dateOfBirth: new Date("1975-06-15"),
      email: "presidente@club.com",
      phone: "291-4556677",
      address: "Av. Alem 1200",
      isActive: true,
      boardMembers: {
        create: {
          clubId,
          position: "Presidente",
          termStart: new Date("2024-01-01"),
          sortOrder: 1,
        },
      },
    },
  });

  await prisma.person.create({
    data: {
      clubId,
      firstName: "Rubén",
      lastName: "Insúa",
      documentId: "26111333",
      dateOfBirth: new Date("1978-02-20"),
      email: "secretario@club.com",
      phone: "291-5558899",
      address: "Sarmiento 450",
      isActive: true,
      boardMembers: {
        create: {
          clubId,
          position: "Secretario General",
          termStart: new Date("2024-01-01"),
          sortOrder: 2,
        },
      },
    },
  });

  // Cuerpo Técnico (Staff)
  const dtSimeone = await prisma.person.create({
    data: {
      clubId,
      firstName: "Diego",
      lastName: "Simeone",
      documentId: "21999222",
      dateOfBirth: new Date("1970-04-28"),
      email: "dt@club.com",
      phone: "291-4001122",
      isActive: true,
      staffMembers: {
        create: {
          clubId,
          mainRole: "Director Técnico",
        },
      },
    },
    include: { staffMembers: true },
  });

  // Asociar DT a la Categoría Primera División
  const catPrimeraFutbol = futbolMasc.categories.find(c => c.name === "Primera División");
  if (catPrimeraFutbol) {
    await prisma.categoryStaff.create({
      data: {
        categoryId: catPrimeraFutbol.id,
        staffMemberId: dtSimeone.staffMembers[0].id,
        roleInCategory: "Director Técnico Principal",
      },
    });
  }

  // Jugadores del Plantel Principal
  const jugadoresData = [
    { firstName: "Lionel", lastName: "Messi", doc: "35111222", birth: "1987-06-24", num: "SOC-1010", side: "LEFT", bio: "Capitán del plantel, creador de juego y delantero." },
    { firstName: "Ángel", lastName: "Di María", doc: "36222333", birth: "1988-02-14", num: "SOC-1111", side: "LEFT", bio: "Extremo veloz y definidor de finales." },
    { firstName: "Emiliano", lastName: "Martínez", doc: "37444555", birth: "1992-09-02", num: "SOC-2323", side: "RIGHT", bio: "Arquero titular del plantel principal." },
    { firstName: "Rodrigo", lastName: "De Paul", doc: "38999888", birth: "1994-05-24", num: "SOC-0707", side: "RIGHT", bio: "Mediocampista todoterreno y motor de marca." },
    { firstName: "Lautaro", lastName: "Martínez", doc: "39444999", birth: "1997-08-22", num: "SOC-0909", side: "RIGHT", bio: "Delantero centro potente y goleador del equipo." },
  ];

  for (const j of jugadoresData) {
    const playerPerson = await prisma.person.create({
      data: {
        clubId,
        firstName: j.firstName,
        lastName: j.lastName,
        documentId: j.doc,
        dateOfBirth: new Date(j.birth),
        memberNumber: j.num,
        medicalClearanceExpiry: new Date("2027-01-01"),
        isActive: true,
        players: {
          create: {
            clubId,
            preferredSide: j.side,
            heightCm: 180,
            weightKg: 76,
            bioDescription: j.bio,
          },
        },
      },
      include: { players: true },
    });

    // Asociar a la categoría Primera División de Fútbol Masculino
    if (catPrimeraFutbol) {
      await prisma.playerCategory.create({
        data: {
          playerId: playerPerson.players[0].id,
          categoryId: catPrimeraFutbol.id,
          status: "REGULAR_PLAYER",
          jerseyNumber: j.num === "SOC-1010" ? 10 : j.num === "SOC-1111" ? 11 : j.num === "SOC-2323" ? 1 : j.num === "SOC-0707" ? 7 : 9,
        },
      });
    }
  }

  console.log("✅ Plantel de Primera División cargado.");

  // 8. Crear Partidos y Resultados
  console.log("Programando partidos y fixtures...");
  
  if (catPrimeraFutbol) {
    // Partido 1: Jugado hace 3 días
    const datePast1 = new Date();
    datePast1.setDate(datePast1.getDate() - 3);
    await prisma.match.create({
      data: {
        clubId,
        categoryId: catPrimeraFutbol.id,
        homeTeamId: propioTeam.id,
        awayTeamId: rivalMitre.id,
        matchDate: datePast1,
        status: "FINISHED",
        homeScore: 2,
        awayScore: 1,
        matchSummary: "Clásico vibrante de la ciudad. Olimpo se impuso con un golazo de tiro libre de Lionel Messi y una gran definición cruzada de Ángel Di María en el segundo tiempo.",
      },
    });

    // Partido 2: Jugado hace 7 días
    const datePast2 = new Date();
    datePast2.setDate(datePast2.getDate() - 7);
    await prisma.match.create({
      data: {
        clubId,
        categoryId: catPrimeraFutbol.id,
        homeTeamId: rivalLiniers.id,
        awayTeamId: propioTeam.id,
        matchDate: datePast2,
        status: "FINISHED",
        homeScore: 0,
        awayScore: 3,
        matchSummary: "Sólido rendimiento colectivo fuera de casa. Goles de Lautaro Martínez en dos oportunidades y un penal ejecutado por Rodrigo De Paul en el epílogo del partido.",
      },
    });

    // Partido 3: Próximo partido en 3 días
    const dateFuture1 = new Date();
    dateFuture1.setDate(dateFuture1.getDate() + 3);
    dateFuture1.setHours(16, 0, 0, 0);
    await prisma.match.create({
      data: {
        clubId,
        categoryId: catPrimeraFutbol.id,
        homeTeamId: propioTeam.id,
        awayTeamId: rivalSansinena.id,
        matchDate: dateFuture1,
        matchTime: dateFuture1,
        status: "SCHEDULED",
        customLocationName: "Estadio Roberto Carminatti",
        customLocationAddress: "Colón y Ángel Brunel, Bahía Blanca",
      },
    });

    // Partido 4: Próximo partido en 10 días
    const dateFuture2 = new Date();
    dateFuture2.setDate(dateFuture2.getDate() + 10);
    dateFuture2.setHours(18, 30, 0, 0);
    await prisma.match.create({
      data: {
        clubId,
        categoryId: catPrimeraFutbol.id,
        homeTeamId: rivalAlmagro.id,
        awayTeamId: propioTeam.id,
        matchDate: dateFuture2,
        matchTime: dateFuture2,
        status: "SCHEDULED",
        customLocationName: "Estadio Tres de Febrero",
        customLocationAddress: "José Ingenieros, Buenos Aires",
      },
    });
  }

  console.log("✅ Fixture de partidos cargado.");

  // 9. Crear Noticias de Prensa
  console.log("Cargando noticias de prensa...");
  
  await prisma.news.create({
    data: {
      clubId,
      title: "Gran victoria en el clásico de la ciudad",
      slug: "gran-victoria-en-el-clasico-de-la-ciudad",
      summary: "Olimpo derrotó a Villa Mitre por 2 a 1 en una tarde colmada de emociones en el estadio Carminatti.",
      content: "En un encuentro electrizante disputado ante una multitud, nuestro primer equipo de fútbol masculino se quedó con los tres puntos en el gran clásico de la ciudad. Con goles de Lionel Messi (tiro libre extraordinario) y Ángel Di María, Olimpo ratificó su liderazgo en el campeonato. Felicitamos a todo el plantel y al cuerpo técnico por el esfuerzo y la entrega demostrados.",
      imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
      category: "Fútbol",
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  await prisma.news.create({
    data: {
      clubId,
      title: "Comenzaron las obras en el Gimnasio Centenario",
      slug: "comenzaron-las-obras-en-el-gimnasio-centenario",
      summary: "Iniciamos la remodelación completa del piso de parquet y el techo del gimnasio principal de básquetbol.",
      content: "Con el orgullo de seguir creciendo, la Comisión Directiva anuncia el inicio formal de las obras de puesta en valor de nuestra sede deportiva. Los trabajos incluyen la colocación de un nuevo piso flotante homologado por la CABB y reparaciones estructurales de filtraciones en la techumbre. Agradecemos enormemente a los socios aportantes y a nuestros sponsors oficiales que lo hicieron posible.",
      imageUrl: "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=800&auto=format&fit=crop&q=80",
      category: "Institucional",
      isPublished: true,
      publishedAt: new Date(Date.now() - 24 * 3600 * 1000 * 2),
    },
  });

  await prisma.news.create({
    data: {
      clubId,
      title: "Abierta la preinscripción de socios para el ciclo 2026",
      slug: "abierta-la-preinscripcion-de-socios-para-el-ciclo-2026",
      summary: "Sumate a la gran familia aurinegra. Obtené descuentos en aranceles de disciplinas y acceso a eventos oficiales.",
      content: "El club lanza oficialmente la campaña de conscripción de socios para la segunda mitad del año. A través de nuestro nuevo portal digital, los interesados podrán rellenar su formulario de preinscripción en línea. La secretaría revisará las postulaciones y coordinará la entrega del carnet definitivo. ¡Sumá tu apoyo para que Olimpo siga creciendo día a día!",
      imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&auto=format&fit=crop&q=80",
      category: "Socios",
      isPublished: true,
      publishedAt: new Date(Date.now() - 24 * 3600 * 1000 * 5),
    },
  });

  console.log("✅ Noticias creadas.");

  // 10. Crear Sponsors
  console.log("Cargando sponsors oficiales...");
  
  await prisma.sponsor.create({
    data: {
      clubId,
      name: "Nike",
      logoColorUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
      tier: "PLATINUM",
      isActive: true,
      sortOrder: 1,
    },
  });

  await prisma.sponsor.create({
    data: {
      clubId,
      name: "Coca-Cola",
      logoColorUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cf/Coca-Cola_Formula_Logo.svg",
      tier: "GOLD",
      isActive: true,
      sortOrder: 2,
    },
  });

  await prisma.sponsor.create({
    data: {
      clubId,
      name: "Gatorade",
      logoColorUrl: "https://upload.wikimedia.org/wikipedia/commons/1/14/Gatorade_logo.svg",
      tier: "GOLD",
      isActive: true,
      sortOrder: 3,
    },
  });

  await prisma.sponsor.create({
    data: {
      clubId,
      name: "YPF",
      logoColorUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d4/YPF_logo.svg",
      tier: "SILVER",
      isActive: true,
      sortOrder: 4,
    },
  });

  console.log("✅ Sponsors creados.");

  // 11. Crear Mensajes de Contacto y Suscriptores mock
  console.log("Cargando mensajes de consulta y correos...");
  
  await prisma.contactSubmission.create({
    data: {
      clubId,
      name: "Carlos Bianchi",
      email: "carlos.bianchi@hotmail.com",
      phone: "11-4455-8899",
      message: "Estimados, quería consultar qué horarios tienen disponibles para básquetbol infantil en las categorías U13 y U15, y cuáles son los requisitos de inscripción.",
      status: "PENDING",
    },
  });

  await prisma.contactSubmission.create({
    data: {
      clubId,
      name: "Sabrina Rojas",
      email: "sabrina.rojas@gmail.com",
      phone: "291-5678901",
      message: "Buenas tardes, me gustaría saber si alquilan la cancha de césped sintético para eventos privados los fines de semana por la noche, y el valor del arancel por hora.",
      status: "READ",
    },
  });

  await prisma.newsletterSubscriber.create({
    data: { clubId, email: "hincha.aurinegro@yahoo.com", isActive: true },
  });

  await prisma.newsletterSubscriber.create({
    data: { clubId, email: "marcos.perez@gmail.com", isActive: true },
  });

  console.log("\n🚀 ¡Carga de datos de prueba finalizada exitosamente! Todo listo para ver en el panel y en la web pública.");
}

main()
  .catch((e) => {
    console.error("❌ Ocurrió un error al ejecutar la carga de datos de prueba:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
