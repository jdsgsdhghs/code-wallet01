import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';


function Fragments() {
              // Etats pour stocker :

  // - la liste complète des fragments
  const [fragments, setFragments] = useState([]);
  // - le fragment sélectionné (pour affichage ou édition)
  const [selectedFragment, setSelectedFragment] = useState(null);

  // - le mode édition activé ou non

  const [isEditing, setIsEditing] = useState(false);
  // - la recherche texte
  const [searchTerm, setSearchTerm] = useState('');
  // - la liste des favoris, stockée dans localStorage pour persistance
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  // - filtre affichage pour ne montrer que les favoris
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const navigate = useNavigate();

                         // Au chargement, on récupère les fragments via l'API Electron
  useEffect(() => {
    async function fetchFragments() {
      const data = await window.electronAPI.getFragments();
      setFragments(data || []);
    }
    fetchFragments();






  }, []);

             // À chaque mise à jour des fragments, on relance Prism pour la coloration syntaxique
  useEffect(() => {
    Prism.highlightAll();
  }, [fragments]);








  // Navigation vers la page tags avec filtre sur tag cliqué





  const onTagClick = (tag) => {
    navigate('/tags', { state: { selectedTag: tag } });

  };

  // Ajoute ou retire un fragment de la liste des favoris, et sauvegarde dans localStorage
  const toggleFavorite = (id) => {

    setFavorites((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((favId) => favId !== id)

        : [...prev, id];
                        localStorage.setItem('favorites', JSON.stringify(updated));
      return updated;
    });
  };

  // Filtrage dynamique selon texte de recherche et filtres favoris
  const filteredFragments = fragments.filter((fragment) => {
    const matchesSearch =
      fragment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fragment.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fragment.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesFavorite = showFavoritesOnly
      ? favorites.includes(fragment.id)
      : true;

    return matchesSearch && matchesFavorite;
  });

  // Export JSON complet des fragments
  const handleExport = () => {
    const json = JSON.stringify(fragments, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fragments-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON (enregistre aussi dans Electron via bridge)
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedFragments = JSON.parse(e.target.result);
        if (Array.isArray(importedFragments)) {
          window.electronAPI.importFragments(importedFragments);
          setFragments(importedFragments);
          alert('Import successful!');
        } else {
          alert('Invalid JSON format');
        }
      } catch (error) {
        alert('Error parsing JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fragments-page">
      <h2 className="fragments-title">My Saved Fragments</h2>

      {/* Input recherche */}
      <input
        type="text"
        placeholder="Search fragments..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding: '0.5rem', marginBottom: '0.5rem', width: '100%' }}
      />

      {/* Toggle affichage favoris */}
      <label style={{ display: 'block', marginBottom: '1rem', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={showFavoritesOnly}
          onChange={() => setShowFavoritesOnly(!showFavoritesOnly)}
          style={{ marginRight: '0.5rem' }}
        />
        Show favorites only
      </label>

      {/* Boutons export/import JSON */}
      <div
        style={{
          marginBottom: '1rem',
          display: 'inline-flex',
          alignItems: 'center',
        }}
      >
        <button onClick={handleExport} className="export-btn">
          Export JSON
        </button>
        <label
          htmlFor="import-file"
          className="import-label"
          style={{
            backgroundColor: '#9A48D0',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.9rem',
            marginLeft: '1rem',
          }}
        >
          Import JSON
        </label>
        <input
          id="import-file"
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
      </div>

      {/* Liste des fragments */}
      {filteredFragments.length === 0 ? (
        <p className="no-fragments">No fragments found.</p>
      ) : (
        <ul className="fragments-list">
          {filteredFragments.map((fragment) => (
            <li key={fragment.id} className="fragment-card">
              <h3 className="fragment-title">
                {fragment.title}
                <button
                  onClick={() => toggleFavorite(fragment.id)}
                  style={{
                    cursor: 'pointer',
                    fontSize: '1.5rem',
                    color: favorites.includes(fragment.id) ? 'gold' : 'gray',
                    background: 'none',
                    border: 'none',
                    marginLeft: '0.5rem',
                  }}
                  aria-label={
                    favorites.includes(fragment.id)
                      ? 'Remove from favorites'
                      : 'Add to favorites'
                  }
                >
                  {favorites.includes(fragment.id) ? '⭐' : '☆'}
                </button>
              </h3>

              <p className="fragment-tags">
                <strong>Tags :</strong>{' '}
                {fragment.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onTagClick(tag)}
                    className="tag-btn"
                    style={{ marginRight: '5px' }}
                  >
                    {tag}
                  </button>
                ))}
              </p>

              {/* Code avec coloration syntaxique via Prism */}
              <pre
                className="fragment-code language-javascript"
                dangerouslySetInnerHTML={{
                  __html: Prism.highlight(
                    fragment.code,
                    Prism.languages.javascript,
                    'javascript'
                  ),
                }}
                style={{
                  borderRadius: '6px',
                  overflowX: 'auto',
                  boxShadow: '0 0 10px #00000088',
                }}
              />

              {/* Boutons actions */}
              <div className="fragment-buttons">
                <button
                  className="btn btn-view"
                  onClick={() => setSelectedFragment(fragment)}
                >
                  View
                </button>
                <button
                  className="btn btn-edit"
                  onClick={() => {
                    setSelectedFragment(fragment);
                    setIsEditing(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn btn-delete"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this fragment?')) {
                      window.electronAPI.deleteFragment(fragment.id);
                      setFragments((prev) =>
                        prev.filter((frag) => frag.id !== fragment.id)
                      );
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal View (affichage) */}
      {selectedFragment && !isEditing && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{selectedFragment.title}</h2>
            <p>
              <strong>Tags :</strong> {selectedFragment.tags.join(', ')}
            </p>
            <pre className="modal-code language-javascript">
              <code>{selectedFragment.code}</code>
            </pre>
            <div className="modal-buttons">
              <button
                className="btn btn-copy"
                onClick={() => {
                  navigator.clipboard.writeText(selectedFragment.code);
                  alert('Code copied to clipboard!');
                }}
              >
                📋 Copy
              </button>
              <button
                className="btn btn-close"
                onClick={() => setSelectedFragment(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit (édition) */}
      {isEditing && selectedFragment && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Fragment</h2>

            <div className="form-group">
              <label>Title:</label>
              <input
                type="text"
                value={selectedFragment.title}
                onChange={(e) =>
                  setSelectedFragment({ ...selectedFragment, title: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Tags (separated by commas):</label>
              <input
                type="text"
                value={selectedFragment.tags.join(', ')}
                onChange={(e) =>
                  setSelectedFragment({
                    ...selectedFragment,
                    tags: e.target.value
                      .split(',')
                      .map((tag) => tag.trim().toLowerCase())
                      .filter((tag) => tag.length > 0),
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Code:</label>
              <textarea
                rows="8"
                value={selectedFragment.code}
                onChange={(e) =>
                  setSelectedFragment({ ...selectedFragment, code: e.target.value })
                }
              ></textarea>
            </div>

            <div className="modal-buttons">
              <button
                className="btn btn-save"
                onClick={() => {
                  window.electronAPI.editFragment(selectedFragment);
                  setFragments((prev) =>
                    prev.map((frag) =>
                      frag.id === selectedFragment.id ? selectedFragment : frag
                    )
                  );
                  setIsEditing(false);
                  setSelectedFragment(null);
                  alert('Fragment updated successfully!');
                }}
              >
                Save Changes
              </button>
              <button
                className="btn btn-close"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedFragment(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Fragments;
