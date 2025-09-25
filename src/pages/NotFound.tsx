
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        <h1 className="text-9xl font-bold text-brand-600 mb-4">404</h1>
        <h2 className="text-3xl font-semibold mb-4">Page non trouvée</h2>
        <p className="text-gray-600 mb-8">
          Nous ne trouvons pas la page que vous recherchez. Elle a peut-être été déplacée ou n'existe plus.
        </p>
        <Link to="/">
          <Button size="lg" className="gap-2">
            Retourner à l'accueil
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
