export function shouldUseUnoptimizedImage(src: string | null | undefined) {
  if (!src) {
    return false;
  }

  // Browser-only preview URLs cannot be fetched by Next's image optimizer.
  return src.startsWith("blob:") || src.startsWith("data:");
}
