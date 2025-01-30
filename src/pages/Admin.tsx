import { Settings, Users, FileText, Bell } from "lucide-react";

const Admin = () => {
  const modules = [
    { name: "Content Management", icon: FileText, count: "24 articles" },
    { name: "User Management", icon: Users, count: "1.2k users" },
    { name: "Notifications", icon: Bell, count: "3 pending" },
    { name: "Settings", icon: Settings, count: "Last updated 2h ago" },
  ];

  return (
    <div className="min-h-screen bg-secondary pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-text sm:text-3xl sm:truncate">
              Admin Dashboard
            </h2>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((module) => (
            <div
              key={module.name}
              className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <module.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-text-light truncate">
                        {module.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-text">
                          {module.count}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-text">
              Recent Activity
            </h3>
            <div className="mt-6">
              <p className="text-text-light">No recent activity to display.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;