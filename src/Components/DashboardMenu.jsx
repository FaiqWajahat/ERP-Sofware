"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Package,
  Settings,
  BadgeCheck,
  Warehouse,
  ShieldCheck,
  Wallet,
  ChevronRight
} from "lucide-react";

import { useLanguage } from "@/stores/language";

// --- Configuration ---
const mainMenu = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/Dashboard",
  },
  {
    title: "Projects",
    icon: Warehouse,
    children: [
      { title: "All Projects", href: "/Dashboard/Projects" },
    
      { title: "Add Project", href: "/Dashboard/Projects/Add" },
    ]
  },
  {
    title: "Employees",
    icon: Users,
    children: [
      { title: "All Employees", href: "/Dashboard/Employees" },
      { title: "Add Employee", href: "/Dashboard/Employees/Add" },
      { title: "Expenses / Claims", href: "/Dashboard/Employees/Expense" },
    ],
  },
  {
    title: "Company Assets",
    icon: Package,
    children: [
      { title: "All Assets", href: "/Dashboard/Company-Assets" },
      { title: "Add Asset", href: "/Dashboard/Company-Assets/Add" },
    ],
  },
  {
    title: "Attendance",
    icon: ClipboardCheck,
    children: [
      { title: "Mark Attendance", href: "/Dashboard/Attendance/Mark" },
      { title: "History", href: "/Dashboard/Attendance" },
    ],
  },
   {
    title: "Quotations",
    icon: ShieldCheck,
    children: [
      { title: "All Quotations", href: "/Dashboard/Quotations" },
      { title: "Add Quotation", href: "/Dashboard/Quotations/Add" },
    ],
  },
  {
    title: "Salary",
    icon: Wallet,
    children: [
      { title: "All Salary Lists", href: "/Dashboard/Salary" },
      { title: "Add Salary List", href: "/Dashboard/Salary/Add" },
      {title:  "Pay Salary", href: "/Dashboard/Salary/Pay" },
    ],
  },
 
  {
    title:"Foremans",
    icon: Users,
    href: "/Dashboard/Foremans",
  },
  
  
  
];

const accountMenu = [
  {
    title: "Settings",
    icon: Settings,
    children: [
      { title: "Theme Color", href: "/Dashboard/Setting/Theme" },
      { title: "Font Style", href: "/Dashboard/Setting/Fonts" },
    ],
  },
  {
    title: "System Users",
    icon: ShieldCheck,
    href: "/Dashboard/Users",
  },
  { 
    title: "My Profile", 
    icon: BadgeCheck, 
    href: "/Dashboard/Profile" 
  },
];

// --- Components ---

const SidebarItem = ({ item, activeHref }) => {
  const { t } = useLanguage();
  const Icon = item.icon;

  // Check if this item is the exact active one
  const isActive = item.href === activeHref;

  // Check if one of the children is the active one (to expand the menu)
  const hasActiveChild = item.children?.some(
    (child) => child.href === activeHref
  );

  // Dropdown item
  if (item.children) {
    return (
      <li>
        <details className="group" open={hasActiveChild}>
          <summary
            className={`flex items-center justify-between px-4 py-1.5 rounded-md cursor-pointer transition-all duration-300 select-none
            ${hasActiveChild
              ? "text-[var(--primary-color)] font-semibold bg-base-200"
              : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-sm">{t[item.title]}</span>
            </div>

            <ChevronRight
              className={`w-4 h-4 transition-transform duration-300 group-open:rotate-90
                ${hasActiveChild ? "text-[var(--primary-color)]" : "text-base-content/40"}`}
            />
          </summary>

          <ul className="mt-2 ml-4 border-l-2 border-base-200 pl-2 space-y-1">
            {item.children.map((child, index) => {
              const isChildActive = child.href === activeHref;

              return (
                <li key={index}>
                  <Link
                    href={child.href}
                    className={`block px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 
                      ${isChildActive
                        ? "bg-[var(--primary-color)] text-white shadow-[var(--primary-color)]/20"
                        : "text-base-content/60 hover:text-base-content hover:bg-base-200"
                      }`}
                  >
                    {t[child.title]}
                  </Link>
                </li>
              );
            })}
          </ul>
        </details>
      </li>
    );
  }

  // Single link
  return (
    <li>
      <Link
        href={item.href || "#"}
        className={`flex items-center gap-3 px-4 py-1.5 rounded-md transition-all duration-200 select-none font-medium 
          ${isActive
            ? "bg-[var(--primary-color)] text-white shadow-[var(--primary-color)]/20"
            : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
          }`}
      >
        <Icon className="w-5 h-5" strokeWidth={1.5} />
        <span className="text-sm">{t[item.title]}</span>
      </Link>
    </li>
  );
};

const DashboardMenu = () => {
  const pathname = usePathname();
  const { t } = useLanguage();

  // --- LOGIC: Find the Best Matching Menu Item ---
  // We use useMemo to avoid recalculating on every render, only when pathname changes
  const activeHref = useMemo(() => {
    // 1. Combine all menus
    const allItems = [...mainMenu, ...accountMenu];
    
    // 2. Flatten recursive structure to get a simple list of all links { href, ... }
    const flatten = (items) => {
      let flat = [];
      items.forEach(item => {
        if (item.href) flat.push(item);
        if (item.children) flat = flat.concat(flatten(item.children));
      });
      return flat;
    };
    
    const allLinks = flatten(allItems);

    // 3. Find all links that match the start of the current pathname
    // e.g. If path is "/Dashboard/Projects/Add", matches are ["/Dashboard", "/Dashboard/Projects", "/Dashboard/Projects/Add"]
    const matches = allLinks.filter(item => 
      pathname === item.href || 
      (pathname.startsWith(item.href) && pathname[item.href.length] === '/')
    );

    // 4. Sort by length descending (longest match is the most specific one)
    matches.sort((a, b) => b.href.length - a.href.length);

    // 5. Return the longest match
    return matches.length > 0 ? matches[0].href : null;

  }, [pathname]);

  return (
    <div className="w-full h-full flex flex-col justify-between px-2 bg-base-100">
      
      <div className="space-y-6">
        <div>
          <p className="px-4 mb-3 text-[11px] font-bold text-base-content/40 uppercase tracking-widest">
            {t["Main Menu"] || "Main Menu"}
          </p>

          <ul className="space-y-1">
            {mainMenu.map((item, index) => (
              <SidebarItem key={index} item={item} activeHref={activeHref} />
            ))}
          </ul>
        </div>
      </div>

      <div>
        <p className="px-4 mb-3 mt-6 text-[11px] font-bold text-base-content/40 uppercase tracking-widest">
          {t["System"] || "System"}
        </p>

        <ul className="space-y-1">
          {accountMenu.map((item, index) => (
            <SidebarItem key={index} item={item} activeHref={activeHref} />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DashboardMenu;