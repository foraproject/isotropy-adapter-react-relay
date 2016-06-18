/* @flow */
import React from "react";
import ReactDOM from "react-dom";
import ReactDOMServer from "react-dom/server";
import IsomorphicRelay from "isomorphic-relay";
import Relay from 'react-relay';
import RelayStore from 'react-relay/lib/RelayStore';

import type { IncomingMessage, ServerResponse } from "isotropy-interfaces/node/http";

export type RenderArgsType = {
  Component: Function,
  req: IncomingMessage,
  res: ServerResponse,
  args: Object,
  renderToStaticMarkup?: boolean,
  toHtml: (html: string, props: Object) => string
}

export type RenderRelayContainerArgsType = {
  Container: Function,
  RelayRoute: Function,
  req: IncomingMessage,
  res: ServerResponse,
  args: Object,
  graphqlUrl: string,
  renderToStaticMarkup?: boolean,
  toHtml: (html: string, props: Object) => string
}

const render = async function(params: RenderArgsType) : Promise {
  const { Component, args, req, res, toHtml, renderToStaticMarkup } = params;
  const reactElement = React.createElement(Component, args);
  const _toHtml = toHtml || ((x, args, data) => x);
  const _renderToStaticMarkup = (typeof renderToStaticMarkup !== "undefined" && renderToStaticMarkup !== null) ? renderToStaticMarkup : false;
  const html = !_renderToStaticMarkup ? ReactDOMServer.renderToString(reactElement) : ReactDOMServer.renderToStaticMarkup(reactElement);
  res.end(_toHtml(html, args));
};


const renderRelayContainer = async function(params: RenderRelayContainerArgsType) : Promise {
  const { Container, RelayRoute, args, req, res, graphqlUrl, toHtml, renderToStaticMarkup } = params;
  const rootContainerProps = {
    Container: Container,
    queryConfig: new RelayRoute(args)
  };

  const networkLayer = new Relay.DefaultNetworkLayer(graphqlUrl);
  RelayStore.getStoreData().getChangeEmitter().injectBatchingStrategy(() => {});

  const {data, props} = await IsomorphicRelay.prepareData(rootContainerProps, networkLayer);
  const relayElement = <IsomorphicRelay.Renderer {...props} />;
  const _toHtml = toHtml || ((x, args, data) => x);
  const _renderToStaticMarkup = (typeof renderToStaticMarkup !== "undefined" && renderToStaticMarkup !== null) ? renderToStaticMarkup : false;
  const html = !_renderToStaticMarkup ? ReactDOMServer.renderToString(relayElement) : ReactDOMServer.renderToStaticMarkup(relayElement);
  res.end(_toHtml(html, args, data));
};


export default {
  render,
  renderRelayContainer
};
