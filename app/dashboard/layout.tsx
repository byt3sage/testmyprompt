export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full overflow-hidden bg-zinc-950 text-zinc-100">
      {children}
    </div>
  );
}
