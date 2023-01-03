const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  webpack: (config, {isServer}) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }

    return config;
  },
}

module.exports = nextConfig;
