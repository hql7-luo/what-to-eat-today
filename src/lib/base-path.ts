const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function prefixWithBasePath(path: string, basePath = configuredBasePath) {
  if (!basePath || !path.startsWith("/") || path === basePath || path.startsWith(`${basePath}/`)) {
    return path;
  }

  return `${basePath}${path}`;
}
