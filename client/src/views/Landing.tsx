import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Container, Row, Col, Nav, Navbar } from 'react-bootstrap';
import { BsBuilding, BsShieldLock, BsFileEarmarkText, BsBell, BsCreditCard, BsChatDots } from 'react-icons/bs';

export default function Landing() {
  useEffect(() => {
    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>('.feature-card, #benefits ul li')
    );

    revealElements.forEach((element, index) => {
      element.classList.add('reveal-item');
      element.style.setProperty('--reveal-delay', `${index * 80}ms`);
    });

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    revealElements.forEach((element) => revealObserver.observe(element));

    const statsSection = document.getElementById('stats');
    const statHeadings = Array.from(statsSection?.querySelectorAll<HTMLHeadingElement>('h3') ?? []);
    const statTargets = [
      { value: 500, prefix: '', suffix: '+' },
      { value: 2000, prefix: '', suffix: '+' },
      { value: 98, prefix: '', suffix: '%' },
      { value: 24, prefix: '', suffix: '/7' },
    ];

    let statsAnimated = false;

    const animateValue = (
      element: HTMLHeadingElement,
      target: number,
      duration: number,
      suffix: string,
      prefix = ''
    ) => {
      const start = performance.now();
      const startValue = 0;

      const update = (timestamp: number) => {
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(startValue + (target - startValue) * eased);
        const valueLabel = current.toLocaleString();

        element.textContent = `${prefix}${valueLabel}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      };

      requestAnimationFrame(update);
    };

    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || statsAnimated) {
            return;
          }

          statsAnimated = true;

          statHeadings.forEach((heading, index) => {
            const target = statTargets[index];
            if (!target) {
              return;
            }

            animateValue(heading, target.value, 1800 + index * 120, target.suffix, target.prefix);
          });

          statsObserver.disconnect();
        });
      },
      { threshold: 0.4 }
    );

    if (statsSection) {
      statsObserver.observe(statsSection);
    }

    return () => {
      revealObserver.disconnect();
      statsObserver.disconnect();
    };
  }, []);

  return (
    <>
      <div className="landing-page" style={{ minHeight: '100vh' }}>
        <Navbar expand="md" bg="white" className="border-bottom py-3">
        <Container>
          <Navbar.Brand>
            <Link to="/" className="text-decoration-none text-dark fw-bold fs-5">
              FlatEase
            </Link>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center gap-2">
              <Nav.Link href="#features" className="text-dark">Features</Nav.Link>
              <Nav.Link href="#benefits" className="text-dark">Benefits</Nav.Link>
              <Nav.Link href="#pricing" className="text-dark">Pricing</Nav.Link>
              <Link to="/login" className="btn btn-outline-primary btn-sm ms-2">
                Sign In
              </Link>
              <Link to="/login" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main>
        <section className="py-5 bg-light">
          <Container>
            <Row className="align-items-center g-5">
              <Col md={6}>
                <span className="badge bg-primary mb-3">Modern Property Management Platform</span>
                <h1 className="display-4 fw-bold mb-3">Simplify Your Apartment Management</h1>
                <p className="lead text-muted mb-4">
                  FlatEase is the all-in-one platform for property managers and tenants. Manage
                  leases, track payments, handle complaints, and store documents securely—all in
                  one place.
                </p>
                <div className="d-flex gap-3 flex-wrap mb-3">
                  <Link to="/login" className="btn btn-primary btn-lg px-4">
                    Start Free Trial →
                  </Link>
                  <Button variant="outline-secondary" className="btn-lg px-4">
                    View Demo
                  </Button>
                </div>
                <small className="text-muted">No credit card required • 14-day free trial • Cancel anytime</small>
              </Col>
              <Col md={6}>
                <img
                  src="https://integrio.net/static/f572cec6df7b977f29ce18508354096e/how-to-create-custom-property-management-systems.png"
                  alt="hero"
                  className="img-fluid rounded-3"
                />
              </Col>
            </Row>
          </Container>
        </section>

        <section id="features" className="py-5 bg-white">
          <Container>
            <div className="text-center mb-5">
              <h2 className="mb-3 fw-bold display-6">Everything You Need to Manage Properties</h2>
              <p className="text-muted lead">Powerful features designed to streamline your property management workflow and improve tenant satisfaction.</p>
            </div>
            <Row className="g-4">
              {[
                {
                  title: 'Apartment Management',
                  desc: 'Efficiently manage multiple properties, units, and tenants from a single dashboard.',
                  icon: <BsBuilding size={28} />,
                },
                {
                  title: 'Secure Documents',
                  desc: 'Store and share documents with bank-grade encryption and secure access controls.',
                  icon: <BsShieldLock size={28} />,
                },
                {
                  title: 'Lease Tracking',
                  desc: 'Track lease agreements with automated expiry alerts and renewal reminders.',
                  icon: <BsFileEarmarkText size={28} />,
                },
                {
                  title: 'Smart Notifications',
                  desc: 'Stay informed with real-time alerts for payments, complaints, and important updates.',
                  icon: <BsBell size={28} />,
                },
                {
                  title: 'Payment Management',
                  desc: 'Track rent payments, manage invoices, and monitor payment history effortlessly.',
                  icon: <BsCreditCard size={28} />,
                },
                {
                  title: 'Complaint Resolution',
                  desc: 'Streamline maintenance requests and complaints with a visual timeline tracker.',
                  icon: <BsChatDots size={28} />,
                },
              ].map((f) => (
                <Col md={4} key={f.title}>
                  <div className="card h-100 border-0 shadow-sm feature-card">
                    <div className="card-body">
                      <div className="feature-icon-lg bg-primary text-white rounded-3 mb-3">
                        {f.icon}
                      </div>
                      <h5 className="card-title fw-bold">{f.title}</h5>
                      <p className="card-text text-muted">{f.desc}</p>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        <section id="benefits" className="py-5 bg-light">
          <Container>
            <Row className="align-items-center g-5">
              <Col md={6}>
                <img
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
                  alt="why choose"
                  className="img-fluid rounded-3"
                />
              </Col>
              <Col md={6}>
                <h2 className="fw-bold mb-3">Why Choose FlatEase?</h2>
                <p className="text-muted mb-4">
                  Join thousands of property managers who have transformed their workflow with FlatEase.
                </p>
                <ul className="list-unstyled">
                  <li className="d-flex align-items-start mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#007bff" className="me-3 mt-1" viewBox="0 0 16 16"><path d="M8 3.5a.5.5 0 0 1 .5.5v4l2.5 1.5a.5.5 0 0 1-.5.866l-3-1.8V4a.5.5 0 0 1 .5-.5z"/><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zM1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8z"/></svg>
                    <div>
                      <strong>Save Time</strong><br/>
                      <small className="text-muted">Automate repetitive tasks and reduce manual work by up to 70%.</small>
                    </div>
                  </li>
                  <li className="d-flex align-items-start mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#007bff" className="me-3 mt-1" viewBox="0 0 16 16"><path d="M0 0h1v15h15v1H0V0z"/><path d="M2 10h1v5H2v-5zM5 5h1v10H5V5zM8 8h1v7H8V8zM11 3h1v12h-1V3z"/></svg>
                    <div>
                      <strong>Reduce Costs</strong><br/>
                      <small className="text-muted">Lower operational costs with efficient property management workflows.</small>
                    </div>
                  </li>
                  <li className="d-flex align-items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#007bff" className="me-3 mt-1" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM6.5 10.5L4 8l-.5.5L6.5 12l5.5-5.5L11.5 6 6.5 10.5z"/></svg>
                    <div>
                      <strong>Improve Satisfaction</strong><br/>
                      <small className="text-muted">Enhance tenant experience with responsive communication and transparency.</small>
                    </div>
                  </li>
                </ul>
              </Col>
            </Row>
          </Container>
        </section>

        <section id="stats" className="py-5 text-white" style={{ background: 'var(--flatease-primary-gradient)' }}>
          <Container>
            <Row className="text-center">
              <Col md={3} className="mb-4 mb-md-0">
                <h3 className="mb-1 fw-bold display-5">500+</h3>
                <small className="fw-light">Properties</small>
              </Col>
              <Col md={3} className="mb-4 mb-md-0">
                <h3 className="mb-1 fw-bold display-5">2,000+</h3>
                <small className="fw-light">Active Tenants</small>
              </Col>
              <Col md={3} className="mb-4 mb-md-0">
                <h3 className="mb-1 fw-bold display-5">98%</h3>
                <small className="fw-light">Satisfaction Rate</small>
              </Col>
              <Col md={3}>
                <h3 className="mb-1 fw-bold display-5">24/7</h3>
                <small className="fw-light">Support Available</small>
              </Col>
            </Row>
          </Container>
        </section>
      </main>

      <footer className="bg-white border-top py-4">
        <Container className="text-center text-muted small">
          © 2026 FlatEase. All rights reserved.
        </Container>
      </footer>
      </div>
    </>
  );
}
