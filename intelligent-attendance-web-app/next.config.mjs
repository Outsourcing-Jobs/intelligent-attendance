/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactCompiler: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/dashboard/default",
        permanent: false,
      },
      {
        source: "/auth/v1/login",
        destination: "/auth/student/login",
        permanent: false,
      },
      {
        source: "/auth/v2/login",
        destination: "/auth/teacher/login",
        permanent: false,
      },
      {
        source: "/auth/login",
        destination: "/auth/v3/login",
        permanent: false,
      },
      {
        source: "/login",
        destination: "/auth/v3/login",
        permanent: false,
      },
    ];
  },

};

export default nextConfig;
