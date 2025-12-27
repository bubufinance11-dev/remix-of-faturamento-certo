import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Landmark,
  Tags,
  Users,
  ArrowRightLeft,
  FileText,
  AlertTriangle,
  CalendarCheck,
  Menu,
  X,
  PlusCircle,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  icon: ReactNode;
  href: string;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, href: '/' },
  { label: 'Lançamentos', icon: <ArrowRightLeft className="h-5 w-5" />, href: '/lancamentos' },
  { label: 'Cartões', icon: <CreditCard className="h-5 w-5" />, href: '/cartoes' },
  { label: 'Relatórios', icon: <FileText className="h-5 w-5" />, href: '/relatorios' },
];

const settingsNavItems: NavItem[] = [
  { label: 'Empresas', icon: <Building2 className="h-5 w-5" />, href: '/empresas' },
  { label: 'Contas Bancárias', icon: <Landmark className="h-5 w-5" />, href: '/contas' },
  { label: 'Categorias', icon: <Tags className="h-5 w-5" />, href: '/categorias' },
  { label: 'Prestadores', icon: <Users className="h-5 w-5" />, href: '/prestadores' },
];

const toolsNavItems: NavItem[] = [
  { label: 'Alertas', icon: <AlertTriangle className="h-5 w-5" />, href: '/alertas', badge: 3 },
  { label: 'Fechamento', icon: <CalendarCheck className="h-5 w-5" />, href: '/fechamento' },
];

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const NavSection = ({ title, items }: { title: string; items: NavItem[] }) => (
    <div className="mb-6">
      <h3 className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <nav className="space-y-1">
        {items.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg mx-2 transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              {item.icon}
              {sidebarOpen && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-negative text-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 z-50 flex flex-col',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Landmark className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">FinControl</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-muted-foreground hover:text-foreground"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Quick Action */}
        <div className="p-4">
          <Link to="/lancamentos/novo">
            <Button 
              className={cn(
                'w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium shadow-lg shadow-accent/25',
                !sidebarOpen && 'px-0'
              )}
            >
              <PlusCircle className="h-5 w-5" />
              {sidebarOpen && <span className="ml-2">Novo Lançamento</span>}
            </Button>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          {sidebarOpen ? (
            <>
              <NavSection title="Principal" items={mainNavItems} />
              <NavSection title="Cadastros" items={settingsNavItems} />
              <NavSection title="Ferramentas" items={toolsNavItems} />
            </>
          ) : (
            <nav className="space-y-2 px-2">
              {[...mainNavItems, ...settingsNavItems, ...toolsNavItems].map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center justify-center p-3 rounded-lg transition-all duration-200 relative',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    )}
                    title={item.label}
                  >
                    {item.icon}
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 bg-negative text-foreground text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="text-xs text-muted-foreground">
              Sistema Financeiro v1.0
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-20'
        )}
      >
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="h-full px-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">
                Início
              </Link>
              {location.pathname !== '/' && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-foreground">
                    {mainNavItems.find(i => i.href === location.pathname)?.label ||
                     settingsNavItems.find(i => i.href === location.pathname)?.label ||
                     toolsNavItems.find(i => i.href === location.pathname)?.label ||
                     'Página'}
                  </span>
                </>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
