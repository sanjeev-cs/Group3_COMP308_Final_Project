import { useNavigate } from 'react-router-dom';
import UiSceneBackground from './UiSceneBackground.jsx';
import './PageShell.css';

const PageShell = ({
  title,
  subtitle,
  backTo,
  backLabel = 'Back',
  action,
  children,
  className = '',
  contentClassName = 'container',
  centered = false,
  showHeader = true,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
      return;
    }

    navigate(-1);
  };

  const shouldRenderHeader = showHeader && (title || subtitle || backTo || action);

  return (
    <div className={`page-shell ${centered ? 'page-shell-centered' : ''} ${className}`.trim()}>
      <div className="page-shell-scene">
        <UiSceneBackground />
      </div>
      <div className="page-shell-overlay" />
      <div className="page-shell-main">
        <div className={contentClassName}>
          {shouldRenderHeader && (
            <div className="page-shell-header">
              <div className="page-shell-heading">
                {(backTo || !title) && (
                  <button type="button" className="page-back-btn" onClick={handleBack}>
                    <span className="page-back-arrow">&lt;</span>
                    <span>{backLabel}</span>
                  </button>
                )}
                {title && <h1 className="page-shell-title">{title}</h1>}
                {subtitle && <p className="page-shell-subtitle">{subtitle}</p>}
              </div>
              {action && <div className="page-shell-action">{action}</div>}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageShell;
