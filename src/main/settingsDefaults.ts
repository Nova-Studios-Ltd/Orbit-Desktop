import { Theme } from '../types/enums';
import { Dictionary } from './dictionary';

export const defaultSettings = new Dictionary<number | string | boolean | Dictionary<number | string | boolean>>();

defaultSettings.setValue('Theme', Theme.Light);
