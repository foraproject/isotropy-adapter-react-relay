/* @flow */
import React from "react";
import ReactDOM from "react-dom";
import ReactDOMServer from "react-dom/server";
import IsomorphicRelay from "isomorphic-relay";
import Relay from 'react-relay';
import RelayStore from 'react-relay/lib/RelayStore';

import type { IncomingMessage, ServerResponse } from "./flow/http";;

export type RenderArgsType = {
  component: Function,
  req: IncomingMessage,
  res: ServerResponse,
  args: Object,
  renderToStaticMarkup?: boolean,
  toHtml: (html: string, props: Object) => string
}

export type RenderRelayContainerArgsType = {
  relayContainer: Function,
  relayRoute: Object,
  req: IncomingMessage,
  res: ServerResponse,
  args: Object,
  graphqlUrl: string,
  renderToStaticMarkup?: boolean,
  toHtml: (html: string, props: Object) => string
}

const render = async function(params: RenderArgsType) : Promise {
  const { component, args, req, res, toHtml, renderToStaticMarkup } = params;
  const reactElement = React.createElement(component, args);
  const _toHtml = toHtml || ((x, args, data) => x);
  const _renderToStaticMarkup = (typeof renderToStaticMarkup !== "undefined" && renderToStaticMarkup !== null) ? renderToStaticMarkup : false;
  const html = !_renderToStaticMarkup ? ReactDOMServer.renderToString(reactElement) : ReactDOMServer.renderToStaticMarkup(reactElement);
  res.end(_toHtml(html, args));
};


const renderRelayContainer = async function(params: RenderRelayContainerArgsType) : Promise {
  const { relayContainer, relayRoute, args, req, res, graphqlUrl, toHtml, renderToStaticMarkup } = params;

  const _relayRoute = Object.assign({}, relayRoute);
  _relayRoute.params = Object.assign({}, relayRoute.params, args);

  const rootContainerProps = {
    Component: relayContainer,
    route: _relayRoute
  };

  Relay.injectNetworkLayer(new Relay.DefaultNetworkLayer(graphqlUrl));
  RelayStore.getStoreData().getChangeEmitter().injectBatchingStrategy(() => {});

  const {data, props} = await IsomorphicRelay.prepareData(rootContainerProps);
  const relayElement = <IsomorphicRelay.RootContainer {...props} />;
  const _toHtml = toHtml || ((x, args, data) => x);
  const _renderToStaticMarkup = (typeof renderToStaticMarkup !== "undefined" && renderToStaticMarkup !== null) ? renderToStaticMarkup : false;
  const html = !_renderToStaticMarkup ? ReactDOMServer.renderToString(relayElement) : ReactDOMServer.renderToStaticMarkup(relayElement);
  res.end(_toHtml(html, args, data));
};


export default {
  render,
  renderRelayContainer
};
