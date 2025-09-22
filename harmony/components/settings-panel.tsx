"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { useSettings } from "@/contexts/settings-context";
import { RiQuillPenAiLine, RiSettingsLine } from "@remixicon/react";
import { Label } from "@/components/label";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import SliderControl from "@/components/slider-control";
import { Sheet, SheetTitle, SheetContent } from "@/components/sheet";
import * as React from "react";
import { ScrollArea } from "@/components/scroll-area";
import { ChatHistorySection } from "@/components/chat-history-section";

type SettingsPanelContext = {
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  togglePanel: () => void;
};

const SettingsPanelContext = React.createContext<SettingsPanelContext | null>(
  null,
);

function useSettingsPanel() {
  const context = React.useContext(SettingsPanelContext);
  if (!context) {
    throw new Error(
      "useSettingsPanel must be used within a SettingsPanelProvider.",
    );
  }
  return context;
}

const SettingsPanelProvider = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile(1024);
  const [openMobile, setOpenMobile] = React.useState(false);

  // Helper to toggle the sidebar.
  const togglePanel = React.useCallback(() => {
    return isMobile && setOpenMobile((open) => !open);
  }, [isMobile, setOpenMobile]);

  const contextValue = React.useMemo<SettingsPanelContext>(
    () => ({
      isMobile,
      openMobile,
      setOpenMobile,
      togglePanel,
    }),
    [isMobile, openMobile, setOpenMobile, togglePanel],
  );

  return (
    <SettingsPanelContext.Provider value={contextValue}>
      {children}
    </SettingsPanelContext.Provider>
  );
};
SettingsPanelProvider.displayName = "SettingsPanelProvider";

