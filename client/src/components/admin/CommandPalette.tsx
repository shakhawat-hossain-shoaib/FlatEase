import { useState, useEffect } from 'react';
import { Modal, Form, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { BsSearch, BsArrowRight } from 'react-icons/bs';

export function CommandPalette() {
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShow(true);
      }
      if (e.key === 'Escape') {
        setShow(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commands = [
    { label: 'Go to Dashboard', to: '/admin', group: 'Navigation' },
    { label: 'Manage Buildings', to: '/admin/apartments', group: 'Navigation' },
    { label: 'View Complaints', to: '/admin/complaints', group: 'Navigation' },
    { label: 'User Management', to: '/admin/users', group: 'Navigation' },
    { label: 'Tenant Payments', to: '/admin/payments', group: 'Navigation' },
    { label: 'Bill & Service Charge', to: '/admin/bill-service-charge', group: 'Navigation' },
    { label: 'Add New Tenant', to: '/admin/users', group: 'Quick Actions' },
  ];

  const filtered = commands.filter(c => c.label.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (to: string) => {
    setShow(false);
    setSearch('');
    navigate(to);
  };

  return (
    <>
      <div 
        className="d-none d-md-flex align-items-center bg-light rounded-pill px-3 py-1 text-muted border border-secondary border-opacity-25"
        style={{ cursor: 'pointer', fontSize: '0.875rem', marginRight: 'auto', gap: '80px', transition: 'all 0.2s' }}
        onClick={() => setShow(true)}
      >
        <div className="d-flex align-items-center gap-2">
          <BsSearch size={14} />
          <span>Search or jump to...</span>
        </div>
        <div className="d-flex align-items-center gap-1">
          <kbd className="bg-white text-dark border shadow-sm">⌘</kbd>
          <kbd className="bg-white text-dark border shadow-sm">K</kbd>
        </div>
      </div>

      <Modal show={show} onHide={() => { setShow(false); setSearch(''); }} size="lg" centered contentClassName="border-0 shadow-lg" style={{ backdropFilter: 'blur(4px)' }}>
        <Modal.Body className="p-0">
          <div className="d-flex align-items-center bg-white p-3 border-bottom" style={{ borderTopLeftRadius: 'var(--bs-modal-border-radius)', borderTopRightRadius: 'var(--bs-modal-border-radius)' }}>
            <BsSearch size={20} className="text-muted me-3 ms-2" />
            <Form.Control 
              autoFocus 
              size="lg"
              className="border-0 shadow-none bg-transparent px-0" 
              placeholder="Search features, tools, and actions..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ fontSize: '1.25rem' }}
            />
            <div className="text-muted small border rounded px-2 py-1 ms-2" style={{ fontSize: '0.75rem'}}>ESC</div>
          </div>
          <div className="bg-light p-2" style={{ maxHeight: '400px', overflowY: 'auto', borderBottomLeftRadius: 'var(--bs-modal-border-radius)', borderBottomRightRadius: 'var(--bs-modal-border-radius)' }}>
            {filtered.length === 0 ? (
              <div className="text-center text-muted p-4">No results found.</div>
            ) : (
              <ListGroup variant="flush">
                {filtered.map((cmd, idx) => (
                  <ListGroup.Item 
                    key={idx} 
                    action 
                    onClick={() => handleSelect(cmd.to)}
                    className="d-flex align-items-center justify-content-between rounded mb-1 border-0 admin-card-hover"
                    style={{ background: 'transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'white'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div>
                      <span className="text-muted small me-3 fw-bold">{cmd.group}</span>
                      <span>{cmd.label}</span>
                    </div>
                    <BsArrowRight className="text-muted opacity-50" />
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
