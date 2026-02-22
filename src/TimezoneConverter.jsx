// /src/TimezoneConverter.jsx
import { useParams, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { CONVERTER_ROUTES } from "./converter-routes";

export default function TimezoneConverter() {
  const { route } = useParams();
  const routeData = CONVERTER_ROUTES[route];

  useEffect(() => {
    // Redirect to static HTML version for SEO
    if (routeData) {
      window.location.href = `/time/${route}.html`;
    }
  }, [route, routeData]);

  if (!routeData) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '50vh',
      color: '#f1f5f9'
    }}>
      <div>Loading...</div>
    </div>
  );
}
