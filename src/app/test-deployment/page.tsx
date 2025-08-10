export default function TestDeployment() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎉 PHOTON Deployment Test
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          If you can see this page, the deployment is working!
        </p>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-green-600 mb-4">
            ✅ Deployment Status: SUCCESS
          </h2>
          <p className="text-gray-700">
            Your PHOTON coaching platform is successfully deployed on Vercel.
          </p>
        </div>
      </div>
    </div>
  );
}