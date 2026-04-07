const t = "(function(){try{var t=localStorage.getItem('dz-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}else{var d=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',d)}}catch(e){}})();", e = "dz-theme";
export {
  e as THEME_STORAGE_KEY,
  t as themeScript
};
