import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaChartLine, FaBriefcase, FaUsers } from "react-icons/fa";

export default function Homepage() {
  return (
    <div className="homepage">
      <section className="py-5 text-center container">
        <div className="row py-lg-5">
          <div className="col-lg-8 col-md-8 mx-auto">
            <h1 className="fw-bold display-4 mb-3">Master Your Job Search</h1>
            <p className="lead text-muted mb-4">
              Track applications, prepare for interviews, and land your dream
              role with JobTrack. The all-in-one platform for serious job
              seekers.
            </p>
            <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
              <Link to="/register">
                <Button
                  variant="primary"
                  size="lg"
                  className="px-4 gap-3 btn-primary-modern"
                >
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="outline-secondary"
                  size="lg"
                  className="px-4 btn-modern"
                >
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Container className="py-5">
        <Row className="g-4">
          <Col md={4}>
            <Card className="h-100 card-modern border-0">
              <Card.Body className="text-center p-4">
                <div className="mb-3 text-primary">
                  <FaBriefcase size={40} />
                </div>
                <Card.Title as="h3" className="h4 mb-3">
                  Smart Tracking
                </Card.Title>
                <Card.Text className="text-muted">
                  Keep all your applications organized. Track status from
                  applied to offer, store job descriptions, and never miss a
                  follow-up.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 card-modern border-0">
              <Card.Body className="text-center p-4">
                <div className="mb-3 text-success">
                  <FaChartLine size={40} />
                </div>
                <Card.Title as="h3" className="h4 mb-3">
                  Interview Prep
                </Card.Title>
                <Card.Text className="text-muted">
                  Practice mock answers and access a vast
                  library of real interview questions shared by the community.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 card-modern border-0">
              <Card.Body className="text-center p-4">
                <div className="mb-3 text-info">
                  <FaUsers size={40} />
                </div>
                <Card.Title as="h3" className="h4 mb-3">
                  Community Insights
                </Card.Title>
                <Card.Text className="text-muted">
                  Learn from others&apos; experiences. Browse anonymous
                  interview questions tagged by company and role to get the
                  inside scoop.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
