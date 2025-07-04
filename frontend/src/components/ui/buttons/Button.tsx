import { useState } from 'react';
import getIconComponent from '../IconMapper';

type Props = {
    buttonText: string; // Button text
    buttonColor?: string; // Button color (E.g: #3B0043)
    buttonStyle?: number; // Choose the button style (Two styles, 1 = Regular button, 2 = Action button)
    textColor?: string; // Button text color
    iconName?: string; // Input MUI icon name
    iconSize?: number; // Icon size, default is 32
    className?: string; // Extended styles
    onClick?: () => void; // Handle submit
    buttonType?: 'button' | 'submit' | 'reset'; // E.g: 'button' or 'submit'
    disabled?: boolean; // Disabled state
    fullWidth?: boolean; // Full width button
};

function Button({ 
    buttonText, 
    buttonType = "button", 
    textColor = "white", 
    buttonColor = "#6E2F74", 
    buttonStyle = 2, 
    iconName, 
    iconSize = 20,
    className = "",
    onClick,
    disabled = false,
    fullWidth = true
}: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (disabled || isSubmitting) return;
        
        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            await onClick?.();
        } catch (error) {
            console.error("Submit failed", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const baseClasses = `inline-flex items-center justify-center px-4 py-2.5 rounded-sm text-sm font-medium transition-colors ${fullWidth ? 'w-full' : ''}`;
    const style1Classes = `bg-white border-2 border-[${buttonColor}] text-[${textColor}] hover:border-[#6E2F74] hover:text-[#6E2F74] hover:font-medium`;
    const style2Classes = `bg-[${buttonColor}] text-white hover:bg-[#5B005B]`;
    
    const buttonClasses = `
        ${baseClasses}
        ${buttonStyle === 1 ? style1Classes : style2Classes}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
    `;

    return (
        <button
            type={buttonType}
            onClick={buttonType === 'button' ? handleSubmit : undefined}
            className={buttonClasses.trim()}
            disabled={disabled || isSubmitting}
        >
            <div className="flex items-center gap-2">
                {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                    <>
                        <span>{buttonText}</span>
                        {iconName && getIconComponent({
                            iconName,
                            iconSize,
                            iconColor: buttonStyle === 1 ? textColor : 'white',
                        })}
                    </>
                )}
            </div>
        </button>
    );
}

export default Button;