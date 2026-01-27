export default function WorldLayout({
  children,
  engagement,
}: {
  children: React.ReactNode
  engagement: React.ReactNode
}) {
  return engagement || children
}
