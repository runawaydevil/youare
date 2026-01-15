// Type declarations for CSS modules and CSS imports
declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Cesium CSS imports
declare module 'cesium/Build/Cesium/Widgets/widgets.css' {
  const content: string;
  export default content;
}

declare module 'cesium/Widgets/widgets.css' {
  const content: string;
  export default content;
}
