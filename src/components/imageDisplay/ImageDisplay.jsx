import React from 'react';
import { FaArrowRight, FaRedo } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Image, Button } from 'react-bootstrap';
import './ImageDisplay.css';

const ImageDisplay = ({ image1, image2 }) => {
    const navigate = useNavigate();


  const handleClick = () => {
    navigate('/');
  };

  return (
    <Container fluid className="image-display">
      <Row className="align-items-center h-100">
        <Col xs={6} className="text-center">
          <p className="image-title">Input</p>
          <Image src={image1} alt="Input" fluid className="image" />
        </Col>
        {/* <Col xs={2} className="text-center arrow-container">
          <FaArrowRight size={48} />
        </Col> */}
        <Col xs={6} className="text-center">
          <p className="image-title">Output</p>
          <Image src={image2} alt="Output" fluid className="image" />
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Button variant="danger" className="another-button" onClick={handleClick}>
          <FaRedo size={18} /> Another Design
        </Button>
      </Row>
    </Container>
  );
};

export default ImageDisplay;