// ============================================
// CONFIGURAÇÃO DO SUPABASE - WilliamDesign
// Suas credenciais do projeto
// ============================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://kpvssntkgpiqdqqxjveo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_wilLj1ljC23dSIKi-K_kLg_rGavTVG3';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
