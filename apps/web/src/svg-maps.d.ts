declare module '@svg-maps/brazil' {
  export interface Location {
    name: string;
    id: string;
    path: string;
  }

  export interface SVGMap {
    label: string;
    viewBox: string;
    locations: Location[];
  }

  const map: SVGMap;
  export default map;
}
