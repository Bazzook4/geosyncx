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
      window.location.replace(`/time/${route}.html`);
    }
  }, [route, routeData]);

  if (!routeData) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex justify-center items-center min-h-[50vh]" role="status">
      <div>Loading converter…</div>
    </div>
  );
}
