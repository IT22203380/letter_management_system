import { useTranslation } from "react-i18next";

type FooterProps = {
    organization?: string;
    devUnit?: string;
    textColor?: string;
    bgColor?: string;
    footerHeight?: number;
    textSize?: number;
    className?: string;
};

function Footer({ 
    organization = "Election Commission of Sri Lanka", 
    devUnit = "Developed by the IT Unit", 
    textColor = "#FFFFFF", 
    bgColor = "#5B015B", 
    footerHeight = 42, 
    textSize = 12, 
    className 
}: FooterProps) {
    const { t } = useTranslation();
    const Version = import.meta.env.VITE_VERSION;
    const Srv = import.meta.env.VITE_SRV;
    
    return (
        <div>
            <footer
                className={`flex items-center justify-center p-4 text-center relative w-full ${className}`}
                style={{
                    backgroundColor: bgColor,
                    color: textColor,
                    height: footerHeight,
                    fontSize: textSize,
                }}
            >
                <p>© {new Date().getFullYear()} {t(organization)} | {devUnit} | All rights reserved | Version {Version} | Srv {Srv} </p>
            </footer>
        </div>
    )
}

export default Footer;