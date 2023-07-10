import React from 'react';
import { Link } from 'react-router-dom';
import Button from "./../components/button";

import { Container, Row, Col, Card } from "react-bootstrap";

function FourOhFour() {
  return (
    <main>
      <Container>
        <Row className="d-flex justify-content-center align-items-center mt-5" noGutters>
          <Col md={2}></Col>
          <Col sm={12} md={8}>
            <Card className="card">
              <Card.Body>
                <h1>Lost In The Desert
                  <i className="fas fa-question-circle infinite-rotate icon" aria-hidden="true"></i></h1>
                <hr />
                It looks like you have missed your way. Let us get you back home.
                <Link to="/"><Button
                  btnClass="btn btn-success btn-xl btn-lg"
                  value="Go back home"
                /></Link>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}></Col>
        </Row>
      </Container>
    </main>
  );
}



export default FourOhFour;
