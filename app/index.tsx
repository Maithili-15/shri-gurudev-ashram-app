import React from 'react';
import { NavigationIndependentTree } from '@react-navigation/native';
import App from '../App';

export default function HomeRoute() {
  return (
    <NavigationIndependentTree>
      <App />
    </NavigationIndependentTree>
  );
}