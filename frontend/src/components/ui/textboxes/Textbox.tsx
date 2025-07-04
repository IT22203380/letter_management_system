import { ChangeEvent } from 'react';
import getIconComponent from '../IconMapper';

type Props = {
    iconName?: string; // Input MUI icon name
    iconSize?: number; // Icon size, default is 20
    iconColor?: string; // Icon color E.g.: #6B7280
    placeholder?: string; // Placeholder text
    placeHolder?: string; // Placeholder text
    textBoxType?: string; // Type of the textbox (E.G.: text of password)
    type?: string; // Type of the textbox (E.G.: text or password)
    value?: string; // Value
    min?: number; // Minimum number of characters allowed
    max?: number; // Minimum number of characters allowed
    className?: string; // Additional classes
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
    required?: boolean;
    disabled?: boolean;
    error?: string; // Error message to display below the input
};

function Textbox({ 
    iconName, 
    iconSize = 20, 
    iconColor = '#6B7280', 
    placeholder = "", 
    type = "text", 
    value, 
    onChange, 
    onBlur,
    min, 
    max, 
    className = "",
    required = false,
    disabled = false,
    error
}: Props) {
    return (
        <div className={`${className}`}>
            <div className={`flex items-center w-full px-3 py-2.5 rounded-sm border ${
                error ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100' : 'bg-white'}`}>
                {iconName && (
                    <span className="mr-2 text-gray-400">
                        {getIconComponent({ 
                            iconName, 
                            iconSize, 
                            iconColor: error ? '#EF4444' : iconColor 
                        })}
                    </span>
                )}
                <input
                    type={type}
                    className={`w-full outline-none bg-transparent text-gray-700 text-sm ${
                        disabled ? 'cursor-not-allowed' : ''
                    }`}
                    placeholder={placeholder}
                    minLength={min}
                    maxLength={max}
                    required={required}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled}
                />
            </div>
            {error && (
                <p className="mt-1 text-xs text-red-500">{error}</p>
            )}
        </div>
    );
}

export default Textbox;