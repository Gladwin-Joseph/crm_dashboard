import { createClient } from '@supabase/supabase-js';


const supabaseUrl = 'https://xvelrpogedzmrvujrjxh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2ZWxycG9nZWR6bXJ2dWpyanhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc5MzMzNzAsImV4cCI6MjA0MzUwOTM3MH0.s24J6XeyK6vU7DYON7xULeWuctbPGzVxFHlKgE1OcFU';
export const supabase = createClient(supabaseUrl, supabaseKey);