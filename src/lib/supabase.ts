import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  // Comentario: Advertencia en consola de desarrollo si faltan configurar las variables
  console.warn("Faltan configurar las variables de entorno NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local");
}

// Inicialización del cliente de Supabase para consultas públicas y autenticación
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
