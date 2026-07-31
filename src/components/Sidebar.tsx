"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Gauge, History, MessageCircle, Radar, Scale, type LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  sub?: string;
  icon: LucideIcon;
}

const PRIMARY: NavItem[] = [{ href: "/chat", label: "AI助手", sub: "对话式引导", icon: MessageCircle }];

const TOOLS: NavItem[] = [
  { href: "/factors", label: "因子分析", icon: Gauge },
  { href: "/history", label: "我的记录", icon: History },
];

const FORMS: NavItem[] = [
  { href: "/recommend", label: "该卖什么", icon: Compass },
  { href: "/evaluate", label: "该不该上架", icon: Scale },
];

function NavLink({ item, active, compact }: { item: NavItem; active: boolean; compact?: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      title={item.label}
      className={`group flex items-center justify-center gap-2.5 rounded-md px-2.5 text-sm transition-colors sm:justify-start ${
        compact ? "py-2 text-[13px]" : "py-2.5 sm:py-2"
      } ${
        active
          ? "bg-sidebar-hover text-sidebar-foreground-active"
          : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-foreground-active"
      }`}
    >
      <Icon
        size={compact ? 14 : 16}
        strokeWidth={2}
        className={`shrink-0 ${active ? "text-accent-on-dark" : "text-sidebar-foreground/70 group-hover:text-accent-on-dark"}`}
      />
      {item.sub ? (
        <span className="hidden flex-col leading-tight sm:flex">
          <span className="font-medium">{item.label}</span>
          <span className="text-[11px] text-sidebar-foreground/60">{item.sub}</span>
        </span>
      ) : (
        <span className="hidden sm:inline">{item.label}</span>
      )}
    </Link>
  );
}

function NavSection({ title, items, compact, pathname }: { title: string; items: NavItem[]; compact?: boolean; pathname: string }) {
  return (
    <>
      <p className="hidden px-2.5 pb-1.5 pt-4 text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/60 first:pt-3 sm:block">
        {title}
      </p>
      {items.map((item) => (
        <NavLink key={item.href} item={item} active={pathname === item.href} compact={compact} />
      ))}
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-16 shrink-0 flex-col bg-sidebar sm:w-60">
      <Link href="/" className="flex items-center gap-2.5 px-3.5 py-5 sm:px-5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-sidebar-foreground-active">
          <Radar size={18} strokeWidth={2.25} />
        </span>
        <span className="hidden flex-col leading-tight sm:flex">
          <span className="text-[13px] font-semibold text-sidebar-foreground-active">大麦AI选品</span>
          <span className="text-[11px] text-sidebar-foreground">可研报告</span>
        </span>
      </Link>

      <nav className="mt-2 flex flex-col gap-0.5 px-2 sm:px-3">
        <NavSection title="开始" items={PRIMARY} pathname={pathname} />
        <NavSection title="工具" items={TOOLS} compact pathname={pathname} />
        <NavSection title="直接填表" items={FORMS} compact pathname={pathname} />
      </nav>

      <div className="mt-auto hidden px-5 py-4 sm:block">
        <p className="text-[11px] leading-relaxed text-sidebar-foreground/50">
          数据收集 → 核心因子分析 →<br />分析报告 → 上架建议
        </p>
      </div>
    </aside>
  );
}
