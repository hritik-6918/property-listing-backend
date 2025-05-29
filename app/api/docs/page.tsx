export default function ApiDocs() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">API Documentation</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Authentication</h2>
        <div className="bg-gray-100 p-4 rounded-md">
          <h3 className="font-medium mb-2">POST /api/auth/register</h3>
          <p>Register a new user</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-md mt-4">
          <h3 className="font-medium mb-2">POST /api/auth/login</h3>
          <p>Login and get authentication token</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Properties</h2>
        <div className="bg-gray-100 p-4 rounded-md">
          <h3 className="font-medium mb-2">GET /api/properties</h3>
          <p>Get all properties with filtering options</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-md mt-4">
          <h3 className="font-medium mb-2">GET /api/properties/:id</h3>
          <p>Get a specific property by ID</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-md mt-4">
          <h3 className="font-medium mb-2">POST /api/properties</h3>
          <p>Create a new property (requires authentication)</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-md mt-4">
          <h3 className="font-medium mb-2">PUT /api/properties/:id</h3>
          <p>Update a property (requires authentication and ownership)</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-md mt-4">
          <h3 className="font-medium mb-2">DELETE /api/properties/:id</h3>
          <p>Delete a property (requires authentication and ownership)</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Favorites</h2>
        <div className="bg-gray-100 p-4 rounded-md">
          <h3 className="font-medium mb-2">GET /api/favorites</h3>
          <p>Get all favorites for the authenticated user</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-md mt-4">
          <h3 className="font-medium mb-2">POST /api/favorites/:propertyId</h3>
          <p>Add a property to favorites</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-md mt-4">
          <h3 className="font-medium mb-2">DELETE /api/favorites/:propertyId</h3>
          <p>Remove a property from favorites</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Recommendations</h2>
        <div className="bg-gray-100 p-4 rounded-md">
          <h3 className="font-medium mb-2">GET /api/recommendations</h3>
          <p>Get all recommendations received by the authenticated user</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-md mt-4">
          <h3 className="font-medium mb-2">POST /api/recommendations</h3>
          <p>Recommend a property to another user</p>
        </div>
      </section>
    </div>
  )
}
