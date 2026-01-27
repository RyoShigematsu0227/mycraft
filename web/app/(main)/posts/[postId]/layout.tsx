export default function PostLayout({
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
