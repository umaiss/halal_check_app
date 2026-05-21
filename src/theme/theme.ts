const Theme = {
    color: {
        BACKGROUND_COLOR: "#fff",
        COLOR_TEXT: '#413A56',
        COLOT_SUBTEXT: '#757575',
        COLOR_LIGHT_TEXT: '#413A56',
        COLOR_LIGHT_GRAY: '#8e8b9b',
        COLOR_BLUE: '#5BAEFC',
        COLOR_YELLOW: '#EFD046',
        COLOR_STROKE: '#EFEFEF',
        COLOR_PURPLE: '#413A56',
        COLOR_WHITE: "#FFFFFF",
        COLOR_RED: '#FF0000',
        BLACK: 'rgba(0, 0, 0, 1)',
        TRANSPARENT: 'transparent',

        // Premium Redesign Brand Colors
        COLOR_PRIMARY_GREEN: '#0E7955',
        COLOR_PRIMARY_GREEN_BG: '#E5F2EC',
        COLOR_HALAL: '#0E7955',
        COLOR_HALAL_BG: '#E5F2EC',
        COLOR_HARAM: '#E05353',
        COLOR_HARAM_BG: '#FCEBEB',
        COLOR_DOUBTFUL: '#E4A11B',
        COLOR_DOUBTFUL_BG: '#FCF3DD',
        COLOR_INK: '#0F1411',
        COLOR_MUTED: '#5C6661',
        COLOR_MUTED_2: '#8E9994',
        COLOR_BG: '#F4F6F5',
        COLOR_BORDER: '#ECEFF1',
    },

    fonts: {
        FONT_NUNITO_MEDIUM: 'Nunito-Medium',
        FONT_NUNITO_REGULAR: 'Nunito-Regular',
        FONT_NUNITO_EXTRABOLD: 'Nunito-ExtraBold',
        FONT_NUNITO_EXTRABOLD_ITALIC: 'Nunito-ExtraBoldItalic',
    },
    linearGradientColors: {
        darkGrayGradient: ['rgba(0, 0, 0, .79)', 'rgba(0, 0, 0, .59)', 'rgba(0, 0, 0, 0)'],
        darkGrayGradient69: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.55)', 'rgba(0, 0, 0, 0.69)'],
        eveningGradientModalColor: ['rgba(65, 58, 86, 1)', 'rgba(47, 46, 53, 1)']
    },
    shadows: {
        sh_card: {
            shadowColor: '#0F1411',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 3,
        },
        sh_button: {
            shadowColor: '#0E7955',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 15,
            elevation: 5,
        },
        sh_glow_halal: {
            shadowColor: '#2EA873',
            shadowOffset: { width: 0, height: 16 },
            shadowOpacity: 0.4,
            shadowRadius: 24,
            elevation: 8,
        },
        sh_glow_haram: {
            shadowColor: '#E05353',
            shadowOffset: { width: 0, height: 16 },
            shadowOpacity: 0.4,
            shadowRadius: 24,
            elevation: 8,
        },
        sh_glow_doubtful: {
            shadowColor: '#E4A11B',
            shadowOffset: { width: 0, height: 16 },
            shadowOpacity: 0.4,
            shadowRadius: 24,
            elevation: 8,
        }
    }
};
export default Theme;