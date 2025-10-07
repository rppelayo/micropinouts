import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import BoardDetail from './pages/BoardDetail';
import EditBoard from './pages/EditBoard';
import Admin from './pages/Admin';
import CompareBoards from './pages/CompareBoards';
import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/board/:id" element={<BoardDetail />} />
              <Route path="/boards/:id" element={<BoardDetail />} />
              <Route path="/compare" element={<CompareBoards />} />
              <Route path="/admin/boards/:id/edit" element={<EditBoard />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
