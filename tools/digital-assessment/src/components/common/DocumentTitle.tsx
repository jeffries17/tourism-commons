import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function DocumentTitle() {
  const location = useLocation();

  useEffect(() => {
    const getTitleForRoute = (path: string) => {
      if (path === '/') {
        return 'Digital Assessment Dashboard - The Gambia | Creative Industries & Tourism';
      }
      if (path.startsWith('/participant/')) {
        return 'Stakeholder Profile - Digital Assessment Dashboard | The Gambia';
      }
      if (path === '/participants') {
        return 'All Stakeholders - Digital Assessment Dashboard | The Gambia';
      }
      if (path.startsWith('/sectors/')) {
        const sector = decodeURIComponent(path.split('/')[2] || '');
        return `${sector} Sector - Digital Assessment Dashboard | The Gambia`;
      }
      if (path === '/sectors') {
        return 'Sector Analysis - Digital Assessment Dashboard | The Gambia';
      }
      if (path === '/methodology') {
        return 'Assessment Methodology - Digital Assessment Dashboard | The Gambia';
      }
      if (path === '/technical-audit') {
        return 'Technical Website Audit - Digital Assessment Dashboard | The Gambia';
      }
      return 'Digital Assessment Dashboard - The Gambia';
    };

    document.title = getTitleForRoute(location.pathname);
  }, [location]);

  return null;
}

