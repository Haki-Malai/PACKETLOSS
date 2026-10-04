import { developmentSettings } from './config';
import { createDevelopmentApp } from './development-app';

export const { handler } = createDevelopmentApp(developmentSettings());
