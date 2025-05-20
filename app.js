const SUPABASE_URL = 'https://igtujbdtcaixjwffwsti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlndHVqYmR0Y2FpeGp3ZmZ3c3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NTY4NjcsImV4cCI6MjA2MzMzMjg2N30.ppv_c3Q5-9YaUBXUfw-dHEHKEfzDnhCjfXMqW2Fme1A';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const chatBox = document.getElementById('chat-box');
const form = document.getElementById('message-form');
const input = document.getElementById('message-input');

// Load messages
async function loadMessages() {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('timestamp', { ascending: true });

  if (error) {
    console.error('Error loading messages:', error.message);
    return;
  }

  chatBox.innerHTML = '';
  data.forEach(displayMessage);
}

function displayMessage(msg) {
  const div = document.createElement('div');
  div.textContent = msg.text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  const { error } = await supabase.from('messages').insert([{ text }]);

  if (error) {
    console.error('Error sending message:', error.message);
  } else {
    input.value = '';
  }
});

supabase
  .channel('realtime:public:messages')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'messages' },
    (payload) => {
      displayMessage(payload.new);
    }
  )
  .subscribe();

loadMessages();


