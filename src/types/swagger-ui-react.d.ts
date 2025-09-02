declare module 'swagger-ui-react' {
  interface SwaggerUIProps {
    spec?: any;
    docExpansion?: string;
    displayRequestDuration?: boolean;
    tryItOutEnabled?: boolean;
  }

  const SwaggerUI: React.ComponentType<SwaggerUIProps>;
  export default SwaggerUI;
}