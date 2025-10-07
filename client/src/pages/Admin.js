import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Eye, 
  EyeOff,
  Settings,
  Cpu,
  Zap
} from 'lucide-react';

// Define keyframes at the top level
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 32px;
  padding: 20px 0;
`;

const PaginationButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  background: ${props => props.$active ? '#3b82f6' : 'white'};
  color: ${props => props.$active ? 'white' : '#64748b'};
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 40px;
  
  &:hover {
    background: ${props => props.$active ? '#3b82f6' : '#f1f5f9'};
    border-color: #3b82f6;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PaginationInfo = styled.div`
  font-size: 14px;
  color: #64748b;
  margin: 0 16px;
`;

const AdminContainer = styled.div`
  padding: 40px 0;
  min-height: 100vh;
  background: #f8fafc;
`;

const AdminHeader = styled.div`
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 20px 0;
  margin-bottom: 40px;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const AdminTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 12px;
`;


const AdminContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  background: white;
  padding: 8px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Tab = styled.button`
  padding: 12px 24px;
  border: none;
  background: ${props => props.$active ? '#3b82f6' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#64748b'};
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: ${props => props.$active ? '#3b82f6' : '#f1f5f9'};
  }
`;

const TabContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const LoginForm = styled.form`
  max-width: 400px;
  margin: 0 auto;
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  text-align: center;
  margin-bottom: 32px;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #2563eb;
  }
  
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const SearchAndFilterSection = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 16px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #94a3b8;
  }
`;

const FilterRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  min-width: 120px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const ResultsCount = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-left: auto;
`;

const ClearFiltersButton = styled.button`
  padding: 8px 16px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e2e8f0;
    color: #374151;
  }
`;

const BoardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const BoardCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  
  &:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const BoardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  overflow: hidden;
  
  & > span:first-child {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const PublishStatus = styled.span`
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 12px;
  background: ${props => props.published ? '#dcfce7' : '#fef3c7'};
  color: ${props => props.published ? '#166534' : '#92400e'};
  border: 1px solid ${props => props.published ? '#bbf7d0' : '#fde68a'};
`;

const BoardInfo = styled.div`
  color: #64748b;
  font-size: 14px;
  margin-bottom: 16px;
`;

const BoardActions = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 12px;
`;

const ActionButton = styled.button`
  padding: 6px 10px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
  
  &:hover {
    background: #f1f5f9;
  }
  
  &.edit {
    color: #3b82f6;
    border-color: #3b82f6;
    
    &:hover {
      background: #eff6ff;
    }
  }
  
  &.view {
    color: #10b981;
    border-color: #10b981;
    
    &:hover {
      background: #ecfdf5;
    }
  }
  
  &.delete {
    color: #ef4444;
    border-color: #ef4444;
    
    &:hover {
      background: #fef2f2;
    }
  }
  
  &.publish {
    color: #10b981;
    border-color: #10b981;
    
    &:hover {
      background: #ecfdf5;
    }
  }
  
  &.unpublish {
    color: #f59e0b;
    border-color: #f59e0b;
    
    &:hover {
      background: #fffbeb;
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      background: white;
    }
  }
`;

const UploadArea = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  background: #f9fafb;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    border-color: #3b82f6;
    background: #eff6ff;
  }
  
  &.dragover {
    border-color: #3b82f6;
    background: #eff6ff;
  }
`;

const UploadIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  color: #9ca3af;
`;

const UploadText = styled.div`
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 8px;
`;

const UploadSubtext = styled.div`
  font-size: 14px;
  color: #9ca3af;
`;

const FileInput = styled.input`
  display: none;
`;

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  
  &:hover {
    background: #f1f5f9;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const SuccessMessage = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #16a34a;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const BoardsLoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 3rem 2rem;
`;

const BoardsLoadingSpinner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`;

const SpinnerRing = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(45deg, #3b82f6, #8b5cf6);
  animation: pulse 2s ease-in-out infinite;
  
  &::before {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    right: 4px;
    bottom: 4px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    border: 3px solid #3b82f6;
    border-top: 3px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
  }
  
  @keyframes spin {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
  }
`;

const LoadingContent = styled.div`
  text-align: center;
  color: #4a5568;
`;

const LoadingTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #1e293b;
`;

const LoadingText = styled.p`
  font-size: 1rem;
  margin: 0 0 1rem 0;
  color: #64748b;
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  
  span {
    width: 8px;
    height: 8px;
    background: #3b82f6;
    border-radius: 50%;
    animation: bounce 1.4s ease-in-out infinite both;
    
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
    &:nth-child(3) { animation-delay: 0s; }
  }
  
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
`;

const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const SkeletonCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
`;

const SkeletonHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const SkeletonTitle = styled.div`
  height: 18px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 4px;
  width: 60%;
`;

const SkeletonBadge = styled.div`
  height: 16px;
  width: 60px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 12px;
`;

const SkeletonInfo = styled.div`
  height: 14px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 16px;
  width: 80%;
`;

const SkeletonActions = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 12px;
`;

const SkeletonButton = styled.div`
  height: 28px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 6px;
  flex: 1;
`;

const Admin = () => {
  const { isAuthenticated, token, login, logout, verifyToken } = useAuth();
  const [activeTab, setActiveTab] = useState('boards');
  const [boards, setBoards] = useState([]);
  const [filteredBoards, setFilteredBoards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [manufacturerFilter, setManufacturerFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [boardsLoading, setBoardsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBoards, setTotalBoards] = useState(0);
  const [pageSize] = useState(12); // Fixed page size for consistency
  
  // Cache state
  const [boardsCache, setBoardsCache] = useState(new Map());
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [loadingOperations, setLoadingOperations] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fritzingData, setFritzingData] = useState(null);
  const [pendingModalOpen, setPendingModalOpen] = useState(false);
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });

  const [boardForm, setBoardForm] = useState({
    name: '',
    description: '',
    manufacturer: '',
    package_type: '',
    voltage_range: '',
    clock_speed: '',
    flash_memory: '',
    ram: '',
    image_url: '',
    link: ''
  });

  useEffect(() => {
    if (token && isAuthenticated) {
      fetchBoards();
    }
  }, [token, isAuthenticated]);


  // Handle pending modal open after form is updated
  useEffect(() => {
    if (pendingModalOpen && fritzingData) {
      setShowModal(true);
      setPendingModalOpen(false);
    }
  }, [pendingModalOpen, fritzingData, boardForm]);


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await login(loginForm.username, loginForm.password);
      
      if (result.success) {
        fetchBoards();
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  // Debounced search function
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const fetchBoards = async () => {
    // Check cache first (cache for 60 seconds)
    const now = Date.now();
    if (boardsCache.has('all-boards') && (now - lastFetchTime) < 60000) {
      const cachedData = boardsCache.get('all-boards');
      setBoards(cachedData);
      setTotalBoards(cachedData.length);
      setBoardsLoading(false);
      return;
    }

    setBoardsLoading(true);
    setError(null);
    
    try {
      // Load all boards at once for fast client-side filtering
      const response = await fetch('/api/admin/boards', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Handle both array and paginated response formats
        const boardsData = Array.isArray(data) ? data : (data.boards || data.pinouts || []);
        
        setBoards(boardsData);
        setTotalBoards(boardsData.length);
        
        // Cache the result
        setBoardsCache(prev => new Map(prev).set('all-boards', boardsData));
        setLastFetchTime(now);
        setError(null);
      } else {
        setError('Failed to load boards');
      }
    } catch (error) {
      console.error('Failed to fetch boards:', error);
      setError('Failed to load boards. Please check your connection.');
    } finally {
      setBoardsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchBoards();
  }, []);

  // Refetch boards when switching to boards tab
  useEffect(() => {
    if (activeTab === 'boards' && isAuthenticated) {
      fetchBoards();
    }
  }, [activeTab, isAuthenticated]);

  // Client-side filtering with pagination
  useEffect(() => {
    let filtered = boards;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(board =>
        board.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        board.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        board.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(board => {
        switch (statusFilter) {
          case 'published':
            return board.published === 1;
          case 'draft':
            return board.published === 0;
          default:
            return true;
        }
      });
    }

    // Apply manufacturer filter
    if (manufacturerFilter !== 'all') {
      filtered = filtered.filter(board =>
        board.manufacturer?.toLowerCase().includes(manufacturerFilter.toLowerCase())
      );
    }

    // Calculate pagination
    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedBoards = filtered.slice(startIndex, endIndex);

    setFilteredBoards(paginatedBoards);
    setTotalPages(totalPages);
    setTotalBoards(totalFiltered);
  }, [boards, searchTerm, statusFilter, manufacturerFilter, currentPage, pageSize]);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, manufacturerFilter]);

  // Get unique manufacturers for filter dropdown
  const manufacturers = [...new Set(boards.map(board => board.manufacturer).filter(Boolean))];

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setManufacturerFilter('all');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileUpload = async (file) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('fritzingFile', file);

      const response = await fetch('/api/admin/upload-fritzing', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      

      if (response.ok) {
        setFritzingData(data.data);
        
        // Pre-fill form with extracted board metadata
        if (data.data.boardMetadata) {
          const metadata = data.data.boardMetadata;
          const newFormData = {
            name: metadata.title || '',
            description: metadata.description || '',
            manufacturer: metadata.manufacturer || '',
            package_type: metadata.package_type || '',
            voltage_range: metadata.voltage_range || '',
            clock_speed: metadata.clock_speed || '',
            flash_memory: metadata.flash_memory || '',
            ram: metadata.ram || '',
            image_url: ''
          };
          setBoardForm(newFormData);
        }
        
        setSuccess('Fritzing file parsed successfully!');
        setPendingModalOpen(true);
      } else {
        setError(data.error || 'Failed to parse Fritzing file');
      }
    } catch (error) {
      setError('Failed to upload file. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/boards/from-fritzing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          boardData: boardForm,
          fritzingData: fritzingData
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Board created successfully!');
        setShowModal(false);
        setBoardForm({
          name: '',
          description: '',
          manufacturer: '',
          package_type: '',
          voltage_range: '',
          clock_speed: '',
          flash_memory: '',
          ram: '',
          image_url: ''
        });
        setFritzingData(null);
        // Clear cache and refresh data
        setBoardsCache(new Map());
        await fetchBoards();
      } else {
        setError(data.error || 'Failed to create board');
      }
    } catch (error) {
      setError('Failed to create board. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBoard = async (boardId) => {
    if (!window.confirm('Are you sure you want to delete this board?')) {
      return;
    }

    // Prevent double-clicks
    if (loadingOperations.has(`delete-${boardId}`)) {
      return;
    }

    console.log('Deleting board:', boardId);
    
    // Add to loading operations
    setLoadingOperations(prev => new Set(prev).add(`delete-${boardId}`));
    
    // Store the board to be deleted for potential rollback
    const boardToDelete = boards.find(board => board.id === boardId);
    
    // Optimistically remove the board from the UI
    setBoards(prevBoards => prevBoards.filter(board => board.id !== boardId));

    try {
      const response = await fetch(`/api/admin/boards/${boardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Delete response status:', response.status);

      if (response.ok) {
        setSuccess('Board deleted successfully!');
        console.log('Board deleted successfully, refreshing data...');
        // Clear cache and refresh data to ensure consistency
        setBoardsCache(new Map());
        setLastFetchTime(0); // Force fresh fetch
        
        // Force a fresh fetch by calling the API directly
        try {
          const refreshResponse = await fetch('/api/admin/boards', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            const boardsData = Array.isArray(refreshData) ? refreshData : (refreshData.boards || refreshData.pinouts || []);
            console.log('Fresh data fetched:', boardsData.length, 'boards');
            setBoards(boardsData);
            setTotalBoards(boardsData.length);
            setBoardsCache(prev => new Map(prev).set('all-boards', boardsData));
            setLastFetchTime(Date.now());
          }
        } catch (refreshError) {
          console.error('Error refreshing data:', refreshError);
          await fetchBoards(); // Fallback to original method
        }
        
        console.log('Data refreshed after delete');
      } else {
        const errorData = await response.json();
        console.error('Delete failed:', errorData);
        setError('Failed to delete board');
        // Revert optimistic update on error
        if (boardToDelete) {
          setBoards(prevBoards => [...prevBoards, boardToDelete]);
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete board. Please try again.');
      // Revert optimistic update on error
      if (boardToDelete) {
        setBoards(prevBoards => [...prevBoards, boardToDelete]);
      }
    } finally {
      // Remove from loading operations
      setLoadingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(`delete-${boardId}`);
        return newSet;
      });
    }
  };

  const handleTogglePublish = async (boardId, published) => {
    // Prevent double-clicks
    if (loadingOperations.has(`publish-${boardId}`)) {
      return;
    }

    console.log('Toggle publish:', boardId, 'to', published);
    
    // Find the original board to get the current state
    const originalBoard = boards.find(board => board.id === boardId);
    if (!originalBoard) {
      console.error('Board not found:', boardId);
      return;
    }

    // Add to loading operations
    setLoadingOperations(prev => new Set(prev).add(`publish-${boardId}`));

    // Optimistically update the UI
    setBoards(prevBoards => 
      prevBoards.map(board => 
        board.id === boardId ? { ...board, published: published ? 1 : 0 } : board
      )
    );

    try {
      const response = await fetch(`/api/admin/boards/${boardId}/publish`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ published })
      });

      console.log('Publish response status:', response.status);

      if (response.ok) {
        setSuccess(`Board ${published ? 'published' : 'unpublished'} successfully!`);
        // Clear cache and refresh data to ensure consistency
        setBoardsCache(new Map());
        setLastFetchTime(0); // Force fresh fetch
        
        // Force a fresh fetch by calling the API directly
        try {
          const refreshResponse = await fetch('/api/admin/boards', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            const boardsData = Array.isArray(refreshData) ? refreshData : (refreshData.boards || refreshData.pinouts || []);
            console.log('Fresh data fetched after publish:', boardsData.length, 'boards');
            setBoards(boardsData);
            setTotalBoards(boardsData.length);
            setBoardsCache(prev => new Map(prev).set('all-boards', boardsData));
            setLastFetchTime(Date.now());
          }
        } catch (refreshError) {
          console.error('Error refreshing data after publish:', refreshError);
          await fetchBoards(); // Fallback to original method
        }
        
        console.log('Data refreshed after publish toggle');
      } else {
        const errorData = await response.json();
        console.error('Publish toggle failed:', errorData);
        setError(`Failed to ${published ? 'publish' : 'unpublish'} board`);
        // Revert optimistic update on error
        setBoards(prevBoards => 
          prevBoards.map(board => 
            board.id === boardId ? { ...board, published: originalBoard.published } : board
          )
        );
      }
    } catch (error) {
      console.error('Publish toggle error:', error);
      setError(`Failed to ${published ? 'publish' : 'unpublish'} board. Please try again.`);
      // Revert optimistic update on error
      setBoards(prevBoards => 
        prevBoards.map(board => 
          board.id === boardId ? { ...board, published: originalBoard.published } : board
        )
      );
    } finally {
      // Remove from loading operations
      setLoadingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(`publish-${boardId}`);
        return newSet;
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <AdminContainer>
        <div className="container">
          <LoginForm onSubmit={handleLogin}>
            <FormTitle>Admin Login</FormTitle>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
            
            <FormGroup>
              <Label>Username</Label>
              <Input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Password</Label>
              <Input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                required
              />
            </FormGroup>
            
            <Button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </LoginForm>
        </div>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <AdminHeader>
        <HeaderContent>
          <AdminTitle>
            <Settings size={32} />
            Admin Panel
          </AdminTitle>
        </HeaderContent>
      </AdminHeader>

      <AdminContent>
        {error && !boardsLoading && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <TabsContainer>
          <Tab 
            $active={activeTab === 'boards'} 
            onClick={() => {
              setActiveTab('boards');
              // Clear cache to ensure fresh data
              setBoardsCache(new Map());
            }}
          >
            <Cpu size={20} />
            Boards
          </Tab>
          <Tab 
            $active={activeTab === 'upload'} 
            onClick={() => setActiveTab('upload')}
          >
            <Upload size={20} />
            Upload FZPZ
          </Tab>
        </TabsContainer>

        {activeTab === 'boards' && (
          <TabContent>
            <SearchAndFilterSection>
              <SearchInput
                type="text"
                placeholder="Search boards by name, description, or manufacturer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FilterRow>
                <FilterGroup>
                  <FilterLabel>Status</FilterLabel>
                  <FilterSelect
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </FilterSelect>
                </FilterGroup>
                <FilterGroup>
                  <FilterLabel>Manufacturer</FilterLabel>
                  <FilterSelect
                    value={manufacturerFilter}
                    onChange={(e) => setManufacturerFilter(e.target.value)}
                  >
                    <option value="all">All Manufacturers</option>
                    {manufacturers.map(manufacturer => (
                      <option key={manufacturer} value={manufacturer}>
                        {manufacturer}
                      </option>
                    ))}
                  </FilterSelect>
                </FilterGroup>
                <ResultsCount>
                  {totalBoards} boards total
                  {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
                </ResultsCount>
                <ClearFiltersButton onClick={clearFilters}>
                  Clear Filters
                </ClearFiltersButton>
              </FilterRow>
            </SearchAndFilterSection>
            {boardsLoading ? (
              <BoardsLoadingContainer>
                <BoardsLoadingSpinner>
                  <SpinnerRing />
                  <LoadingContent>
                    <LoadingTitle>Loading Boards</LoadingTitle>
                    <LoadingText>Fetching data from database...</LoadingText>
                    <LoadingDots>
                      <span></span>
                      <span></span>
                      <span></span>
                    </LoadingDots>
                  </LoadingContent>
                </BoardsLoadingSpinner>
              </BoardsLoadingContainer>
            ) : filteredBoards.length > 0 ? (
              <BoardsGrid>
                {filteredBoards.map(board => (
                  <BoardCard key={board.id}>
                    <BoardTitle>
                      <span>{board.name}</span>
                      <PublishStatus published={board.published}>
                        {board.published ? 'Published' : 'Draft'}
                      </PublishStatus>
                    </BoardTitle>
                    <BoardInfo>
                      {board.pin_count} pins • {board.manufacturer} • {board.package_type}
                    </BoardInfo>
                    <BoardActions>
                      <ActionButton 
                        className="edit"
                        onClick={() => navigate(`/admin/boards/${board.slug || board.id}/edit`)}
                      >
                        <Edit size={16} />
                        Edit
                      </ActionButton>
                      <ActionButton 
                        className="view"
                        onClick={() => navigate(`/board/${board.slug || board.id}`)}
                      >
                        <Eye size={16} />
                        View
                      </ActionButton>
                      <ActionButton 
                        className={board.published ? "unpublish" : "publish"}
                        onClick={() => handleTogglePublish(board.id, !board.published)}
                        disabled={loadingOperations.has(`publish-${board.id}`)}
                      >
                        {board.published ? <EyeOff size={16} /> : <Eye size={16} />}
                        {loadingOperations.has(`publish-${board.id}`) ? 'Updating...' : (board.published ? 'Unpublish' : 'Publish')}
                      </ActionButton>
                      <ActionButton 
                        className="delete"
                        onClick={() => handleDeleteBoard(board.id)}
                        disabled={loadingOperations.has(`delete-${board.id}`)}
                      >
                        <Trash2 size={16} />
                        {loadingOperations.has(`delete-${board.id}`) ? 'Deleting...' : 'Delete'}
                      </ActionButton>
                    </BoardActions>
                  </BoardCard>
                ))}
              </BoardsGrid>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <h3 style={{ color: '#64748b', marginBottom: '16px' }}>No boards found</h3>
                <p style={{ color: '#94a3b8' }}>
                  {searchTerm || statusFilter !== 'all' || manufacturerFilter !== 'all'
                    ? 'Try adjusting your search term or filters to find what you\'re looking for.'
                    : 'No boards have been uploaded yet. Use the Upload FZPZ tab to add some boards.'
                  }
                </p>
              </div>
            )}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <PaginationContainer>
                <PaginationButton
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ←
                </PaginationButton>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <PaginationButton
                      key={pageNum}
                      $active={currentPage === pageNum}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </PaginationButton>
                  );
                })}
                
                <PaginationButton
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  →
                </PaginationButton>
                
                <PaginationInfo>
                  Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalBoards)} of {totalBoards}
                </PaginationInfo>
              </PaginationContainer>
            )}
          </TabContent>
        )}

        {activeTab === 'upload' && (
          <TabContent>
            <UploadArea
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <UploadIcon>
                <Upload size={48} />
              </UploadIcon>
              <UploadText>Drop Fritzing .fzpz file here or click to browse</UploadText>
              <UploadSubtext>Supports .fzpz files up to 10MB</UploadSubtext>
              <FileInput
                id="fileInput"
                type="file"
                accept=".fzpz"
                onChange={handleFileSelect}
              />
            </UploadArea>
            
          </TabContent>
        )}

        <AnimatePresence>
          {showModal && fritzingData && (
            <Modal
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ModalContent>
                <ModalHeader>
                  <ModalTitle>Create Board from Fritzing Data</ModalTitle>
                  <CloseButton onClick={() => setShowModal(false)}>
                    <X size={24} />
                  </CloseButton>
                </ModalHeader>

                <form onSubmit={handleCreateBoard}>
                  <FormGrid>
                    <FormGroup>
                      <Label>Board Name *</Label>
                      <Input
                        type="text"
                        value={boardForm.name}
                        onChange={(e) => setBoardForm({...boardForm, name: e.target.value})}
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Manufacturer</Label>
                      <Input
                        type="text"
                        value={boardForm.manufacturer}
                        onChange={(e) => setBoardForm({...boardForm, manufacturer: e.target.value})}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Package Type</Label>
                      <Input
                        type="text"
                        value={boardForm.package_type}
                        onChange={(e) => setBoardForm({...boardForm, package_type: e.target.value})}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Voltage Range</Label>
                      <Input
                        type="text"
                        value={boardForm.voltage_range}
                        onChange={(e) => setBoardForm({...boardForm, voltage_range: e.target.value})}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Clock Speed</Label>
                      <Input
                        type="text"
                        value={boardForm.clock_speed}
                        onChange={(e) => setBoardForm({...boardForm, clock_speed: e.target.value})}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Flash Memory</Label>
                      <Input
                        type="text"
                        value={boardForm.flash_memory}
                        onChange={(e) => setBoardForm({...boardForm, flash_memory: e.target.value})}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>RAM</Label>
                      <Input
                        type="text"
                        value={boardForm.ram}
                        onChange={(e) => setBoardForm({...boardForm, ram: e.target.value})}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Image URL</Label>
                      <Input
                        type="url"
                        value={boardForm.image_url}
                        onChange={(e) => setBoardForm({...boardForm, image_url: e.target.value})}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Link</Label>
                      <Input
                        type="url"
                        value={boardForm.link}
                        onChange={(e) => setBoardForm({...boardForm, link: e.target.value})}
                        placeholder="https://example.com/board-documentation"
                      />
                    </FormGroup>
                  </FormGrid>

                  <FormGroup>
                    <Label>Description</Label>
                    <TextArea
                      value={boardForm.description}
                      onChange={(e) => setBoardForm({...boardForm, description: e.target.value})}
                      placeholder="Describe the board..."
                    />
                  </FormGroup>

                  <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <Button 
                      type="button" 
                      onClick={() => setShowModal(false)}
                      style={{ background: '#6b7280' }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Creating...' : 'Create Board'}
                    </Button>
                  </div>
                </form>
              </ModalContent>
            </Modal>
          )}
        </AnimatePresence>
      </AdminContent>
    </AdminContainer>
  );
};

export default Admin;
