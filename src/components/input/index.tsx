import React, {
    forwardRef,
    useState,
    ForwardedRef,
} from 'react';
import {
    TextInput,
    TextInputProps,
    View,
    Text,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { SmallText } from '../text';
import { CommonStyles } from '../../utils';
import styles from './styles';
import Theme from '../../theme/theme';

interface InputProps {
    inputStyle?: TextStyle;
    containerStyle?: ViewStyle;
    placeholder?: string;
    placeholderColor?: string;
    inputProps?: TextInputProps;
    keyboardType?: TextInputProps['keyboardType'];
    onSubmitEditing?: TextInputProps['onSubmitEditing'];
    returnKeyType?: TextInputProps['returnKeyType'];
    secureTextEntry?: boolean;
    control?: any; // for react-hook-form
    name?: string;
    label?: string;
    inputContainer?: ViewStyle;
    renderRightIcon?: React.ReactNode;
    mandatory?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
    onChangeText?: (text: string) => void;
    value?: string;
    error?: string;
    icon?: React.ReactNode;
    variant?: 'light' | 'glass';
}

function Input({
        inputStyle = {},
        containerStyle = {},
        placeholder,
        placeholderColor,
        inputProps,
        keyboardType = 'default',
        onSubmitEditing,
        returnKeyType = 'default',
        secureTextEntry = false,
        control,
        name,
        label,
        inputContainer,
        renderRightIcon,
        mandatory = false,
        onFocus,
        onBlur,
        onChangeText,
        value,
        error,
        icon,
        variant = 'light'
    }: InputProps,
    ref: ForwardedRef<TextInput>) {

    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => {
        setIsFocused(true);
        if (onFocus) onFocus();
    };

    const handleBlur = () => {
        setIsFocused(false);
        if (onBlur) onBlur();
    };

    const containerVariantStyle = {
        light: {
            backgroundColor: '#FFFFFF',
            borderColor: isFocused ? Theme.color.COLOR_PRIMARY_GREEN : '#ECEFF1',
        },
        glass: {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderColor: isFocused ? '#FFFFFF' : 'rgba(255, 255, 255, 0.15)',
        }
    }[variant];

    const inputVariantStyle = {
        light: {
            color: Theme.color.COLOR_INK,
        },
        glass: {
            color: '#FFFFFF',
        }
    }[variant];

    const finalPlaceholderColor = placeholderColor || (variant === 'glass' ? 'rgba(255, 255, 255, 0.5)' : Theme.color.COLOR_MUTED);
    const labelColor = variant === 'glass' ? 'rgba(255, 255, 255, 0.9)' : Theme.color.COLOR_INK;

    return (
        <View style={[styles.container, containerStyle]}>
            {label ? (
                <SmallText 
                    size={3.5} 
                    color={labelColor} 
                    textStyles={CommonStyles.marginLeft_2}
                    fontFamily={Theme.fonts.FONT_NUNITO_MEDIUM}
                >
                    {label}
                    {mandatory && <Text style={{ color: Theme.color.COLOR_RED }}> *</Text>}
                </SmallText>
            ) : null}

            <View
                style={[
                    styles.inputContainer,
                    containerVariantStyle,
                    inputContainer,
                ]}
            >
                {icon && icon}
                <TextInput
                    ref={ref}
                    placeholder={placeholder}
                    placeholderTextColor={finalPlaceholderColor}
                    style={[styles.input, inputVariantStyle, inputStyle]}
                    onChangeText={onChangeText}
                    value={value}
                    blurOnSubmit={false}
                    keyboardType={keyboardType}
                    onSubmitEditing={onSubmitEditing}
                    returnKeyType={returnKeyType}
                    secureTextEntry={secureTextEntry}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...inputProps}
                />
                {renderRightIcon}
            </View>

            {error ? (
                <SmallText textStyles={CommonStyles.marginLeft_2} color={Theme.color.COLOR_RED} size={2.9}>
                    *{error}
                </SmallText>
            ) : null}
        </View>
    );
}

export default forwardRef<TextInput, InputProps>(Input);
