import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { MonthFilterProvider } from '@/contexts/MonthFilterContext';
import { SidebarProvider } from '@/contexts/SidebarContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <MonthFilterProvider>
        <div className="flex min-h-screen bg-slate-950">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </MonthFilterProvider>
    </SidebarProvider>
  );
}
