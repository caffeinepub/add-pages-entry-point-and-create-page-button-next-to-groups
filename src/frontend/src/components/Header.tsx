import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, LogIn, LogOut, Shield, User, Wallet } from "lucide-react";
import React from "react";
import { useView } from "../context/ViewContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";

export default function Header() {
  const navigate = useNavigate();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { currentView, setCurrentView } = useView();
  const { data: isAdmin } = useIsAdmin();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: "/" });
    } else {
      try {
        await login();
      } catch (error: any) {
        if (error?.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
        {/* Logo */}
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-2 font-bold text-lg text-primary"
        >
          <img
            src="/assets/generated/civworld-app-icon.dim_1024x1024.png"
            alt="CivWorld"
            className="w-8 h-8 rounded-lg object-cover"
          />
          <span className="hidden sm:block">CivWorld</span>
        </button>

        {/* Center: App/Wallet toggle */}
        {isAuthenticated && (
          <div className="flex items-center bg-muted rounded-full p-1 gap-1">
            <button
              type="button"
              onClick={() => {
                setCurrentView("app");
                navigate({ to: "/" });
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                currentView === "app"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              App
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentView("wallet");
                navigate({ to: "/wallet" });
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                currentView === "wallet"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Wallet
            </button>
          </div>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Admin link */}
          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: "/admin" })}
              className="h-9 w-9 rounded-full"
              title="Admin Panel"
            >
              <Shield className="w-4 h-4 text-primary" />
            </Button>
          )}

          {/* Profile */}
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: "/profile" })}
              className="h-9 w-9 rounded-full"
            >
              <User className="w-4 h-4" />
            </Button>
          )}

          {/* Login/Logout */}
          <Button
            onClick={handleAuth}
            disabled={isLoggingIn}
            size="sm"
            variant={isAuthenticated ? "outline" : "default"}
            className="rounded-full text-xs px-3 h-8"
          >
            {isLoggingIn ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : isAuthenticated ? (
              <>
                <LogOut className="w-3 h-3 mr-1" />
                Logout
              </>
            ) : (
              <>
                <LogIn className="w-3 h-3 mr-1" />
                Login
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
