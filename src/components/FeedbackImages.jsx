import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaChevronLeft, FaChevronRight, FaTimes, FaSearchPlus, FaSearchMinus } from 'react-icons/fa';

const FeedbackImages = ({ influencer, onClose, isOpen }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  // 함수들 먼저 선언
  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const zoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3)); 
  };

  const zoomOut = () => {
    setZoom(prev => {
      const newZoom = Math.max(prev - 0.25, 0.5); 
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 }); 
      }
      return newZoom;
    });
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(0);
      resetZoom();
    }
  }, [isOpen]);

  useEffect(() => {
    resetZoom();
  }, [currentPage]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return;
      
      const totalPagesInEvent = influencer?.pdf_images_url?.length || 0;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setCurrentPage(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentPage(prev => Math.min(totalPagesInEvent - 1, prev + 1));
      } else if (e.key === '+' || e.key === '=') {
        zoomIn();
      } else if (e.key === '-') {
        zoomOut();
      } else if (e.key === '0') {
        resetZoom();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onClose, influencer?.pdf_images_url?.length]);

  if (!isOpen || !influencer?.pdf_images_url || influencer.pdf_images_url.length === 0) {
    return null;
  }

  const totalPages = influencer.pdf_images_url.length;

  const goToPrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };


  const handleMouseUp = () => {
    setIsDragging(false);
  };


  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  };


  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <Title>피드백</Title>
          <HeaderControls>
            <ZoomControls>
              <ZoomButton onClick={zoomOut} disabled={zoom <= 0.5}>
                <FaSearchMinus size={14} />
              </ZoomButton>
              <ZoomLevel>{Math.round(zoom * 100)}%</ZoomLevel>
              <ZoomButton onClick={zoomIn} disabled={zoom >= 3}>
                <FaSearchPlus size={14} />
              </ZoomButton>
              <ResetButton onClick={resetZoom}>리셋</ResetButton>
            </ZoomControls>
            <CloseButton onClick={onClose}>
              <FaTimes size={18} />
            </CloseButton>
          </HeaderControls>
        </ModalHeader>

        <ImageContainer
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        >
          {totalPages > 1 && currentPage > 0 && (
            <ArrowButton 
              position="left"
              onClick={goToPrevious}
            >
              <FaChevronLeft size={20} />
            </ArrowButton>
          )}

          <FeedbackImage
            ref={imageRef}
            src={influencer.pdf_images_url[currentPage]}
            alt={`피드백 ${currentPage + 1}페이지`}
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              transformOrigin: 'center center'
            }}
            draggable={false}
          />

          {totalPages > 1 && currentPage < totalPages - 1 && (
            <ArrowButton 
              position="right"
              onClick={goToNext}
            >
              <FaChevronRight size={20} />
            </ArrowButton>
          )}
        </ImageContainer>

        {totalPages > 1 && (
          <PageInfo>
            {currentPage + 1} / {totalPages}
          </PageInfo>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 1000px;
  height: 800px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 1050px) {
    width: 95vw;
    height: 85vh;
  }
  
  @media (max-height: 850px) {
    height: 90vh;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  background-color: #f8f9fa;
  flex-shrink: 0;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ZoomControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 4px 8px;
`;

const ZoomButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  
  &:hover:not(:disabled) {
    background: #f0f0f0;
    color: #333;
  }
  
  &:disabled {
    color: #ccc;
    cursor: not-allowed;
  }
`;

const ZoomLevel = styled.span`
  font-size: 12px;
  color: #666;
  min-width: 35px;
  text-align: center;
`;

const ResetButton = styled.button`
  background: none;
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 3px;
  font-size: 12px;
  color: #666;
  
  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

const CloseButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;

  &:hover {
    background: #545b62;
  }
`;

const ImageContainer = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  overflow: hidden;
  user-select: none;
`;

const FeedbackImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  transition: transform 0.1s ease-out;
`;

const ArrowButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => props.position}: 20px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
    transform: translateY(-50%) scale(1.1);
  }
`;

const PageInfo = styled.div`
  text-align: center;
  padding: 12px;
  background-color: #f8f9fa;
  border-top: 1px solid #eee;
  font-size: 14px;
  color: #666;
  flex-shrink: 0;
`;

export default FeedbackImages;