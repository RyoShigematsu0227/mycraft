export default function UserLayout({
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
