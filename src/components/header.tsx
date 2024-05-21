import { ThemeToggle } from "@/components/theme-toggle";
import { Link } from "wouter";
import { ServerCog, Settings } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="flex h-16 items-center justify-between px-4">
        {/* TODO add mobile menu <MenuIcon className="md:hidden" />*/}

        <Link href="/" className="flex items-center justify-between gap-2">
          <ServerCog className="h-5 w-5" />
          <h1 className="font-semibold">campaign manager</h1>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/settings">
            <Settings />
          </Link>
          {/*TODO add bell and notification pane listing e.g. errors <Bell />*/}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
