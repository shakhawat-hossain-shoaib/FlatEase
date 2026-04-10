import { Link } from 'react-router-dom';
import flatEaseLogo from '../../../assets/FlatEase.png';

type BrandLogoProps = {
  to?: string;
  compact?: boolean;
  showWordmark?: boolean;
  className?: string;
};

export function BrandLogo({ to = '/', compact = false, showWordmark = true, className = '' }: BrandLogoProps) {
  const logo = (
    <div className={`app-brand ${compact ? 'app-brand-compact' : ''} ${className}`.trim()}>
      <img
        src={flatEaseLogo}
        alt="FlatEase"
        className={`app-brand-logo ${compact ? 'app-brand-logo-compact' : ''}`.trim()}
      />
      {showWordmark && <span className="app-brand-wordmark">FlatEase</span>}
    </div>
  );

  if (!to) {
    return logo;
  }

  return (
    <Link to={to} className="text-decoration-none text-reset">
      {logo}
    </Link>
  );
}