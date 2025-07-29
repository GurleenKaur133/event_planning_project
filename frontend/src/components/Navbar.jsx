export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">EventPlanner</h1>
      <div className="space-x-4">
        <a href="/" className="hover:underline">Home</a>
        <a href="/login" className="hover:underline">Login</a>
        <a href="/register" className="hover:underline">Register</a>
      </div>
    </nav>
  );
}
