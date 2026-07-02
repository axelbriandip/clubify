const { PrismaClient, PreferredSide } = require("@prisma/client");
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

// Listado de fotos reales de Unsplash para deportistas masculinos
const MALE_ATHLETE_PHOTOS = [
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1542103749-8ef59b94f47e?w=400&h=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1504257473779-c33e445383c6?w=400&h=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=400&h=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400&h=400&fit=crop&q=80"
];

// Listado de fotos reales de Unsplash para deportistas femeninos
const FEMALE_ATHLETE_PHOTOS = [
  "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=400&h=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=400&h=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&h=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&q=80"
];

// Listado de fotos para la Comisión Directiva (más corporativas / ejecutivos)
const EXECUTIVE_PHOTOS = [
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&q=80", // Hombre traje
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop&q=80", // Mujer ejecutiva
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&q=80", // Hombre ejecutivo
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&q=80", // Mujer traje
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&q=80", // Hombre maduro
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&q=80", // Mujer gerente
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80", // Hombre lentes
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop&q=80"  // Mujer líder
];

const FIRST_NAMES = [
  "Santiago", "Mateo", "Juan", "Lucas", "Tomás", "Benjamín", "Felipe", "Bautista",
  "Joaquín", "Nicolás", "Valentín", "Agustín", "Ignacio", "Francisco", "Lautaro",
  "Gonzalo", "Enzo", "Julián", "Franco", "Ramiro", "Federico", "Marcos", "Martín",
  "Manuel", "Bruno", "Jeremías", "Alex", "Javier", "David", "Gabriel"
];

const LAST_NAMES = [
  "González", "Rodríguez", "Gómez", "Fernández", "López", "Díaz", "Martínez", "Pérez",
  "Romero", "Sánchez", "Álvarez", "Torres", "Ruiz", "Ramírez", "Rossi", "Ferrari",
  "García", "Benítez", "Medina", "Herrera", "Suárez", "Giménez", "Rojas", "Molina",
  "Castro", "Ortiz", "Silva", "Núñez", "Luna", "Juárez", "Cabrera", "Acosta"
];

