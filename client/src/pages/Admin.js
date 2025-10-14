import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Zap,
  Link,
  FileText,
  Globe
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

const WiringGuideContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const WiringStep = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
`;

const StepTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BoardSelector = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SelectorGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SelectorLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const BoardSelect = styled.select`
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const ConnectionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  align-items: center;
  margin-top: 24px;
`;

const PinSelector = styled.select`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const ConnectionArrow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 18px;
`;

const ConnectionRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
  
  &:last-child {
    border-bottom: none;
  }
`;

const AddConnectionButton = styled.button`
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 16px;
  
  &:hover {
    background: #2563eb;
  }
`;

const RemoveConnectionButton = styled.button`
  padding: 4px 8px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #dc2626;
  }
`;

const GenerateButton = styled.button`
  padding: 12px 24px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 24px;
  
  &:hover {
    background: #059669;
  }
  
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const WiringGuideContent = () => {
  const [viewMode, setViewMode] = useState('create'); // 'create' or 'manage'
  
  // Creation state
  const [sensorBoards, setSensorBoards] = useState([]);
  const [microcontrollerBoards, setMicrocontrollerBoards] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState('');
  const [selectedMicrocontroller, setSelectedMicrocontroller] = useState('');
  const [sensorPins, setSensorPins] = useState([]);
  const [microcontrollerPins, setMicrocontrollerPins] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatedSVG, setGeneratedSVG] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [description, setDescription] = useState('');
  const [currentWiringGuide, setCurrentWiringGuide] = useState(null);
 // 0, 90, 180, 270 degrees
  
  // Management state
  const [wiringGuides, setWiringGuides] = useState([]);
  const [manageLoading, setManageLoading] = useState(true);
  const [manageError, setManageError] = useState(null);
  const [editingGuide, setEditingGuide] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  
  // Pan/Zoom state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Fetch sensor boards
      const { adminBoardsAPI } = await import('../services/adminApi');
      const sensorResponse = await adminBoardsAPI.getByCategory('sensor-module');
      const microcontrollerResponse = await adminBoardsAPI.getByCategory('microcontroller-8bit,microcontroller-16bit,microcontroller-32bit,development-board');
      
      if (sensorResponse.status === 200 && microcontrollerResponse.status === 200) {
        const sensors = sensorResponse.data;
        const microcontrollers = microcontrollerResponse.data;
        
        setSensorBoards(sensors);
        setMicrocontrollerBoards(microcontrollers);
      } else {
        // Fallback to old method if new API fails
        const response = await adminBoardsAPI.getAll();
        
        if (response.status === 200) {
          const boards = response.data;
          
          // Filter boards by category field or fallback to name-based heuristics
          const sensors = boards.filter(board => 
            board.category === 'sensor-module' ||
            board.name.toLowerCase().includes('sensor') || 
            board.name.toLowerCase().includes('module') ||
            board.name.toLowerCase().includes('shield')
          );
          
          const microcontrollers = boards.filter(board => 
            ['microcontroller-8bit', 'microcontroller-16bit', 'microcontroller-32bit', 'development-board'].includes(board.category) ||
            board.name.toLowerCase().includes('arduino') ||
            board.name.toLowerCase().includes('esp') ||
            board.name.toLowerCase().includes('raspberry') ||
            board.name.toLowerCase().includes('microcontroller') ||
            board.name.toLowerCase().includes('board')
          );
          
          setSensorBoards(sensors);
          setMicrocontrollerBoards(microcontrollers);
        }
      }
    } catch (error) {
      console.error('Failed to fetch boards:', error);
    }
  };

  const fetchPins = async (boardId, type) => {
    try {
      const response = await fetch(`/api-php/admin/boards/${boardId}/pins`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const pins = await response.json();
        if (type === 'sensor') {
          setSensorPins(pins);
        } else {
          setMicrocontrollerPins(pins);
        }
      }
    } catch (error) {
      console.error('Failed to fetch pins:', error);
    }
  };

  const handleSensorChange = (e) => {
    const boardId = e.target.value;
    setSelectedSensor(boardId);
    if (boardId) {
      fetchPins(boardId, 'sensor');
    } else {
      setSensorPins([]);
    }
    setConnections([]);
  };

  const handleMicrocontrollerChange = (e) => {
    const boardId = e.target.value;
    setSelectedMicrocontroller(boardId);
    if (boardId) {
      fetchPins(boardId, 'microcontroller');
    } else {
      setMicrocontrollerPins([]);
    }
    setConnections([]);
  };

  const addConnection = () => {
    setConnections([...connections, { sensorPin: '', microcontrollerPin: '' }]);
  };

  const removeConnection = (index) => {
    setConnections(connections.filter((_, i) => i !== index));
  };

  const updateConnection = (index, field, value) => {
    const updated = [...connections];
    updated[index][field] = value;
    setConnections(updated);
  };

  const generatePreview = async () => {
    if (!selectedSensor || !selectedMicrocontroller || connections.length === 0) {
      alert('Please select both boards and add at least one connection');
      return;
    }

    setLoading(true);
    try {
      const { adminWiringGuideAPI } = await import('../services/adminApi');
      const response = await adminWiringGuideAPI.preview({
        sensorBoardId: selectedSensor,
        microcontrollerBoardId: selectedMicrocontroller,
        connections: connections,
      });

      const result = response.data;
      setGeneratedSVG(result.data.svgContent);
      setCurrentWiringGuide(null); // No database record yet
      setShowPreview(true);
      // Reset pan/zoom when new SVG is generated
      setZoomLevel(1);
      setPanX(0);
      setPanY(0);
    } catch (error) {
      console.error('Error generating preview:', error);
      alert('Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  const saveAsDraft = async () => {
    if (!selectedSensor || !selectedMicrocontroller || connections.length === 0) {
      alert('Please select both boards and add at least one connection');
      return;
    }

    setLoading(true);
    try {
      const { adminWiringGuideAPI } = await import('../services/adminApi');
      const response = await adminWiringGuideAPI.generate({
        sensorBoardId: selectedSensor,
        microcontrollerBoardId: selectedMicrocontroller,
        connections: connections,
        description: description,
      });

      const result = response.data;
      setCurrentWiringGuide({
        id: result.data.wiringGuideId,
        published: false,
        slug: result.data.slug,
        description: description
      });
      alert('Wiring guide saved as draft successfully!');
      // Refresh the wiring guides list
      fetchWiringGuides();
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save as draft');
    } finally {
      setLoading(false);
    }
  };

  const publishWiringGuide = async () => {
    if (!selectedSensor || !selectedMicrocontroller || connections.length === 0) {
      alert('Please select both boards and add at least one connection');
      return;
    }

    setLoading(true);
    try {
      const { adminWiringGuideAPI } = await import('../services/adminApi');
      const response = await adminWiringGuideAPI.generate({
        sensorBoardId: selectedSensor,
        microcontrollerBoardId: selectedMicrocontroller,
        connections: connections,
        description: description,
      });

      const result = response.data;
      setCurrentWiringGuide({
        id: result.data.wiringGuideId,
        published: true,
        slug: result.data.slug,
        description: description
      });
      
      // Publish the guide
      const publishResponse = await fetch(`/api-php/admin/wiring-guide/${result.data.wiringGuideId}/publish`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ published: true })
      });

      if (publishResponse.ok) {
        alert('Wiring guide published successfully!');
        // Refresh the wiring guides list
        fetchWiringGuides();
      } else {
        alert('Failed to publish wiring guide');
      }
    } catch (error) {
      console.error('Error publishing wiring guide:', error);
      alert('Failed to publish wiring guide');
    } finally {
      setLoading(false);
    }
  };

  const togglePublishStatus = async (publish) => {
    if (!currentWiringGuide) return;

    setLoading(true);
    try {
      const response = await fetch(`/api-php/admin/wiring-guide/${currentWiringGuide.id}/publish`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ published: publish })
      });

      if (response.ok) {
        setCurrentWiringGuide(prev => ({ ...prev, published: publish }));
        alert(publish ? 'Wiring guide published successfully!' : 'Wiring guide unpublished successfully!');
        // Refresh the wiring guides list
        fetchWiringGuides();
      } else {
        alert(`Failed to ${publish ? 'publish' : 'unpublish'} wiring guide`);
      }
    } catch (error) {
      console.error(`Error ${publish ? 'publishing' : 'unpublishing'} wiring guide:`, error);
      alert(`Failed to ${publish ? 'publish' : 'unpublish'} wiring guide`);
    } finally {
      setLoading(false);
    }
  };

  // Pan/Zoom functions
  const zoomWiringGuide = (factor) => {
    setZoomLevel(prev => Math.max(0.1, Math.min(5, prev * factor)));
  };

  const resetWiringGuideZoom = () => {
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPanX(e.clientX - dragStart.x);
      setPanY(e.clientY - dragStart.y);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    zoomWiringGuide(delta);
  };


  // Management functions
  const fetchWiringGuides = async () => {
    try {
      setManageLoading(true);
      const { adminWiringGuidesAPI } = await import('../services/adminApi');
      const response = await adminWiringGuidesAPI.getAll();
      
      if (response.status === 200) {
        const data = response.data;
        setWiringGuides(data);
        setManageError(null);
      } else {
        setManageError('Failed to load wiring guides');
      }
    } catch (err) {
      console.error('Error fetching wiring guides:', err);
      setManageError('Failed to load wiring guides');
    } finally {
      setManageLoading(false);
    }
  };

  const togglePublish = async (id, currentStatus) => {
    try {
      const response = await fetch(`/api-php/admin/wiring-guide/${id}/publish`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ published: !currentStatus })
      });

      if (response.ok) {
        setWiringGuides(prev => 
          prev.map(guide => 
            guide.id === id ? { ...guide, published: !currentStatus } : guide
          )
        );
      } else {
        alert('Failed to update wiring guide status');
      }
    } catch (error) {
      console.error('Error updating wiring guide:', error);
      alert('Failed to update wiring guide status');
    }
  };

  const deleteWiringGuide = async (id) => {
    if (!window.confirm('Are you sure you want to delete this wiring guide?')) return;
    
    try {
      const response = await fetch(`/api-php/admin/wiring-guide/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        setWiringGuides(prev => prev.filter(guide => guide.id !== id));
        alert('Wiring guide deleted successfully');
      } else {
        alert('Failed to delete wiring guide');
      }
    } catch (error) {
      console.error('Error deleting wiring guide:', error);
      alert('Failed to delete wiring guide');
    }
  };

  const openEditModal = async (guide) => {
    setEditingGuide(guide);
    setEditDescription(guide.description || '');
    
    // Fetch board names if not already present
    if (!guide.sensor_name || !guide.microcontroller_name) {
      try {
        const sensorResponse = await fetch(`/api-php/boards/${guide.sensor_board_id}`);
        const microResponse = await fetch(`/api-php/boards/${guide.microcontroller_board_id}`);
        
        if (sensorResponse.ok && microResponse.ok) {
          const sensorData = await sensorResponse.json();
          const microData = await microResponse.json();
          
          setEditingGuide({
            ...guide,
            sensor_name: sensorData.name,
            microcontroller_name: microData.name
          });
        }
      } catch (error) {
        console.error('Error fetching board names:', error);
      }
    }
  };

  const closeEditModal = () => {
    setEditingGuide(null);
    setEditDescription('');
  };

  const saveEdit = async () => {
    if (!editingGuide) return;
    
    setEditLoading(true);
    try {
      const response = await fetch(`/api-php/admin/wiring-guide/${editingGuide.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ description: editDescription })
      });

      if (response.ok) {
        setWiringGuides(prev => 
          prev.map(guide => 
            guide.id === editingGuide.id ? { ...guide, description: editDescription } : guide
          )
        );
        closeEditModal();
        alert('Wiring guide updated successfully');
      } else {
        alert('Failed to update wiring guide');
      }
    } catch (error) {
      console.error('Error updating wiring guide:', error);
      alert('Failed to update wiring guide');
    } finally {
      setEditLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Load wiring guides when switching to manage mode
  useEffect(() => {
    if (viewMode === 'manage') {
      fetchWiringGuides();
    }
  }, [viewMode]);

  return (
    <WiringGuideContainer>
      {/* Header with mode toggle */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>Wiring Guide</h2>
          <p style={{ margin: '0', color: '#6b7280' }}>
            {viewMode === 'create' ? 'Create new wiring guides and manage connections' : 'Manage existing wiring guides'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setViewMode('create')}
            style={{
              padding: '8px 16px',
              background: viewMode === 'create' ? '#3b82f6' : '#f3f4f6',
              color: viewMode === 'create' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Link size={16} />
            Create
          </button>
          <button
            onClick={() => setViewMode('manage')}
            style={{
              padding: '8px 16px',
              background: viewMode === 'manage' ? '#3b82f6' : '#f3f4f6',
              color: viewMode === 'manage' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileText size={16} />
            Manage
          </button>
        </div>
      </div>

      {viewMode === 'create' ? (
        <>
          <WiringStep>
            <StepTitle>
              <Link size={20} />
              Step 1: Select Boards
            </StepTitle>
            <BoardSelector>
              <SelectorGroup>
                <SelectorLabel>Sensor Board</SelectorLabel>
                <BoardSelect value={selectedSensor} onChange={handleSensorChange}>
                  <option value="">Select a sensor board...</option>
                  {sensorBoards.map(board => (
                    <option key={board.id} value={board.id}>
                      {board.name} ({board.manufacturer})
                    </option>
                  ))}
                </BoardSelect>
              </SelectorGroup>
              
              <SelectorGroup>
                <SelectorLabel>Microcontroller Board</SelectorLabel>
                <BoardSelect value={selectedMicrocontroller} onChange={handleMicrocontrollerChange}>
                  <option value="">Select a microcontroller board...</option>
                  {microcontrollerBoards.map(board => (
                    <option key={board.id} value={board.id}>
                      {board.name} ({board.manufacturer})
                    </option>
                  ))}
                </BoardSelect>
              </SelectorGroup>
            </BoardSelector>
          </WiringStep>

          {selectedSensor && selectedMicrocontroller && (
            <WiringStep>
              <StepTitle>
                <Link size={20} />
                Step 2: Connect Pins
              </StepTitle>
              
              {connections.map((connection, index) => (
                <ConnectionRow key={index}>
                  <PinSelector
                    value={connection.sensorPin}
                    onChange={(e) => updateConnection(index, 'sensorPin', e.target.value)}
                  >
                    <option value="">Select sensor pin...</option>
                    {sensorPins.map(pin => (
                      <option key={pin.id} value={pin.id}>
                        {pin.pin_name} ({pin.pin_number})
                      </option>
                    ))}
                  </PinSelector>
                  
                  <ConnectionArrow>→</ConnectionArrow>
                  
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <PinSelector
                      value={connection.microcontrollerPin}
                      onChange={(e) => updateConnection(index, 'microcontrollerPin', e.target.value)}
                    >
                      <option value="">Select microcontroller pin...</option>
                      {microcontrollerPins.map(pin => (
                        <option key={pin.id} value={pin.id}>
                          {pin.pin_name} ({pin.pin_number})
                        </option>
                      ))}
                    </PinSelector>
                    
                    <RemoveConnectionButton onClick={() => removeConnection(index)}>
                      ×
                    </RemoveConnectionButton>
                  </div>
                </ConnectionRow>
              ))}
              
              <AddConnectionButton onClick={addConnection}>
                + Add Connection
              </AddConnectionButton>
            </WiringStep>
          )}

          {connections.length > 0 && (
            <WiringStep>
              <StepTitle>
                <Link size={20} />
                Step 3: Generate Wiring Guide
              </StepTitle>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Description (optional):
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a description for this wiring guide..."
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '8px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <GenerateButton onClick={generatePreview} disabled={loading}>
                  {loading ? 'Generating...' : 'Generate Preview'}
                </GenerateButton>
              </div>
            </WiringStep>
          )}

          {showPreview && generatedSVG && (
            <WiringStep>
              <StepTitle>
                <Link size={20} />
                Wiring Guide Preview
                {currentWiringGuide && (
                  <span style={{ 
                    marginLeft: '12px', 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px', 
                    fontWeight: 'bold',
                    background: currentWiringGuide.published ? '#10b981' : '#f59e0b',
                    color: 'white'
                  }}>
                    {currentWiringGuide.published ? 'PUBLISHED' : 'DRAFT'}
                  </span>
                )}
              </StepTitle>
              <div style={{ 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px', 
                padding: '16px', 
                background: 'white',
                overflow: 'hidden',
                maxHeight: '800px',
                position: 'relative'
              }}>
                <div 
                  id="wiring-guide-svg-container"
                  style={{ 
                    width: '100%', 
                    minHeight: '400px',
                    maxHeight: '600px',
                    height: 'auto',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onWheel={handleWheel}
                >
                  <div
                    style={{
                      transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`,
                      transformOrigin: 'center center',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                    dangerouslySetInnerHTML={{ __html: generatedSVG }} 
                  />
                </div>
                
                {/* Pan/Zoom Controls */}
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  zIndex: 10
                }}>
                  {/* Zoom Level Indicator */}
                  <div style={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    minWidth: '60px'
                  }}>
                    {Math.round(zoomLevel * 100)}%
                  </div>
                  <button
                    onClick={() => zoomWiringGuide(1.2)}
                    style={{
                      width: '40px',
                      height: '40px',
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    title="Zoom In"
                  >
                    +
                  </button>
                  <button
                    onClick={() => zoomWiringGuide(0.8)}
                    style={{
                      width: '40px',
                      height: '40px',
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    title="Zoom Out"
                  >
                    −
                  </button>
                  <button
                    onClick={() => resetWiringGuideZoom()}
                    style={{
                      width: '40px',
                      height: '40px',
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    title="Reset Zoom"
                  >
                    ⌂
                  </button>
                </div>
              </div>
              <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {/* Show Save as Draft and Publish buttons when there's only a preview (no currentWiringGuide) */}
                {!currentWiringGuide && (
                  <>
                    <button 
                      onClick={saveAsDraft}
                      disabled={loading}
                      style={{
                        padding: '8px 16px',
                        background: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1
                      }}
                    >
                      💾 Save as Draft
                    </button>
                    <button 
                      onClick={publishWiringGuide}
                      disabled={loading}
                      style={{
                        padding: '8px 16px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1
                      }}
                    >
                      📢 Publish
                    </button>
                  </>
                )}
                {/* Show existing buttons when there's a currentWiringGuide */}
                {currentWiringGuide && !currentWiringGuide.published && (
                  <button 
                    onClick={() => togglePublishStatus(true)}
                    style={{
                      padding: '8px 16px',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    📢 Publish
                  </button>
                )}
                {currentWiringGuide && (
                  <button 
                    onClick={() => saveAsDraft()}
                    style={{
                      padding: '8px 16px',
                      background: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    💾 Save as Draft
                  </button>
                )}
                {currentWiringGuide && currentWiringGuide.published && (
                  <button 
                    onClick={() => togglePublishStatus(false)}
                    style={{
                      padding: '8px 16px',
                      background: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    📝 Unpublish
                  </button>
                )}
                {currentWiringGuide && currentWiringGuide.published && (
                  <button 
                    onClick={() => window.open(`/micropinouts/wiring-guide/${currentWiringGuide.slug}`, '_blank')}
                    style={{
                      padding: '8px 16px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    👁️ View Public
                  </button>
                )}
                <button 
                  onClick={() => setShowPreview(false)}
                  style={{
                    padding: '8px 16px',
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Close Preview
                </button>
              </div>
            </WiringStep>
          )}
        </>
      ) : (
        // Management view
        <>
          {manageLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading wiring guides...</div>
            </div>
          ) : manageError ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '18px', color: '#dc2626' }}>{manageError}</div>
              <button 
                onClick={fetchWiringGuides}
                style={{
                  marginTop: '16px',
                  padding: '8px 16px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Retry
              </button>
            </div>
          ) : wiringGuides.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <FileText size={48} style={{ color: '#9ca3af', marginBottom: '16px' }} />
              <h3 style={{ margin: '0 0 8px 0', color: '#6b7280' }}>No wiring guides found</h3>
              <p style={{ margin: '0', color: '#9ca3af' }}>Create your first wiring guide using the "Create" tab.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {wiringGuides.map((guide) => (
                <div
                  key={guide.id}
                  style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h3 style={{ margin: '0', color: '#1f2937', fontSize: '16px' }}>
                        {guide.sensor_name} → {guide.microcontroller_name}
                      </h3>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        background: '#6b7280',
                        color: 'white'
                      }}>
                        ID: {guide.id}
                      </span>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        background: guide.published ? '#10b981' : '#f59e0b',
                        color: 'white'
                      }}>
                        {guide.published ? 'PUBLISHED' : 'DRAFT'}
                      </span>
                    </div>
                    {guide.description && (
                      <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>
                        {guide.description}
                      </p>
                    )}
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                      Created: {formatDate(guide.created_at)}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      onClick={() => openEditModal(guide)}
                      style={{
                        padding: '6px 12px',
                        background: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    
                    <button
                      onClick={() => togglePublish(guide.id, guide.published)}
                      style={{
                        padding: '6px 12px',
                        background: guide.published ? '#f59e0b' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {guide.published ? <EyeOff size={14} /> : <Globe size={14} />}
                      {guide.published ? 'Unpublish' : 'Publish'}
                    </button>
                    
                    {!!guide.published && (
                      <button
                        onClick={() => window.open(`/micropinouts/wiring-guide/${guide.slug}`, '_blank')}
                        style={{
                          padding: '6px 12px',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Eye size={14} />
                        View
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteWiringGuide(guide.id)}
                      style={{
                        padding: '6px 12px',
                        background: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {editingGuide && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '24px',
            width: '500px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: 0, color: '#1f2937' }}>
                Edit Wiring Guide
              </h3>
              <button
                onClick={closeEditModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Wiring Guide
              </label>
              <div style={{
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '6px',
                color: '#6b7280',
                fontSize: '14px'
              }}>
                {editingGuide.sensor_name || `Sensor Board ID: ${editingGuide.sensor_board_id}`} → {editingGuide.microcontroller_name || `Microcontroller Board ID: ${editingGuide.microcontroller_board_id}`}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Description
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Enter a description for this wiring guide..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={closeEditModal}
                disabled={editLoading}
                style={{
                  padding: '8px 16px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: editLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={editLoading}
                style={{
                  padding: '8px 16px',
                  background: editLoading ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: editLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {editLoading && <div style={{
                  width: '12px',
                  height: '12px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />}
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </WiringGuideContainer>
  );
};


const Admin = () => {
  console.log('🔍 Admin component loaded - debugging is working!');
  const { isAuthenticated, token, login, logout, verifyToken } = useAuth();
  const location = useLocation();
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

  // Debug modal state changes
  useEffect(() => {
    console.log('🔍 showModal state changed:', showModal);
  }, [showModal]);
  const [editingBoard, setEditingBoard] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fritzingData, setFritzingData] = useState(null);
  const [pendingModalOpen, setPendingModalOpen] = useState(false);
  const navigate = useNavigate();

  // Handle URL parameters to set active tab
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    if (tab === 'wiring') {
      setActiveTab('wiring');
    }
  }, [location.search]);

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
    link: '',
    category: ''
  });

  // Debug boardForm changes
  useEffect(() => {
    console.log('🔍 boardForm state changed:', boardForm);
  }, [boardForm]);

  useEffect(() => {
    if (token && isAuthenticated) {
      fetchBoards();
    }
  }, [token, isAuthenticated]);


  // Handle pending modal open after form is updated
  useEffect(() => {
    console.log('🔍 Modal useEffect triggered - pendingModalOpen:', pendingModalOpen, 'fritzingData:', !!fritzingData);
    if (pendingModalOpen && fritzingData) {
      console.log('🔍 Opening modal with fritzingData:', fritzingData);
      console.log('🔍 Current boardForm state:', boardForm);
      setShowModal(true);
      setPendingModalOpen(false);
    }
  }, [pendingModalOpen, fritzingData]);


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
      const { adminBoardsAPI } = await import('../services/adminApi');
      const response = await adminBoardsAPI.getAll();

      const data = response.data;
      
      // Handle both array and paginated response formats
      const boardsData = Array.isArray(data) ? data : (data.boards || data.pinouts || []);
      
      setBoards(boardsData);
      setTotalBoards(boardsData.length);
      
      // Cache the result
      setBoardsCache(prev => new Map(prev).set('all-boards', boardsData));
      setLastFetchTime(now);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch boards:', error);
      setError('Failed to load boards. Please check your connection.');
    } finally {
      setBoardsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      fetchBoards();
    }
  }, [isAuthenticated]);

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
    console.log('🔍 handleFileUpload called with file:', file.name);
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('fritzingFile', file);

      console.log('🔍 Sending request to upload API...');
      const { adminUploadAPI } = await import('../services/adminApi');
      const response = await adminUploadAPI.uploadFritzing(formData);

      console.log('🔍 API response received:', response);
      const data = response.data;
      console.log('🔍 Response data structure:', data);
      console.log('🔍 Looking for boardMetadata in:', data.data);

      if (response.status === 200) {
        setFritzingData(data.data);
        
        // Pre-fill form with extracted board metadata
        if (data.data && data.data.data && data.data.data.boardMetadata) {
          const metadata = data.data.data.boardMetadata;
          console.log('🔍 Board metadata received:', metadata);
          
          // Clean up HTML from description
          const cleanDescription = metadata.description 
            ? metadata.description.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').trim()
            : '';
          
          const newFormData = {
            name: metadata.title || '',
            description: cleanDescription,
            manufacturer: metadata.manufacturer || '',
            package_type: metadata.package_type || '',
            voltage_range: metadata.voltage_range || '',
            clock_speed: metadata.clock_speed || '',
            flash_memory: metadata.flash_memory || '',
            ram: metadata.ram || '',
            image_url: ''
          };
          
          console.log('🔍 Setting form data:', newFormData);
          setBoardForm(newFormData);
          
          // Verify the form was set immediately
          console.log('🔍 Form data being set to:', newFormData);
        } else {
          console.log('❌ No boardMetadata found in response');
        }
        
        setSuccess('Fritzing file parsed successfully!');
        console.log('🔍 Setting pendingModalOpen to true');
        setPendingModalOpen(true);
      } else {
        setError(data.error || 'Failed to parse Fritzing file');
      }
    } catch (error) {
      console.error('🔍 Upload error:', error);
      console.error('🔍 Error response:', error.response);
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
      const { adminBoardsAPI } = await import('../services/adminApi');
      const response = await adminBoardsAPI.createFromFritzing(boardForm, fritzingData);

      const data = response.data;

      if (response.status === 200) {
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
          image_url: '',
          link: '',
          category: ''
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
      const { adminBoardsAPI } = await import('../services/adminApi');
      const response = await adminBoardsAPI.delete(boardId);

      console.log('Delete response status:', response.status);

      if (response.status === 200) {
        setSuccess('Board deleted successfully!');
        console.log('Board deleted successfully, refreshing data...');
        // Clear cache and refresh data to ensure consistency
        setBoardsCache(new Map());
        setLastFetchTime(0); // Force fresh fetch
        
        // Force a fresh fetch by calling the API directly
        try {
          const { adminBoardsAPI } = await import('../services/adminApi');
          const refreshResponse = await adminBoardsAPI.getAll();
          
          if (refreshResponse.status === 200) {
            const refreshData = refreshResponse.data;
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
        console.error('Delete failed:', response.data);
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
      const { adminBoardsAPI } = await import('../services/adminApi');
      const response = await adminBoardsAPI.publish(boardId, published);

      console.log('Publish response status:', response.status);

      if (response.status === 200) {
        setSuccess(`Board ${published ? 'published' : 'unpublished'} successfully!`);
        // Clear cache and refresh data to ensure consistency
        setBoardsCache(new Map());
        setLastFetchTime(0); // Force fresh fetch
        
        // Force a fresh fetch by calling the API directly
        try {
          const { adminBoardsAPI } = await import('../services/adminApi');
          const refreshResponse = await adminBoardsAPI.getAll();
          
          if (refreshResponse.status === 200) {
            const refreshData = refreshResponse.data;
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
          <Tab 
            $active={activeTab === 'wiring'} 
            onClick={() => setActiveTab('wiring')}
          >
            <Link size={20} />
            Wiring Guide
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

        {activeTab === 'wiring' && (
          <TabContent>
            <WiringGuideContent />
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

                    <FormGroup>
                      <Label>Category</Label>
                      <select
                        value={boardForm.category}
                        onChange={(e) => setBoardForm({...boardForm, category: e.target.value})}
                        style={{
                          padding: '12px 16px',
                          border: '2px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '16px',
                          background: 'white',
                          width: '100%'
                        }}
                      >
                        <option value="">Select a category...</option>
                        <option value="microcontroller-8bit">🔧 Microcontroller (8-bit)</option>
                        <option value="microcontroller-16bit">⚙️ Microcontroller (16-bit)</option>
                        <option value="microcontroller-32bit">🔩 Microcontroller (32-bit)</option>
                        <option value="development-board">📱 Development Board</option>
                        <option value="sensor-module">📡 Sensor & Module</option>
                        <option value="communication-ic">📶 Communication IC</option>
                        <option value="power-management">⚡ Power Management</option>
                        <option value="memory-storage">💾 Memory & Storage</option>
                        <option value="custom-other">🔧 Custom/Other</option>
                      </select>
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
