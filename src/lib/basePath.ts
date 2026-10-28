// Next.js adds the basePath to <Link> and assets automatically, but not to
// plain <a href> links pointing at files in /public. Use this for those.
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function withBasePath(path: string): string {
  return `${basePath}${path}`;
}
