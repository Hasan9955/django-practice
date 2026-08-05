"use client";

import React, { useState, useEffect } from "react";
import { Globe, Loader2 } from "lucide-react";
import { useGoogleTranslate } from "./useGoogleTranslate";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/select";

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
];

export const LanguageSwitcher: React.FC = () => {
  const { currentLanguage, translateTo, isReady } = useGoogleTranslate();
  const [isChanging, setIsChanging] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLanguageChange = async (newLanguage: string) => {
    if (newLanguage === currentLanguage || isChanging) return;
    setIsChanging(true);
    try {
      translateTo(newLanguage);
    } catch (error) {
      console.error("Error changing language:", error);
      setIsChanging(false);
    }
  };

  const currentLang = LANGUAGES.find((l) => l.code === currentLanguage);

  // Loading skeleton
  if (!mounted || !isReady) {
    return (
      <div className="flex items-center gap-1">
        <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0 sm:hidden" />
        <div className="w-7 h-7 sm:w-[100px] sm:h-8 lg:w-[120px] lg:h-9 bg-muted rounded-md animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0 sm:hidden" />

      <Select
        value={currentLanguage}
        onValueChange={handleLanguageChange}
        disabled={isChanging}
      >
        <SelectTrigger
          className="
            h-7 w-7 p-0 justify-center
            sm:h-8 sm:w-[100px] sm:px-2.5 sm:justify-between
            lg:h-9 lg:w-[120px] lg:px-3
            text-xs sm:text-sm
            border rounded-md
          "
        >
          {isChanging ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <>
              <SelectValue placeholder="Language" />
              <span className="sm:hidden font-medium uppercase text-xs">
                {currentLanguage}
              </span>
              <span className="hidden sm:inline">{currentLang?.name}</span>
            </>
          )}
        </SelectTrigger>

        <SelectContent className="w-36 sm:w-40 lg:w-44">
          {LANGUAGES.map((language) => (
            <SelectItem
              key={language.code}
              value={language.code}
              className="text-xs sm:text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono uppercase text-[10px] text-muted-foreground w-6 shrink-0">
                  {language.code}
                </span>
                <span>{language.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
