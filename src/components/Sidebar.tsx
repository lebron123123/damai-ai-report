"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Scale, Radar } from "lucide-react";

const NAV = [
  { href: "/recommend", label: "该卖什么", sub: "选品推荐", icon: Compass },
  { href: "/evaluate", label: "该不该上架", sub: "单品诊断", icon: Scale },
];

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
        <p className="hidden px-2.5 pb-1.5 pt-3 text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/60 sm:block">
          AI功能
        </p>
        {NAV.map(({ href, label, sub, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`group flex items-center justify-center gap-2.5 rounded-md px-2.5 py-2.5 text-sm transition-colors sm:justify-start sm:py-2 ${
                active
                  ? "bg-sidebar-hover text-sidebar-foreground-active"
                  : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-foreground-active"
              }`}
            >
              <Icon size={16} strokeWidth={2} className={`shrink-0 ${active ? "text-accent-on-dark" : "text-sidebar-foreground/70 group-hover:text-accent-on-dark"}`} />
              <span className="hidden flex-col leading-tight sm:flex">
                <span className="font-medium">{label}</span>
                <span className="text-[11px] text-sidebar-foreground/60">{sub}</span>
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden px-5 py-4 sm:block">
        <p className="text-[11px] leading-relaxed text-sidebar-foreground/50">
          数据收集 → 核心因子分析 →<br />分析报告 → 上架建议
        </p>
      </div>
    </aside>
  );
}
