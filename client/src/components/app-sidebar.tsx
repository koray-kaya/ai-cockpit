import {
  LayoutDashboard,
  Brain,
  BookOpen,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Skills", url: "/skills", icon: Brain },
  { title: "Journal", url: "/journal", icon: BookOpen },
];

function LogoMark() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      aria-label="AI Cockpit"
      className="shrink-0"
    >
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        className="fill-primary-foreground"
        style={{ fontSize: "14px", fontWeight: 700, fontFamily: "var(--font-sans)" }}
      >
        KK
      </text>
    </svg>
  );
}

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-3">
        <Link href="/" className="flex items-center gap-2.5 px-1">
          <LogoMark />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold tracking-tight text-foreground">AI Cockpit</span>
            <span className="text-[10px] text-muted-foreground leading-tight">Personal AI Coach</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location === item.url || (item.url !== "/" && location.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.url} data-testid={`nav-${item.title.toLowerCase()}`}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3 group-data-[collapsible=icon]:hidden">
        <div className="text-[10px] text-muted-foreground leading-relaxed">
          Koray Kaya<br />
          Apr 2026 → Jan 2027
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
