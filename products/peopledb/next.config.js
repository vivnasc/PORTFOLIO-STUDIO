const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/ai-engine', '@repo/shared-types'],
};

module.exports = withNextIntl(nextConfig);
