// Inicializar Firebase (versión v8)
var firebaseConfig = {
  apiKey: "AIzaSyDdaGHibWo2agxjP6778JSJtiyEJU7aKNg",
  authDomain: "chat-con-mi-primo.firebaseapp.com",
  databaseURL: "https://chat-con-mi-primo-default-rtdb.firebaseio.com/",
  projectId: "chat-con-mi-primo",
  storageBucket: "chat-con-mi-primo.firebasestorage.app",
  messagingSenderId: "83054381527",
  appId: "1:83054381527:web:8bbf55c756fcacf0996392"
};
firebase.initializeApp(firebaseConfig);

// Pedir nombre al usuario (si quieres, puedes cambiar a un input en HTML)
let username = prompt("Escribe tu nombre:");
if (!username) username = "Anónimo";
document.getElementById('userLabel').textContent = 'Tu: ' + username;

// Referencia a la base de datos
var db = firebase.database().ref("mensajes");

// Paleta de colores (puedes añadir/quitar colores)
const COLORS = ['#ff6b6b','#48dbfb','#1dd1a1','#feca57','#54a0ff','#ff9ff3','#5f27cd','#ee5253','#ff9f43','#0abde3'];

// Determinístico: mismo nombre -> mismo color
function nameToColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // mantener en 32 bits
  }
  const idx = Math.abs(hash) % COLORS.length;
  return COLORS[idx];
}

// Convierte hex a rgb y devuelve color texto (negro o blanco) para contraste
function hexToRgb(hex) {
  hex = hex.replace('#','');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const bigint = parseInt(hex, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}
function getContrastColor(hex) {
  const { r, g, b } = hexToRgb(hex);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return (yiq >= 128) ? '#000000' : '#FFFFFF';
}

// Enviar mensaje
function sendMessage() {
  var message = document.getElementById("messageInput").value;
  if (message.trim() !== "") {
    db.push({
      name: username,
      text: message,
      time: Date.now()
    });
    document.getElementById("messageInput").value = "";
  }
}

// Evento botón + Enter
document.getElementById('sendBtn').addEventListener('click', sendMessage);
document.getElementById('messageInput').addEventListener('keypress', function(e){
  if (e.key === 'Enter') sendMessage();
});

// Escuchar mensajes nuevos
db.on("child_added", function(snapshot) {
  var data = snapshot.val();

  // Crear elemento del mensaje (con estructura segura, sin innerHTML con texto directo)
  var msgElement = document.createElement("p");
  msgElement.classList.add(data.name === username ? "self" : "other");

  // Estilo: color asignado según nombre (mismo nombre -> mismo color)
  const userColor = nameToColor(data.name);
  msgElement.style.backgroundColor = userColor;
  msgElement.style.color = getContrastColor(userColor);

  // Contenido: <strong>Nombre:</strong> Mensaje
  var strong = document.createElement("strong");
  strong.textContent = data.name + ": ";
  msgElement.appendChild(strong);
  msgElement.appendChild(document.createTextNode(data.text));

  document.getElementById("messages").appendChild(msgElement);

  // Auto-scroll
  var messagesDiv = document.getElementById("messages");
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
