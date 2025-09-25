
import { useState } from 'react';
import { Check, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية', dir: 'rtl' }
];

const LanguageSelector = () => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const { t } = useTranslation();

  const handleLanguageChange = (langCode: string) => {
    changeLanguage(langCode);
  };

  const selectedLanguage = languages.find(lang => lang.code === currentLanguage) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 text-sm font-medium rounded-md px-3 py-1.5 hover:bg-gray-100 transition duration-200">
          <Globe size={18} />
          <span className="hidden sm:inline">{selectedLanguage.label}</span>
          <span className="sm:hidden">{selectedLanguage.code.toUpperCase()}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            className="flex items-center justify-between"
            onClick={() => handleLanguageChange(language.code)}
          >
            {language.label}
            {currentLanguage === language.code && <Check size={16} />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
