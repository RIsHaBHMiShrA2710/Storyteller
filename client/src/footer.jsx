import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import './footer.css'

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4">
      <Container>
        <Row>
          <Col className='text-center'>
            <h5>Created with ❤️ by Rishabh Mishra</h5>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
