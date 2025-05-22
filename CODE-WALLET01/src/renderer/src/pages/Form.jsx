import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Fonction utilitaire pour nettoyer un tag : trim + mettre en minuscules
const cleanTag = (tag) => tag.trim().toLowerCase();

function Form() {
  // États locaux pour gérer les champs du formulaire
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState([]);          // tableau des tags ajoutés
  const [tagInput, setTagInput] = useState('');  // input où l’utilisateur tape un tag avant validation
  const [code, setCode] = useState('');
  const navigate = useNavigate(); // hook React Router pour naviguer programmétiquement

  // Fonction déclenchée quand on appuie sur une touche dans l’input des tags
  // Si c’est Enter ou virgule, on ajoute le tag (nettoyé) à la liste s’il est nouveau
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault(); // Empêche le saut de ligne ou la virgule dans l’input
      const newTag = cleanTag(tagInput);
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]); // On ajoute le nouveau tag dans le tableau
      }
      setTagInput(''); // On vide l’input pour la prochaine saisie
    }
  };

  // Supprime un tag de la liste quand on clique sur la croix
  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault(); // Empêche le reload de page

    // Création de l’objet fragment à envoyer à la base
    const fragment = {
      title,
      tags,
      code,
    };

    // Envoi via le bridge electron (préload.js)
    if (window.electronAPI?.sendFragment) {
      window.electronAPI.sendFragment(fragment);
      navigate('/fragments'); // Redirige vers la liste des fragments
    } else {
      console.error('electronAPI non disponible');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h2>Add a New Fragment</h2>

      {/* Input titre contrôlé */}
      <label>Title :</label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      {/* Gestion avancée des tags avec affichage et suppression */}
      <label>Tags :</label>
      <div
        className="tags-input-container"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          border: '1px solid #ccc',
          padding: '0.5rem',
          borderRadius: '4px',
        }}
      >
        {/* Affichage des tags ajoutés */}
        {tags.map(tag => (
          <div
            key={tag}
            style={{
              backgroundColor: '#9a48d0',
              color: '#fff',
              padding: '0.2rem 0.5rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              style={{
                cursor: 'pointer',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontWeight: 'bold',
                lineHeight: 1,
              }}
              aria-label={`Remove tag ${tag}`}
            >
              ×
            </button>
          </div>
        ))}

        {/* Input pour taper un tag avant validation */}
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagInputKeyDown}
          placeholder="Type tag and press Enter"
          style={{ flex: '1 0 150px', border: 'none', outline: 'none' }}
          aria-label="Tag input"
        />
      </div>

      {/* Textarea pour le code */}
      <label>Code :</label>
      <textarea
        rows="8"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
      ></textarea>

      {/* Bouton de soumission */}
      <button type="submit" style={{ marginTop: '1rem' }}>
        Add
      </button>
    </form>
  );
}

export default Form;
