import { Link } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle';


function Header() {
  return (
    <header>
      {/* Titre visible en haut à gauche */}
      <h1>Code Wallet</h1>
      <nav>
        {/* Navigation simple avec react-router-dom Link 
            ça évite le reload complet, c’est smooth */}
        <Link to="/fragments">Fragments</Link>
        <Link to="/info">Info</Link>
        <Link to="/tags">Tags</Link>
        {/* Bouton stylé "New" pour ajouter un nouveau fragment */}
        <Link to="/new" className="new">New</Link>
        
        {/* Toggle mode sombre placé ici dans la nav */}
        <DarkModeToggle />
      </nav>
    </header>
  );
}

export default Header;
