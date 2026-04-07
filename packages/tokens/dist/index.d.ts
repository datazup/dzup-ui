/**
 * The localStorage key used for theme persistence.
 * Must match the key used in DzThemeProvider.
 */
export declare const THEME_STORAGE_KEY = "dz-theme";

/**
 * Inline script string for `<head>`.
 * Reads `localStorage('dz-theme')`, resolves 'system' to actual preference,
 * and sets `data-theme` on `document.documentElement`.
 */
export declare const themeScript = "(function(){try{var t=localStorage.getItem('dz-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}else{var d=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',d)}}catch(e){}})();";

export { }
