import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextProps,
  TextStyle,
} from 'react-native';
import { width } from '../../utils/dimensions';
import Theme from '../../theme/theme';

type TextAlign = "auto" | "left" | "right" | "center" | "justify" | undefined
interface CommonTextProps {
  children?: React.ReactNode;
  size?: number;
  textAlign?: TextAlign;
  color?: string;
  textStyles?: TextStyle;
  textProps?: TextProps;
  onPress?: () => void;
  fontFamily?: string;
  numberOfLines?: number;
}

interface UnderlineTextProps extends CommonTextProps {
  textDecorationLine?: TextStyle['textDecorationLine'];
}

export const LargeText: React.FC<CommonTextProps> = ({
  children = '',
  color = Theme.color.COLOR_TEXT,
  textStyles = {},
  size = 6.5,
  textAlign = 'auto',
  textProps,
  onPress,
  fontFamily = Theme.fonts.FONT_NUNITO_EXTRABOLD,
  numberOfLines,
}) => {
  const styles = StyleSheet.create({
    text: {
      color,
      fontFamily,
      fontSize: width(size),
      textAlign,
    },
  });

  return (
    <Pressable disabled={!onPress} onPress={onPress}>
      <Text style={[styles.text, textStyles]} numberOfLines={numberOfLines} {...textProps}>
        {children}
      </Text>
    </Pressable>
  );
};

export const MediumText: React.FC<CommonTextProps> = ({
  children = '',
  size = 4.5,
  textAlign,
  color = Theme.color.COLOR_TEXT,
  textStyles,
  textProps,
  onPress,
  fontFamily = Theme.fonts.FONT_NUNITO_MEDIUM,
  numberOfLines,
}) => {
  const styles = StyleSheet.create({
    text: {
      color,
      fontFamily,
      fontSize: width(size),
      textAlign,
    },
  });

  return (
    <Pressable disabled={!onPress} onPress={onPress}>
      <Text style={[styles.text, textStyles]} numberOfLines={numberOfLines} {...textProps}>
        {children}
      </Text>
    </Pressable>
  );
};

export const SmallText: React.FC<CommonTextProps> = ({
  children = '',
  size = 4,
  textAlign,
  color = Theme.color.COLOR_TEXT,
  textStyles,
  textProps,
  onPress,
  fontFamily = Theme.fonts.FONT_NUNITO_REGULAR,
  numberOfLines,
}) => {
  const styles = StyleSheet.create({
    text: {
      color,
      fontFamily,
      fontSize: width(size),
      textAlign,
    },
  });

  return (
    <Pressable disabled={!onPress} onPress={onPress}>
      <Text style={[styles.text, textStyles]} numberOfLines={numberOfLines} {...textProps}>
        {children}
      </Text>
    </Pressable>
  );
};

export const UnderLineText: React.FC<UnderlineTextProps> = ({
  children = '',
  size = 4.5,
  textAlign,
  color = Theme.color.COLOR_TEXT,
  textStyles,
  textProps,
  onPress,
  textDecorationLine = 'underline',
  fontFamily = Theme.fonts.FONT_NUNITO_REGULAR,
  numberOfLines,
}) => {
  const styles = StyleSheet.create({
    text: {
      color,
      fontFamily,
      fontSize: width(size),
      textAlign,
      textDecorationLine,
    },
  });

  return (
    <Pressable disabled={!onPress} onPress={onPress}>
      <Text style={[styles.text, textStyles]} numberOfLines={numberOfLines} {...textProps}>
        {children}
      </Text>
    </Pressable>
  );
};
