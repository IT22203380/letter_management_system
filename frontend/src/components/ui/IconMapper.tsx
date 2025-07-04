import * as Icons from '@mui/icons-material';

type Props = {
    iconName: string; // Icon name ('Home', 'Dashboard', 'Settings')
    iconSize?: number; // Adjust icon size
    iconColor?: string; // Icon color
    marginRight?: number; // Margin between icon and the content
    className?: string; // Add className prop
}

const getIconComponent = ({ 
    iconName, 
    iconSize = 24, 
    marginRight = 8, 
    iconColor = "#6E2F74",
    className = '' // Add className with default empty string
}: Props): React.ReactElement | null => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? (
        <IconComponent 
            style={{ 
                fontSize: iconSize, 
                marginRight: marginRight, 
                color: iconColor 
            }}
            className={className} // Pass className to the icon
        />
    ) : null;
};

export default getIconComponent;