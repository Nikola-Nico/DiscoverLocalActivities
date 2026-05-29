import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="text-red-500 text-center">
      404 - Not Found
      <Link to="/" className="text-blue-500 underline">Go back to Home</Link>
    </div>
  );
}

export default NotFoundPage;