/**
 * Taskerino - A delightful task management app
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Taskerino from './Taskerino';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F6F3" />
      <Taskerino />
    </SafeAreaProvider>
  );
}

export default App;
