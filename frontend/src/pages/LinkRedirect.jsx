import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const LinkRedirect = () => {
  const { token } = useParams();

  useEffect(() => {
    if (!token) return;
    
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (!backendUrl) {
      console.error('Backend URL not configured');
      return;
    }
    window.location.href = `${backendUrl}/tracking-links/l/${token}`;
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
};

export default LinkRedirect;