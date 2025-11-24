/** @type {import('next').NextConfig} */
module.exports = {
    images: {
        domains: ["randomuser.me"],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "randomuser.me",
                pathname: "/api/portraits/**"
            }
        ]
    }
};
