import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://himnwcablvezrammotfn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpbW53Y2FibHZlenJhbW1vdGZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MjM4MTUsImV4cCI6MjA3ODE5OTgxNX0.BpEqZkv8qVqlMueTianmdplgdLVU8gikSjJ4IBYT4hQ' 

export const supabase = createClient(supabaseUrl, supabaseKey)
