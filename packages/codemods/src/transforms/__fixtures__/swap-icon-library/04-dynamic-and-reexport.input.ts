export { MoreHorizontal, Star } from 'lucide-vue-next'
export * from 'lucide-vue-next'

export async function lazy() {
  return await import('lucide-vue-next')
}
