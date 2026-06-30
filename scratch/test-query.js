const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://azseppmrregctvjavknc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6c2VwcG1ycmVnY3R2amF2a25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMjIxNDAsImV4cCI6MjA5Nzc5ODE0MH0.walBJnRGPcvGh8lzv1quNEA2qidOc7JSyse83TQETvo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, doctors(id, name, name_ar), departments(id, name, name_ar)')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Returned Data Length:', data.length);
    console.log('Sample data:', data.slice(0, 3));
  }
}

check();
