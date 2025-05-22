import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';

function Tags() {
  // Récupérer le tag sélectionné via le state du routeur pour filtrer direct
  const location = useLocation();
  const initialSelectedTag = location.state?.selectedTag || null;
  
  // Etats : liste complète, tag sélectionné, mode édition, valeur du tag édité
  const [fragments, setFragments] = useState([]);
  const [selectedTag, setSelectedTag] = useState(initialSelectedTag);
  const [isEditingTag, setIsEditingTag] = useState(false);
  const [editedTag, setEditedTag] = useState("");

  // Charger les fragments depuis la base via Electron une fois au montage
  useEffect(() => {
    async function fetchFragments() {
      const data = await window.electronAPI.getFragments();
      setFragments(data || []);
    }
    fetchFragments();
  }, []);

  // Relancer la coloration syntaxique à chaque mise à jour des fragments
  useEffect(() => {
    Prism.highlightAll();
  }, [fragments]);

  // Extraire tous les tags uniques présents dans les fragments
  const allTags = [...new Set(fragments.flatMap(frag => frag.tags))];

  // Compter combien de fois chaque tag apparaît
  const tagCounts = {};
  allTags.forEach(tag => {
    tagCounts[tag] = fragments.filter(frag => frag.tags.includes(tag)).length;
  });

  // Filtrer les fragments selon le tag sélectionné
  const filteredFragments = selectedTag
    ? fragments.filter(frag => frag.tags.includes(selectedTag))
    : fragments;

  // Fonction pour démarrer l'édition d'un tag
  const handleEditTag = (tag) => {
    setSelectedTag(tag);
    setEditedTag(tag);
    setIsEditingTag(true);
  };

  // Recharger la liste des fragments depuis la base après modification/suppression
  const refreshFragments = async () => {
    const data = await window.electronAPI.getFragments();
    setFragments(data || []);
  };

  // Sauvegarder les modifications du tag
  const handleSaveTagEdit = async () => {
    if (editedTag !== selectedTag) {
      try {
        await window.electronAPI.editTag(selectedTag, editedTag);
        await refreshFragments();
        setIsEditingTag(false);
        setSelectedTag(null);
      } catch (error) {
        console.error('Error editing tag:', error);
      }
    } else {
      // Si pas de changement, juste fermer la modale
      setIsEditingTag(false);
      setSelectedTag(null);
    }
  };

  // Supprimer un tag de tous les fragments
  const handleDeleteTag = async (tag) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      try {
        await window.electronAPI.deleteTag(tag);
        await refreshFragments();
        setSelectedTag(null);
      } catch (error) {
        console.error('Error deleting tag:', error);
      }
    }
  };

  return (
    <div className="fragments-page">
      <h2 className="fragments-title">Tags list</h2>

      <div style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {allTags.map(tag => (
          <div key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            {/* Bouton tag filtre + style actif */}
            <button
              onClick={() => setSelectedTag(tag)}
              className={`tag-btn ${selectedTag === tag ? 'tag-btn-active' : ''}`}
            >
              {tag} ({tagCounts[tag]})
            </button>
            {/* Boutons Edit et Delete, classes dédiées pour styling */}
            <button onClick={() => handleEditTag(tag)} className="tag-btn-edit">Edit</button>
            <button onClick={() => handleDeleteTag(tag)} className="tag-btn-delete">Delete</button>
          </div>
        ))}

        {/* Bouton clear filtre */}
        {selectedTag && (
          <button onClick={() => setSelectedTag(null)} className="tag-btn tag-btn-clear">
            Clear filter
          </button>
        )}
      </div>

      {/* Modale édition tag */}
      {isEditingTag && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Tag</h2>
            <label>New Tag Name:</label>
            <input
              type="text"
              value={editedTag}
              onChange={(e) => setEditedTag(e.target.value)}
              autoFocus
            />
            <div className="modal-buttons">
              <button className="btn btn-save" onClick={handleSaveTagEdit}>Save Changes</button>
              <button className="btn btn-close" onClick={() => setIsEditingTag(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des fragments filtrés */}
      {filteredFragments.length === 0 ? (
        <p className="no-fragments">No fragments for this tag.</p>
      ) : (
        <ul className="fragments-list">
          {filteredFragments.map(fragment => (
            <li key={fragment.id} className="fragment-card">
              <h3 className="fragment-title">{fragment.title}</h3>
              <pre
                className="fragment-code language-javascript"
                dangerouslySetInnerHTML={{
                  __html: Prism.highlight(fragment.code, Prism.languages.javascript, 'javascript')
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Tags;
