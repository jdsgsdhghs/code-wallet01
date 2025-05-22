import { useState, useEffect } from 'react';

// Composant bouton pour basculer entre mode sombre et clair.
// La fonction prend soin de mémoriser le choix dans localStorage,
// donc quand tu reviens sur la page, il se souvient si t'étais en dark ou light.
function DarkModeToggle() {
  // Ici, on initialise l’état darkMode à partir de localStorage
  // astuce cool pour ne pas repartir toujours à false au reload de la page.
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  // useEffect qui s’active à chaque fois que darkMode change.
  // C’est ici qu’on applique les vraies modifications dans le DOM.
  useEffect(() => {
    if (darkMode) {
      // Mode sombre activé : on ajoute la classe CSS 'dark' au <html>
      // et on change le background + la couleur du texte via JS inline.
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#121212';
      document.body.style.color = '#e0e0e0';
      localStorage.setItem('darkMode', 'true'); // On garde ça en mémoire pour la prochaine fois.
    } else {
      // Mode clair : on enlève la classe et on remet tout par défaut.
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  // Bouton simple avec un label dynamique selon le mode actif.
  // Le style inline pour un padding correct et rapide à écrire.
  return (
    <button onClick={() => setDarkMode(!darkMode)} style={{ padding: '0.5rem 1rem' }}>
      {darkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
    </button>
  );
}

export default DarkModeToggle;
