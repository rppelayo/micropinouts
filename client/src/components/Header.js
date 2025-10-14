import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Settings, LogOut, GitCompare, Link as LinkIcon, Info, ChevronDown, FileText, Shield } from 'lucide-react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  z-index: 1000;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #1e293b;
  font-size: 24px;
  font-weight: 700;
  
  &:hover {
    color: #3b82f6;
  }
`;

const LogoImage = styled.img`
  height: 70px;
  width: auto;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 32px;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: ${props => props.$active ? '#3b82f6' : '#64748b'};
  font-weight: ${props => props.$active ? '600' : '500'};
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #3b82f6;
    background-color: #f1f5f9;
  }
`;

const LoginButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.$isAuthenticated ? '#10b981' : '#3b82f6'};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$isAuthenticated ? '#059669' : '#2563eb'};
    transform: translateY(-1px);
  }
`;

const UserInfo = styled.span`
  font-size: 14px;
  opacity: 0.9;
`;

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: ${props => props.$active ? '#3b82f6' : '#64748b'};
  font-weight: ${props => props.$active ? '600' : '500'};
  font-size: inherit;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
  background: none;
  border: none;
  cursor: pointer;
  
  &:hover {
    color: #3b82f6;
    background-color: #f1f5f9;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 1000;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.2s ease;
`;

const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  text-decoration: none;
  color: #374151;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f1f5f9;
    color: #3b82f6;
  }
  
  &:first-child {
    border-radius: 8px 8px 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 8px 8px;
  }
`;

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  
  const handleAdminClick = () => {
    if (isAuthenticated) {
      navigate('/admin');
    } else {
      // Show login modal or redirect to login
      navigate('/admin');
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo to="/">
          <LogoImage src="/logo.png" alt="MicroPinouts Logo" />
        </Logo>
        <Nav>
          <NavLink to="/" $active={location.pathname === '/'}>
            <Home size={20} />
            Home
          </NavLink>
          <NavLink to="/compare" $active={location.pathname === '/compare'}>
            <GitCompare size={20} />
            Compare
          </NavLink>
          <NavLink 
            to={isAuthenticated ? "/admin?tab=wiring" : "/wiring-guides"} 
            $active={location.pathname === '/wiring-guides' || (isAuthenticated && location.pathname === '/admin')}
          >
            <LinkIcon size={20} />
            Wiring Guides
          </NavLink>
          <DropdownContainer>
            <DropdownButton 
              $active={location.pathname === '/about' || location.pathname === '/legal' || location.pathname === '/privacy'}
              onClick={() => navigate('/about')}
              onMouseEnter={() => setIsAboutOpen(true)}
              onMouseLeave={() => setIsAboutOpen(false)}
            >
              <Info size={20} />
              About
              <ChevronDown size={16} />
            </DropdownButton>
            <DropdownMenu 
              $isOpen={isAboutOpen}
              onMouseEnter={() => setIsAboutOpen(true)}
              onMouseLeave={() => setIsAboutOpen(false)}
            >
              <DropdownItem to="/legal">
                <FileText size={16} />
                Legal and Licensing
              </DropdownItem>
              <DropdownItem to="/privacy">
                <Shield size={16} />
                Privacy Policy
              </DropdownItem>
            </DropdownMenu>
          </DropdownContainer>
          {isAuthenticated && (
            <NavLink to="/admin" $active={location.pathname === '/admin'}>
              <Settings size={20} />
              Admin
            </NavLink>
          )}
          <LoginButton 
            $isAuthenticated={isAuthenticated}
            onClick={isAuthenticated ? handleLogout : handleAdminClick}
          >
            {isAuthenticated ? (
              <>
                <LogOut size={20} />
                <UserInfo>Logout ({user?.username})</UserInfo>
              </>
            ) : (
              <>
                <Settings size={20} />
                Admin
              </>
            )}
          </LoginButton>
        </Nav>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;
