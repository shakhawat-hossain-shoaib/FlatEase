import { useEffect, useMemo, useState } from 'react';
import { Modal, Form, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { BsSearch, BsArrowRight } from 'react-icons/bs';

export function CommandPalette() {
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const isMac = useMemo(() => navigator.platform.toLowerCase().includes('mac'), []);

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

  const filtered = commands.filter((command) => command.label.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    setActiveIndex(0);
  }, [search, show]);

  const handleSelect = (to: string) => {
    setShow(false);
    setSearch('');
    setActiveIndex(0);
    navigate(to);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (filtered.length > 0) {
        setActiveIndex((prev) => (prev + 1) % filtered.length);
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (filtered.length > 0) {
        setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      }
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const selected = filtered[activeIndex];
      if (selected) {
        handleSelect(selected.to);
      }
    }
  };

  return (
    <>
      <button
        type="button"
        className="admin-command-trigger d-none d-md-flex"
        onClick={() => setShow(true)}
      >
        <span className="admin-command-trigger-label d-flex align-items-center gap-2">
          <BsSearch size={14} />
          <span>Search or jump to...</span>
        </span>
        <span className="d-flex align-items-center gap-1">
          <kbd>{isMac ? 'CMD' : 'CTRL'}</kbd>
          <kbd>K</kbd>
        </span>
      </button>

      <Modal
        show={show}
        onHide={() => {
          setShow(false);
          setSearch('');
          setActiveIndex(0);
        }}
        size="lg"
        centered
        contentClassName="border-0 shadow-lg"
      >
        <Modal.Body className="p-0">
          <div className="admin-command-head d-flex align-items-center bg-white p-3 border-bottom">
            <BsSearch size={20} className="text-muted me-3 ms-2" />
            <Form.Control
              autoFocus
              size="lg"
              className="border-0 shadow-none bg-transparent px-0"
              placeholder="Search features, tools, and actions..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={handleInputKeyDown}
            />
            <div className="admin-command-esc ms-2">ESC</div>
          </div>
          <div className="admin-command-results bg-light p-2">
            {filtered.length === 0 ? (
              <div className="text-center text-muted p-4">No results found.</div>
            ) : (
              <ListGroup variant="flush">
                {filtered.map((cmd, idx) => (
                  <ListGroup.Item
                    key={`${cmd.to}-${cmd.label}`}
                    action
                    onClick={() => handleSelect(cmd.to)}
                    className={`d-flex align-items-center justify-content-between rounded mb-1 border-0 admin-command-item ${activeIndex === idx ? 'active' : ''}`}
                  >
                    <div>
                      <span className="admin-command-group me-3">{cmd.group}</span>
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
