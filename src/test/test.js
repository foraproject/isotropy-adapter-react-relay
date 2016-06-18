import __polyfill from "babel-polyfill";
import React from "react";
import should from 'should';
import adapter from "../isotropy-adapter-react-relay";
import schema from "./my-schema";
import MyComponent from "./my-component";
import MyRelayComponent from "./my-relay-component";
import MyRelayRoute from "./my-relay-route";

//For now the GraphQL server is going to run as a separate process.
import express from 'express';
import graphQLHTTP from 'express-graphql';

// isomorphic-relay must be loaded before react-relay (happens in isotropy-adapter-react-relay)
// or you get "self is not defined"
// https://github.com/denvned/isomorphic-relay/commit/5a7b673250bd338f3333d00075336ffcc73be806
import Relay from "react-relay";

describe("Isotropy React-Relay Adapter", () => {

  before(() => {
    const APP_PORT = 8080;

    const app = express();

    // Expose a GraphQL endpoint
    app.use('/graphql', graphQLHTTP({schema, pretty: true}));
    app.listen(APP_PORT);
  });

  const staticMarkupTypes = [false, true];

  staticMarkupTypes.forEach((isStatic) => {
    it(`Should serve a React UI${isStatic ? "with Static Markup" : ""}`, () => {
      const req = {};
      const res = {
        body: "",
        end: function(html) { this.body = html; }
      };

      adapter.render({
        Component: MyComponent,
        args: { name: "Jeswin"},
        req,
        res,
        renderToStaticMarkup: isStatic,
        toHtml: x => x
      });
      if (!isStatic) {
        res.body.should.containEql("Jeswin");
      } else {
        res.body.should.equal("<html><body>Hello Jeswin</body></html>");
      }
    });

    it(`Should serve a Relay + React UI${isStatic ? "with Static Markup" : ""}`, async () => {
      const req = {};
      const res = {
        body: "",
        end: function(html) { this.body = html; }
      };

      const graphqlUrl = `http://localhost:8080/graphql`;

      await adapter.renderRelayContainer({
        Container: MyRelayComponent,
        RelayRoute: MyRelayRoute,
        args: { id: "200" },
        req,
        res,
        graphqlUrl,
        renderToStaticMarkup: isStatic,
        toHtml: x => x
      });
      if (!isStatic) {
        res.body.should.containEql("ENTERPRISE");
      } else {
        res.body.should.equal("<html><body>Hello ENTERPRISE</body></html>");
      }
    });
  });

});
