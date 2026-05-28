const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
	...(config.resolver.extraNodeModules || {}),
	'@react-navigation/native': path.resolve(__dirname, 'src/shims/react-navigation/native'),
	'@react-navigation/native-stack': path.resolve(__dirname, 'src/shims/react-navigation/native-stack'),
	'@react-navigation/bottom-tabs': path.resolve(__dirname, 'src/shims/react-navigation/bottom-tabs'),
};

module.exports = withNativeWind(config, { input: './global.css' });