const SettingsPanelContent = () => {
  const id = React.useId();
  const { settings, updateWritingStyle, updateLanguage, updateMaxLength } = useSettings();

  const writingStyleMap = {
    '1': 'concise',
    '2': 'formal',
    '3': 'technical',
    '4': 'creative',
    '5': 'tabular',
    '6': 'mathematical',
    '7': 'map-searches',
    '8': 'joking'
  } as const;

  const languageMap = {
    '1': 'hinglish',
    '2': 'english',
    '3': 'punjabi',
    '4': 'marathi',
    '5': 'hindi'
  } as const;

  const reverseWritingStyleMap = Object.fromEntries(
    Object.entries(writingStyleMap).map(([key, value]) => [value, key])
  );

  const reverseLanguageMap = Object.fromEntries(
    Object.entries(languageMap).map(([key, value]) => [value, key])
  );

  return (
    <>
      {/* Sidebar header */}
      <div className="py-5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <RiQuillPenAiLine
            className="text-muted-foreground transition-colors duration-200"
            size={20}
            aria-hidden="true"
          />
          <h2 className="text-sm font-medium text-foreground transition-colors duration-200">
            My preferences
          </h2>
        </div>
      </div>

      {/* Sidebar content */}
      <div className="flex-1 overflow-hidden">
        {/* Chat presets section */}
        <div className="py-5 border-b border-border/50">
          <h3 className="text-xs font-medium uppercase text-muted-foreground mb-4 tracking-wide transition-colors duration-200">
            Chat presets
          </h3>
          <div className="space-y-4">

            {/* Writing style */}
            <div className="space-y-2">
              <Label htmlFor={`${id}-writing-style`} className="text-sm font-medium text-foreground transition-colors duration-200">
                Writing style
              </Label>
              <Select 
                value={reverseWritingStyleMap[settings.writingStyle]} 
                onValueChange={(value) => updateWritingStyle(writingStyleMap[value as keyof typeof writingStyleMap])}
              >
                <SelectTrigger
                  id={`${id}-writing-style`}
                  className="bg-background/50 backdrop-blur-sm hover:bg-background/80 focus:bg-background border-border/60 hover:border-border focus:border-primary/50 transition-all duration-200 h-9 text-sm"
                >
                  <SelectValue placeholder="Select writing style" />
                </SelectTrigger>
                <SelectContent
                  className="bg-background/95 backdrop-blur-md border-border/60 shadow-lg"
                  align="end"
                >
                  <SelectItem value="1" className="hover:bg-accent/50 focus:bg-accent/50 transition-colors duration-150">Concise</SelectItem>
                  <SelectItem value="2" className="hover:bg-accent/50 focus:bg-accent/50 transition-colors duration-150">Formal</SelectItem>
                  <SelectItem value="3" className="hover:bg-accent/50 focus:bg-accent/50 transition-colors duration-150">Technical</SelectItem>
                  <SelectItem value="4" className="hover:bg-accent/50 focus:bg-accent/50 transition-colors duration-150">Creative</SelectItem>
                  <SelectItem value="5" className="hover:bg-accent/50 focus:bg-accent/50 transition-colors duration-150">Tabular</SelectItem>
                  <SelectItem value="6" className="hover:bg-accent/50 focus:bg-accent/50 transition-colors duration-150">Mathematical</SelectItem>
                  <SelectItem value="7" className="hover:bg-accent/50 focus:bg-accent/50 transition-colors duration-150">Map Searches</SelectItem>
                  <SelectItem value="8" className="hover:bg-accent/50 focus:bg-accent/50 transition-colors duration-150">Joking</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor={`${id}-mode`} className="text-sm font-medium text-foreground transition-colors duration-200">
                Language
              </Label>
              <Select 
                value={reverseLanguageMap[settings.language]} 
                onValueChange={(value) => updateLanguage(languageMap[value as keyof typeof languageMap])}
              >
                <SelectTrigger
                  id={`${id}-mode`}
                  className="bg-background/50 backdrop-blur-sm hover:bg-background/80 focus:bg-background border-border/60 hover:border-border focus:border-primary/50 transition-all duration-200 h-9 text-sm"
                >
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent
                  className="bg-background/95 backdrop-blur-md border-border/60 shadow-lg"
                  align="end"
                >
                  <SelectItem value="1" className="hover:bg-accent/50 focus:bg-accent/50 transition-colors duration-150">Hinglish</SelectItem>
                  <SelectItem value="2" className="hover:bg-accent/50 focus:bg-accent/50 transition-colors duration-150">English</SelectItem>
                  <SelectItem value="3" className="hover:bg-accent/50 focus:bg-accent/50 transition-colors duration-150">Punjabi</SelectItem>
                  <SelectItem value="4" className="hover:bg-accent/50 focus:bg-accent/50 transition-colors duration-150">Marathi</SelectItem>
                  <SelectItem value="5" className="hover:bg-accent/50 focus:bg-accent/50 transition-colors duration-150">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Configurations section */}
        <div className="py-5 border-b border-border/50">
          <h3 className="text-xs font-medium uppercase text-muted-foreground mb-4 tracking-wide transition-colors duration-200">
            Configurations
          </h3>
          <div className="space-y-4">

            {/* Maximum length */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Label className="text-sm font-medium text-foreground transition-colors duration-200">
                  Maximum length
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    className="h-8 w-16 px-2 py-1 text-xs tabular-nums text-center bg-background/50 backdrop-blur-sm border-border/60 hover:border-border focus:border-primary/50 transition-all duration-200 shadow-none focus:bg-background"
                    type="number"
                    value={settings.maxLength}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = parseInt(e.target.value) || 512;
                      if (value >= 512 && value <= 4096) {
                        updateMaxLength(value);
                      }
                    }}
                    min={512}
                    max={4096}
                    step={128}
                  />
                  <span className="text-xs text-muted-foreground">chars</span>
                </div>
              </div>
              <div className="px-1">
                <input
                  type="range"
                  className="
                    w-full h-2 rounded-lg appearance-none cursor-pointer transition-all duration-200
                    bg-gradient-to-r from-muted/40 to-muted/60
                    dark:from-muted/60 dark:to-muted/40
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-primary
                    [&::-webkit-slider-thumb]:shadow-md
                    [&::-webkit-slider-thumb]:transition-all
                    [&::-webkit-slider-thumb]:duration-200
                    [&::-webkit-slider-thumb]:hover:scale-110
                    [&::-webkit-slider-thumb]:hover:shadow-lg
                    [&::-webkit-slider-thumb]:active:scale-95
                    [&::-moz-range-thumb]:appearance-none
                    [&::-moz-range-thumb]:h-4
                    [&::-moz-range-thumb]:w-4
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-primary
                    [&::-moz-range-thumb]:border-0
                    [&::-moz-range-thumb]:shadow-md
                    [&::-moz-range-thumb]:transition-all
                    [&::-moz-range-thumb]:duration-200
                    [&::-moz-range-thumb]:hover:scale-110
                    [&::-moz-range-track]:h-2
                    [&::-moz-range-track]:rounded-lg
                    [&::-moz-range-track]:bg-muted/50
                  "
                  value={settings.maxLength}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMaxLength(parseInt(e.target.value))}
                  min={512}
                  max={4096}
                  step={128}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>512</span>
                  <span>4096</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Chat History Section */}
        <div className="py-5">
          <ChatHistorySection />
        </div>
      </div>
    </>
  );
};
SettingsPanelContent.displayName = "SettingsPanelContent";

const SettingsPanel = () => {
  const { isMobile, openMobile, setOpenMobile } = useSettingsPanel();

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent className="w-72 px-4 md:px-6 py-0 bg-background/95 backdrop-blur-md border-border/60 shadow-xl [&>button]:hidden">
          <SheetTitle className="hidden">Settings</SheetTitle>
          <div className="flex h-full w-full flex-col">
            <SettingsPanelContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="w-[300px] px-4 md:px-6 h-full flex flex-col bg-background/50 backdrop-blur-sm border-l border-border/60">
        <SettingsPanelContent />
      </div>
    </ScrollArea>
  );
};
SettingsPanel.displayName = "SettingsPanel";

const SettingsPanelTrigger = ({
  onClick,
}: {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
  const { isMobile, togglePanel } = useSettingsPanel();

  if (!isMobile) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      className="px-3 py-2 h-9 bg-background/20 backdrop-blur-sm hover:bg-background/40 active:bg-background/60 border border-border/30 hover:border-border/60 transition-all duration-200 shadow-sm hover:shadow-md"
      onClick={(event) => {
        onClick?.(event);
        togglePanel();
      }}
    >
      <RiSettingsLine
        className="text-muted-foreground hover:text-foreground transition-colors duration-200 size-5"
        size={20}
        aria-hidden="true"
      />
      <span className="max-sm:sr-only ml-2 text-sm font-medium">Settings</span>
    </Button>
  );
};
SettingsPanelTrigger.displayName = "SettingsPanelTrigger";

export {
  SettingsPanel,
  SettingsPanelProvider,
  SettingsPanelTrigger,
  useSettingsPanel,
};
