import { Link } from 'react-router-dom';
import { Badge, Button, Card, Col, Container, Nav, Navbar, Row } from 'react-bootstrap';
import {
  BsArrowRight,
  BsBell,
  BsBuildings,
  BsChatDots,
  BsCheck2Circle,
  BsCreditCard2Front,
  BsFileEarmarkText,
  BsPeople,
  BsPlayCircle,
} from 'react-icons/bs';

export default function Landing() {
  const featureCards = [
    {
      title: 'Property Operations',
      desc: 'Track buildings, floors, units, occupancy, and tenant assignments from one command center.',
      icon: BsBuildings,
      accentClass: 'landing-feature-indigo',
    },
    {
      title: 'Payment Intelligence',
      desc: 'Monitor billing, due cycles, partial payments, and collection trends with instant clarity.',
      icon: BsCreditCard2Front,
      accentClass: 'landing-feature-cyan',
    },
    {
      title: 'Complaint Workflow',
      desc: 'Assign technicians, track timelines, and resolve maintenance requests with transparency.',
      icon: BsChatDots,
      accentClass: 'landing-feature-amber',
    },
    {
      title: 'Secure Documentation',
      desc: 'Store lease files and identity documents with role-based access and audit readiness.',
      icon: BsFileEarmarkText,
      accentClass: 'landing-feature-emerald',
    },
    {
      title: 'Real-time Alerts',
      desc: 'Send announcements and trigger notifications for lease events, payments, and issue updates.',
      icon: BsBell,
      accentClass: 'landing-feature-violet',
    },
    {
      title: 'Role-based Portals',
      desc: 'Dedicated experiences for admins, tenants, and technicians with role-specific actions.',
      icon: BsPeople,
      accentClass: 'landing-feature-rose',
    },
  ];

  return (
    <div className="landing-shell">
      <Navbar expand="md" className="landing-nav py-3">
        <Container>
          <Navbar.Brand className="landing-brand-wrap">
            <span className="landing-brand-dot" />
            <Link to="/" className="text-decoration-none text-dark fw-bold fs-5 landing-brand-wordmark">
              FlatEase
            </Link>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center gap-2">
              <Nav.Link href="#features" className="text-dark">Features</Nav.Link>
              <Nav.Link href="#impact" className="text-dark">Impact</Nav.Link>
              <Link to="/login" className="btn landing-btn landing-btn-ghost landing-btn-sm ms-2">
                Sign In
              </Link>
              <Link to="/register" className="btn landing-btn landing-btn-primary landing-btn-sm">
                Get Started
              </Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main className="landing-main">
        <section className="landing-hero py-5">
          <Container>
            <Row className="align-items-center g-5">
              <Col md={6}>
                <Badge className="landing-chip mb-3">Modern Property Management Platform</Badge>
                <h1 className="landing-hero-title mb-3">From scattered tasks to one live operating system.</h1>
                <p className="landing-hero-copy mb-4">
                  FlatEase helps teams run buildings with speed and precision. Manage leases,
                  billing, support tickets, and communication in a single workflow built for both
                  managers and tenants.
                </p>
                <div className="d-flex gap-3 flex-wrap mb-3">
                  <Link to="/register" className="btn landing-btn landing-btn-primary landing-btn-lg d-inline-flex align-items-center gap-2">
                    Start Free Trial <BsArrowRight />
                  </Link>
                  <Button variant="light" className="landing-btn landing-btn-secondary landing-btn-lg d-inline-flex align-items-center gap-2" href="#calculator">
                    <BsPlayCircle /> Live ROI Demo
                  </Button>
                </div>
                <small className="text-muted">No credit card required • Fast onboarding • Role-based access</small>
              </Col>
              <Col md={6}>
                <div className="landing-photo-card">
                  <img
                    src="https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80"
                    alt="Modern apartment buildings"
                    className="img-fluid rounded-4"
                  />
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        <section id="features" className="py-5">
          <Container>
            <div className="text-center mb-5">
              <h2 className="mb-3 fw-bold display-6">Everything your operations team needs</h2>
              <p className="text-muted lead">Interactive tools designed to reduce response time and improve resident experience.</p>
            </div>
            <Row className="g-4">
              {featureCards.map((feature) => {
                const Icon = feature.icon;

                return (
                <Col md={6} lg={4} key={feature.title}>
                  <Card className="landing-feature-card h-100 border-0">
                    <Card.Body>
                      <div className={`landing-feature-icon ${feature.accentClass}`}>
                        <Icon size={22} />
                      </div>
                      <h5 className="card-title fw-bold mt-3">{feature.title}</h5>
                      <p className="card-text text-muted mb-0">{feature.desc}</p>
                    </Card.Body>
                  </Card>
                </Col>
              );})}
            </Row>
          </Container>
        </section>

        <section id="impact" className="py-5">
          <Container>
            <Row className="align-items-center g-5">
              <Col md={6}>
                <div className="landing-story-panel">
                  <h3>Why teams switch to FlatEase</h3>
                  <p>Manual operations slow down growth. FlatEase combines billing, support, and lease activity into one live system.</p>
                  <div className="landing-story-item">
                    <BsCheck2Circle className="text-success" />
                    <span>Average complaint resolution improved by 42%</span>
                  </div>
                  <div className="landing-story-item">
                    <BsCheck2Circle className="text-success" />
                    <span>Payment follow-up work reduced by 60%</span>
                  </div>
                  <div className="landing-story-item">
                    <BsCheck2Circle className="text-success" />
                    <span>Tenant communication visibility across all roles</span>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="landing-photo-grid">
                  <img
                    src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80"
                    alt="Apartment exterior"
                    className="img-fluid rounded-4"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80"
                    alt="Modern flat interior"
                    className="img-fluid rounded-4"
                  />
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        <section className="landing-cta py-5">
          <Container>
            <Row className="justify-content-center">
              <Col lg={9}>
                <div className="landing-cta-panel text-center">
                  <h3 className="mb-2">Run your building like a high-performing product team</h3>
                  <p className="text-muted mb-4">Start in minutes, onboard your team, and bring every resident workflow into one modern system.</p>
                  <div className="d-flex justify-content-center gap-3 flex-wrap">
                    <Link to="/register" className="btn landing-btn landing-btn-primary landing-btn-lg">
                      Create Account
                    </Link>
                    <Link to="/login" className="btn landing-btn landing-btn-ghost landing-btn-lg">
                      Sign In
                    </Link>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      </main>

      <footer className="bg-white border-top py-4 mt-4">
        <Container className="text-center text-muted small">
          © 2026 FlatEase. All rights reserved.
        </Container>
      </footer>
    </div>
  );
}
