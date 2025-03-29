/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false, // Disable strict mode to prevent double calls in useEffect
  images: {
    domains: ['otqxkhrzvszshplymejg.supabase.co'], // Add your Supabase URL here
  },
};

export default nextConfig;
