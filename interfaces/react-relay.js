declare module "react-relay" {
  declare function injectNetworkLayer(networkLayer: Object) : void

  declare class DefaultNetworkLayer {
    constructor(graphqlUrl: string) : void;
  }
}


declare module "react-relay/lib/RelayStore" {
  declare function getStoreData(): any
}
