export { MoreHorizontal, Star } from '@lucide/vue'
export * from '@lucide/vue'

export async function lazy() {
  return await import('@lucide/vue');
}
