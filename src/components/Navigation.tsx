import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { useAuth, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import SkillMentorLogo from "@/assets/logo.webp";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

export function Navigation() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = (user?.publicMetadata?.roles as string[] | undefined)?.includes("ADMIN");

  return (
    <header className="sticky top-0 z-50 py-2 text-white w-full bg-black backdrop-blur supports-[backdrop-filter]:bg-black/90">
      <div className="container flex flex-wrap h-14 items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img src={SkillMentorLogo} alt="SkillMentor Logo" className="size-12 rounded-full" />
            <span className="font-semibold text-xl">SkillMentor</span>
          </Link>
          <nav className="ml-6 hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/" className="hover:text-primary transition-colors">Tutors</Link>
            <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
            <Link to="/resources" className="hover:text-primary transition-colors">Resources</Link>
            {isAdmin && (
              <Link to="/admin/bookings" className="hover:text-primary transition-colors text-yellow-400">
                Admin Panel
              </Link>
            )}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {isSignedIn ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
            </>
          ) : (
            <>
              <SignInButton forceRedirectUrl="/redirect" mode="modal">
                <Button variant="ghost">Login</Button>
              </SignInButton>
              <Link to="/login">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Menu className="size-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-black text-white p-6">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <Link to="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                    <img src={SkillMentorLogo} alt="SkillMentor Logo" className="size-10 rounded-full" />
                    <span className="font-semibold text-lg">SkillMentor</span>
                  </Link>
                </div>
                <nav className="flex flex-col gap-4 text-sm font-medium flex-1">
                  <Link to="/" className="hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>Tutors</Link>
                  <Link to="/about" className="hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>About Us</Link>
                  <Link to="/resources" className="hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>Resources</Link>
                  {isAdmin && (
                    <Link to="/admin/bookings" className="hover:text-primary transition-colors text-yellow-400" onClick={() => setIsOpen(false)}>
                      Admin Panel
                    </Link>
                  )}
                </nav>
                <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
                  {isSignedIn ? (
                    <>
                      <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full">Dashboard</Button>
                      </Link>
                      <div className="flex justify-center">
                        <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
                      </div>
                    </>
                  ) : (
                    <>
                      <SignInButton forceRedirectUrl="/redirect" mode="modal">
                        <Button variant="ghost" className="w-full">Login</Button>
                      </SignInButton>
                      <Link to="/login" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                          Sign up
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}