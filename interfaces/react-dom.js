declare module "react-dom" {}

declare module "react-dom/server" {
  declare function renderToString(elem: Object) : string;
  declare function renderToStaticMarkup(elem: Object) : string;
}
