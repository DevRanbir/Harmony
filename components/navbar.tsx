import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/button";
import Link from "next/link";

export function NavBar() {
  return (
    <nav className="border-b bg-card/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-2xl text-foreground hover:text-primary transition-colors">
          Harmony
        </Link>
        
        <div className="flex items-center gap-4">
          <Link href="/prices">
            <Button variant="ghost">Pricing</Button>
          </Link>
          
          <SignedOut>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </SignedOut>
          
          <SignedIn>
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}
