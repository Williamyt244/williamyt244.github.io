// ============================================
// CONFIGURAÇÃO DO SUPABASE - WilliamDesign
// ============================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://kpvssntkgpiqdqqxjveo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwdnNzbnRrZ3BpcWRxcXhqdmVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExODM1NjEsImV4cCI6MjA5Njc1OTU2MX0.FJMF1Vw8EuK_siurXtBAv1NwlUx82psNpfunnqr-CqI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
