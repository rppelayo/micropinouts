import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import EmbedLayout from './components/EmbedLayout';
import Home from './pages/Home';
import BoardDetail from './pages/BoardDetail';
import EmbedBoard from './pages/EmbedBoard';
import EditBoard from './pages/EditBoard';
import Admin from './pages/Admin';
import CompareBoards from './pages/CompareBoards';
import WiringGuides from './pages/WiringGuides';
import WiringGuide from './pages/WiringGuide';
import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <Router basename="/micropinouts">
        <Routes>
          {/* Embed routes without header */}
          <Route path="/embed/*" element={<EmbedLayout />}>
            <Route path="board/:id" element={<EmbedBoard />} />
          </Route>
          
          {/* Regular routes with header */}
          <Route path="/*" element={
            <div className="App">
              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/board/:id" element={<BoardDetail />} />
                  <Route path="/boards/:id" element={<BoardDetail />} />
                  <Route path="/compare" element={<CompareBoards />} />
                  <Route path="/wiring-guides" element={<WiringGuides />} />
                  <Route path="/wiring-guide/:slug" element={<WiringGuide />} />
                  <Route path="/admin/boards/:id/edit" element={<EditBoard />} />
                  <Route path="/admin" element={<Admin />} />
                </Routes>
              </main>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
