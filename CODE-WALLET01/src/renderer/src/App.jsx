import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Info from './pages/Info';
import Fragments from './pages/Fragments';
import Tags from './pages/Tags';

import Form from './pages/Form';
import Header from './components/Header';
import './style.css'; 
import 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';

function App() {
  return (
   
<Router>
      {/* Le Header avec Dark Mode */}
      <Header />

    <main className="main">
      <Routes>
        <Route path="/" element={<Fragments />} />

        <Route path="/info" element={<Info />} />
        <Route path="/fragments" element={<Fragments />} />
        <Route path="/tags" element={<Tags />} />
       
        
        <Route path="/new" element={<Form />} />
      </Routes>
    </main>
  </Router>
  );
}

export default App;
