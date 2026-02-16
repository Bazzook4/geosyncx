// /src/BlogPost.jsx
import { useParams, Navigate } from "react-router-dom";
import { useEffect } from "react";

const VALID_BLOG_POSTS = [
  "timezone-comparison-tool",
  "phone-code-timezone-search",
  "set-primary-timezone",
  "schedule-meeting-across-timezones",
  "best-meeting-time-finder",
  "json-xml-soap-formatter",
];

export default function BlogPost() {
  const { postId } = useParams();

  useEffect(() => {
    // If valid blog post, redirect to static HTML version
    if (VALID_BLOG_POSTS.includes(postId)) {
      window.location.href = `/blog/${postId}.html`;
    }
  }, [postId]);

  // If not a valid post, redirect to blog index
  if (!VALID_BLOG_POSTS.includes(postId)) {
    return <Navigate to="/blog" replace />;
  }

  // Show loading while redirecting to HTML
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      color: '#f1f5f9'
    }}>
      <div>Loading...</div>
    </div>
  );
}
