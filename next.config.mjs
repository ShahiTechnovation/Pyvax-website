/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false, // Strict mode for production
  },
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Exclude Node.js built-in modules from browser bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        path: false,
        crypto: false,
        stream: false,
        buffer: false,
        process: false,
        util: false,
        // Exclude node: protocol imports
        'node:child_process': false,
        'node:fs': false,
        'node:path': false,
        'node:url': false,
        'node:crypto': false,
        child_process: false,
      }
    }
    
    // Externalize node modules for server
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push('bufferutil', 'utf-8-validate')
    }
    
    return config
  },
  
  // CRITICAL: Headers required for WebContainer to function
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig
