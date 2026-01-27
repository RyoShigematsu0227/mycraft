export default function WorldLayout({
  children,
  engagement,
}: {
  children: React.ReactNode
  engagement: React.ReactNode
}) {
  return (
    <>
      {children}
      {engagement}
    </>
  )
}