const BOARD_POSITIONS = [
  "Presidente",
  "Vicepresidente 1º",
  "Secretario General",
  "Prosecretario",
  "Tesorero",
  "Protesorero",
  "Vocal Titular 1º",
  "Vocal Titular 2º"
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Definición de posiciones y el orden explícito (sortOrder) para cada deporte
const DEFAULT_POSITIONS = {
  futbol: [
    { name: "Arquero", groupName: "Arqueros", sortOrder: 1 },
    { name: "Defensor Central", groupName: "Defensores", sortOrder: 2 },
    { name: "Lateral Derecho", groupName: "Defensores", sortOrder: 3 },
    { name: "Lateral Izquierdo", groupName: "Defensores", sortOrder: 4 },
    { name: "Líbero", groupName: "Defensores", sortOrder: 5 },
    { name: "Mediocampista Central", groupName: "Mediocampistas", sortOrder: 6 },
    { name: "Volante Derecho", groupName: "Mediocampistas", sortOrder: 7 },
    { name: "Volante Izquierdo", groupName: "Mediocampistas", sortOrder: 8 },
    { name: "Enganche", groupName: "Mediocampistas", sortOrder: 9 },
    { name: "Centrodelantero", groupName: "Delanteros", sortOrder: 10 },
    { name: "Extremo Derecho", groupName: "Delanteros", sortOrder: 11 },
    { name: "Extremo Izquierdo", groupName: "Delanteros", sortOrder: 12 },
    { name: "Segunda Punta", groupName: "Delanteros", sortOrder: 13 }
  ],
  futsal: [
    { name: "Arquero", groupName: "Arqueros", sortOrder: 1 },
    { name: "Cierre", groupName: "Cierres", sortOrder: 2 },
    { name: "Ala Derecho", groupName: "Alas", sortOrder: 3 },
    { name: "Ala Izquierdo", groupName: "Alas", sortOrder: 4 },
    { name: "Pívot", groupName: "Pívots", sortOrder: 5 }
  ],
  basquet: [
    { name: "Base", groupName: "Bases", sortOrder: 1 },
    { name: "Escolta", groupName: "Escoltas", sortOrder: 2 },
    { name: "Alero", groupName: "Aleros", sortOrder: 3 },
    { name: "Ala-Pívot", groupName: "Ala-Pívots", sortOrder: 4 },
    { name: "Pívot", groupName: "Pívots", sortOrder: 5 }
  ],
  voley: [
    { name: "Armador", groupName: "Armadores", sortOrder: 1 },
    { name: "Líbero", groupName: "Líberos", sortOrder: 2 },
    { name: "Central", groupName: "Centrales", sortOrder: 3 },
    { name: "Punta Receptor", groupName: "Puntas", sortOrder: 4 },
    { name: "Opuesto", groupName: "Opuestos", sortOrder: 5 }
  ],
  generic: [
    { name: "Titular", groupName: "Plantel General", sortOrder: 1 },
    { name: "Suplente", groupName: "Plantel General", sortOrder: 2 }
  ]
};

async function main() {
  console.log("Iniciando carga de datos con fotos reales y sortOrder...");

  // Buscar club "olimpo"
  const club = await prisma.club.findFirst({
    where: { slug: "olimpo" }
  });

  if (!club) {
    console.error("❌ No se encontró el club 'olimpo' en la base de datos.");
    return;
  }

  const clubId = club.id;
  console.log(`Club ID: ${clubId} - ${club.name}`);

  // 1. CREAR COMISIÓN DIRECTIVA (8 personas con fotos reales)
  console.log("Limpiando autoridades previas...");
  await prisma.boardMember.deleteMany({ where: { clubId } });

  console.log("Creando 8 autoridades de Comisión Directiva con fotos...");
  for (let i = 0; i < 8; i++) {
    const firstName = getRandomItem(FIRST_NAMES);
    const lastName = getRandomItem(LAST_NAMES);
    
    // Crear Persona
    const person = await prisma.person.create({
      data: {
        clubId,
        firstName,
        lastName,
        dateOfBirth: new Date(1960 + getRandomInt(0, 30), getRandomInt(0, 11), getRandomInt(1, 28)),
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@clubolimpo.co`,
        phone: `341-${getRandomInt(1000000, 9999999)}`,
      }
    });

    // Crear Directivo
    await prisma.boardMember.create({
      data: {
        clubId,
        personId: person.id,
        position: BOARD_POSITIONS[i],
        photoSquareUrl: EXECUTIVE_PHOTOS[i], // Foto real corporativa
        isActive: true,
        sortOrder: i + 1,
        termStart: new Date(2024, 0, 1),
        termEnd: new Date(2027, 11, 31)
      }
    });
  }
  console.log("✅ Comisión Directiva creada con éxito.");

  // 2. CREAR POSICIONES POR DISCIPLINA CON SORT_ORDER Y JUGADORES CON FOTOS
  console.log("Obteniendo disciplinas del club...");
  const disciplines = await prisma.discipline.findMany({
    where: { clubId },
    include: {
      categories: true
    }
  });

  // Limpiar posiciones existentes
  console.log("Limpiando posiciones previas...");
  await prisma.disciplinePosition.deleteMany({
    where: {
      disciplineId: {
        in: disciplines.map(d => d.id)
      }
    }
  });

  for (const disc of disciplines) {
    const slug = disc.slug.toLowerCase();
    let posDefs = DEFAULT_POSITIONS.generic;

    if (slug.includes("futsal")) {
      posDefs = DEFAULT_POSITIONS.futsal;
    } else if (slug.includes("futbol") || slug.includes("soccer")) {
      posDefs = DEFAULT_POSITIONS.futbol;
    } else if (slug.includes("basquet") || slug.includes("basket")) {
      posDefs = DEFAULT_POSITIONS.basquet;
    } else if (slug.includes("voley") || slug.includes("volley")) {
      posDefs = DEFAULT_POSITIONS.voley;
    }

    console.log(`Creando posiciones con sortOrder para ${disc.name}...`);
    const dbPositions = [];
    for (const def of posDefs) {
      const dbPos = await prisma.disciplinePosition.create({
        data: {
          disciplineId: disc.id,
          name: def.name,
          groupName: def.groupName,
          sortOrder: def.sortOrder
        }
      });
      dbPositions.push(dbPos);
    }

    // Para cada categoría, crear 20 jugadores
    for (const category of disc.categories) {
      console.log(`Creando 20 jugadores con fotos reales para la categoría: ${category.name}...`);

      // Limpiar relaciones previas
      await prisma.playerCategory.deleteMany({ where: { categoryId: category.id } });

      const isFemale = category.gender === "FEMALE";
      const photoPool = isFemale ? FEMALE_ATHLETE_PHOTOS : MALE_ATHLETE_PHOTOS;

      const numbersUsed = new Set();
      for (let j = 0; j < 20; j++) {
        const firstName = getRandomItem(FIRST_NAMES);
        const lastName = getRandomItem(LAST_NAMES);

        let jerseyNumber = getRandomInt(1, 99);
        while (numbersUsed.has(jerseyNumber)) {
          jerseyNumber = getRandomInt(1, 99);
        }
        numbersUsed.add(jerseyNumber);

        // Crear Persona
        const person = await prisma.person.create({
          data: {
            clubId,
            firstName,
            lastName,
            dateOfBirth: new Date(2000 + getRandomInt(0, 10), getRandomInt(0, 11), getRandomInt(1, 28)),
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${jerseyNumber}@olimpoportals.com`,
            phone: `341-${getRandomInt(1000000, 9999999)}`,
            documentId: `${getRandomInt(38000000, 48000000)}`
          }
        });

        // Seleccionar foto secuencial o aleatoria de Unsplash
        const photoSquareUrl = photoPool[j % photoPool.length];

        // Crear Jugador con foto real
        const player = await prisma.player.create({
          data: {
            clubId,
            personId: person.id,
            preferredSide: getRandomItem([PreferredSide.RIGHT, PreferredSide.LEFT, PreferredSide.AMBIDEXTROUS]),
            heightCm: getRandomInt(165, 202),
            weightKg: getRandomInt(62, 96),
            photoSquareUrl, // Foto real de atleta
            isActive: true
          }
        });

        // Elegir posición relacional aleatoria
        const chosenPos = getRandomItem(dbPositions);

        // Crear relación PlayerCategory
        await prisma.playerCategory.create({
          data: {
            playerId: player.id,
            categoryId: category.id,
            jerseyNumber,
            position: chosenPos.name,
            positionId: chosenPos.id,
            status: "REGULAR_PLAYER"
          }
        });
      }
      console.log(`✅ Creados 20 jugadores en ${category.name}`);
    }
  }

  console.log("\n🚀 ¡Carga masiva relacional y multimedia completada con éxito!");
}

main()
  .catch((e) => {
    console.error("❌ Error durante el sembrado:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
