/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'placeholder.pics',
      'images.unsplash.com',
      'randomuser.me',
      'covers.openlibrary.org',
      'books.google.com'
    ],
  },
}

module.exports = nextConfig
