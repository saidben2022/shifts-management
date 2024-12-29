import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'nl', name: 'Nederlands' },
  ];

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
    // Store the language preference
    localStorage.setItem('preferredLanguage', value);
  };

  return (
    <Select
      defaultValue={i18n.language}
      onValueChange={handleLanguageChange}
    >
      <SelectTrigger className="w-[140px] bg-white">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
