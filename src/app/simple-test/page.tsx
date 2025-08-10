export default function SimpleTest() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1 style={{ color: 'green', fontSize: '2rem' }}>✅ SIMPLE TEST SUCCESS</h1>
      <p style={{ fontSize: '1.2rem', margin: '20px 0' }}>
        If you can see this page, Next.js routing is working!
      </p>
      <div style={{ 
        background: '#f0f9ff', 
        padding: '20px', 
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <h2 style={{ color: '#0369a1' }}>Deployment Status</h2>
        <p>✅ Next.js App Router: Working</p>
        <p>✅ Static Generation: Working</p>
        <p>✅ Vercel Deployment: Working</p>
      </div>
      <p style={{ color: '#666' }}>
        Current URL: {typeof window !== 'undefined' ? window.location.href : 'Server Side'}
      </p>
    </div>
  );
}