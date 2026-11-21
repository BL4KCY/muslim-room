'use client';

export { default } from './app/page';
export { default as App } from './app/page';
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
