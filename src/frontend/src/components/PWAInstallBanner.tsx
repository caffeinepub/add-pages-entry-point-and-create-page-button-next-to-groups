import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa-install-dismissed";

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY) === "true") return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setVisible(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setVisible(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "true");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-[68px] left-3 right-3 z-50 sm:left-auto sm:right-4 sm:w-[360px]"
          data-ocid="pwa.panel"
        >
          <div className="bg-primary rounded-2xl shadow-2xl p-4 flex items-center gap-3">
            <div className="shrink-0 bg-white/20 rounded-xl p-2">
              <Download className="w-5 h-5 text-white" />
            </div>
            <p className="flex-1 text-sm text-white font-medium leading-snug">
              Install CivWorld on your device for a better experience
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                onClick={handleInstall}
                className="bg-white text-primary hover:bg-white/90 font-semibold text-xs px-3 h-8 rounded-xl"
                data-ocid="pwa.primary_button"
              >
                Install App
              </Button>
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Dismiss install banner"
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                data-ocid="pwa.close_button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
