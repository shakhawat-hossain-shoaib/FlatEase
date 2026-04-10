import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, Col, Container, Form, Nav, Navbar, Row } from 'react-bootstrap';
import {
  BsArrowRight,
  BsBarChart,
  BsBell,
  BsBuildings,
  BsChatDots,
  BsCheck2Circle,
  BsCreditCard2Front,
  BsFileEarmarkText,
  BsLightningCharge,
  BsPeople,
  BsPlayCircle,
  BsShieldLock,
  BsStars,
} from 'react-icons/bs';

export default function Landing() {
  const [unitCount, setUnitCount] = useState(120);
  const [averageRent, setAverageRent] = useState(14000);

  const estimate = useMemo(() => {
    const monthlyCollection = unitCount * averageRent;
    const manualOpsCost = monthlyCollection * 0.08;
    const smartOpsCost = monthlyCollection * 0.025;
    const monthlySavings = manualOpsCost - smartOpsCost;

    return {
      monthlyCollection,
      manualOpsCost,
      smartOpsCost,
      monthlySavings,
      annualSavings: monthlySavings * 12,
    };
  }, [unitCount, averageRent]);

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
              <Nav.Link href="#calculator" className="text-dark">Calculator</Nav.Link>
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
                <Badge className="landing-chip mb-3">Interactive Property Ops Platform</Badge>
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
                <div className="landing-hero-panel">
                  <div className="landing-hero-panel-top">
                    <div>
                      <div className="landing-panel-label">This Month</div>
                      <div className="landing-panel-value">BDT 2,420,000</div>
                    </div>
                    <span className="landing-panel-pill">+18% collected</span>
                  </div>
                  <div className="landing-mini-grid">
                    <div className="landing-mini-card">
                      <BsBarChart />
                      <span>Collections</span>
                    </div>
                    <div className="landing-mini-card">
                      <BsLightningCharge />
                      <span>Tickets</span>
                    </div>
                    <div className="landing-mini-card">
                      <BsShieldLock />
                      <span>Docs</span>
                    </div>
                    <div className="landing-mini-card">
                      <BsStars />
                      <span>SLA</span>
                    </div>
                  </div>
                  <div className="landing-feed mt-3">
                    <div className="landing-feed-row">
                      <BsCheck2Circle className="text-success" /> Payment settled for Unit B-204
                    </div>
                    <div className="landing-feed-row">
                      <BsCheck2Circle className="text-success" /> Complaint assigned to Electrical team
                    </div>
                    <div className="landing-feed-row">
                      <BsCheck2Circle className="text-success" /> Lease renewal alert sent to 8 tenants
                    </div>
                  </div>
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
                <Row className="g-3">
                  <Col sm={6}>
                    <Card className="landing-kpi-card border-0">
                      <Card.Body>
                        <div className="landing-kpi-value">98.2%</div>
                        <div className="landing-kpi-label">Tenant Satisfaction</div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col sm={6}>
                    <Card className="landing-kpi-card border-0">
                      <Card.Body>
                        <div className="landing-kpi-value">2.4x</div>
                        <div className="landing-kpi-label">Faster Ticket Closure</div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col sm={6}>
                    <Card className="landing-kpi-card border-0">
                      <Card.Body>
                        <div className="landing-kpi-value">500+</div>
                        <div className="landing-kpi-label">Buildings Managed</div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col sm={6}>
                    <Card className="landing-kpi-card border-0">
                      <Card.Body>
                        <div className="landing-kpi-value">24/7</div>
                        <div className="landing-kpi-label">Live Visibility</div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Container>
        </section>

        <section id="calculator" className="py-5">
          <Container>
            <Card className="landing-calculator border-0">
              <Card.Body>
                <Row className="g-4 align-items-center">
                  <Col lg={6}>
                    <h3 className="mb-2">Live ROI Calculator</h3>
                    <p className="text-muted mb-4">Adjust your building profile to estimate potential monthly and yearly operational savings.</p>

                    <Form.Group className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <Form.Label className="mb-0">Number of occupied units</Form.Label>
                        <strong>{unitCount}</strong>
                      </div>
                      <Form.Range
                        min={20}
                        max={600}
                        value={unitCount}
                        onChange={(event) => setUnitCount(Number(event.target.value))}
                      />
                    </Form.Group>

                    <Form.Group>
                      <div className="d-flex justify-content-between mb-1">
                        <Form.Label className="mb-0">Average monthly rent (BDT)</Form.Label>
                        <strong>{averageRent.toLocaleString()}</strong>
                      </div>
                      <Form.Range
                        min={7000}
                        max={45000}
                        step={500}
                        value={averageRent}
                        onChange={(event) => setAverageRent(Number(event.target.value))}
                      />
                    </Form.Group>
                  </Col>

                  <Col lg={6}>
                    <div className="landing-calculator-result">
                      <div className="landing-result-item">
                        <span>Monthly Collection</span>
                        <strong>BDT {Math.round(estimate.monthlyCollection).toLocaleString()}</strong>
                      </div>
                      <div className="landing-result-item">
                        <span>Manual Ops Cost</span>
                        <strong>BDT {Math.round(estimate.manualOpsCost).toLocaleString()}</strong>
                      </div>
                      <div className="landing-result-item">
                        <span>With FlatEase</span>
                        <strong>BDT {Math.round(estimate.smartOpsCost).toLocaleString()}</strong>
                      </div>
                      <div className="landing-result-item highlight">
                        <span>Estimated Monthly Savings</span>
                        <strong>BDT {Math.round(estimate.monthlySavings).toLocaleString()}</strong>
                      </div>
                      <div className="landing-result-item annual">
                        <span>Estimated Yearly Savings</span>
                        <strong>BDT {Math.round(estimate.annualSavings).toLocaleString()}</strong>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
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
