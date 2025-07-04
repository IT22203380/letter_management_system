import { useTranslation } from "react-i18next";

type Props = {
  lang1?: string; // 1st language
  lang2?: string; // 2nd language
  lang3?: string; // 3rd language
  paddingLeft?: string; // padding left
  paddingRight?: string; // padding right
  className?: string; // additional classes
  bgColor?: string; // background color
  activeButtonClass?: string; // custom class for active button
  inactiveButtonClass?: string; // custom class for inactive buttons
}

function LanguageButton({
  lang1 = "EN",
  lang2 = "සිං",
  lang3 = "த",
  paddingLeft = "pl-2",
  paddingRight = "pr-2",
  className = "",
  bgColor = "#FFFFFF",
  activeButtonClass = 'bg-[#6E2F74] text-white',
  inactiveButtonClass = 'bg-white text-gray-700 hover:bg-gray-100'
}: Props) {
  const { i18n } = useTranslation();

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  // Button style based on active state
  const getButtonClass = (langCode: string) => {
    const baseClass = `px-3 py-1 text-sm font-medium rounded-full transition-colors ${paddingLeft} ${paddingRight} ${className}`;
    const activeClass = i18n.language === langCode ? activeButtonClass : inactiveButtonClass;
    return `${baseClass} ${activeClass}`;
  };

  return (
    <div className={`flex items-center space-x-1 bg-[${bgColor}] rounded-full border border-gray-200 p-1 shadow-sm`}>
      <button
        onClick={() => handleLanguageChange('en')}
        className={getButtonClass('en')}
        title="English"
      >
        {lang1}
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={() => handleLanguageChange('si')}
        className={getButtonClass('si')}
        title="සිංහල"
      >
        {lang2}
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={() => handleLanguageChange('ta')}
        className={getButtonClass('ta')}
        title="தமிழ்"
      >
        {lang3}
      </button>
    </div>
  )
}


export default LanguageButton;