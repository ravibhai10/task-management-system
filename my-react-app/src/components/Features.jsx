export default function Hero() {
  return (
    <main className="hero">
      <div className="hero-content">
        <h1>Welcome to TaskEasy</h1>
        <p>Manage your tasks efficiently with our simple and intuitive platform.</p>
        <div className="cta-buttons">
          <a href="/signup" className="btn btn-primary">Get Started</a>
          <a href="/login" className="btn btn-secondary">Login</a>
        </div>
      </div>
    </main>
  );
}
