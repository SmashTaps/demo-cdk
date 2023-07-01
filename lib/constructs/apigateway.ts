import { CfnOutput, Duration, aws_apigateway } from "aws-cdk-lib";
import { HttpMethod } from "aws-cdk-lib/aws-events";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

interface ApiGatewayProps extends aws_apigateway.RestApiProps {
  apiName: string;
}

interface ApiProps extends Omit<ApiGatewayProps, "id" | "apis"> {
  apis: { method: HttpMethod; handler: NodejsFunction }[];
  id: string;
  apiName: string;
  tokenAuthorizer: NodejsFunction;
}

export class ApiGateway extends aws_apigateway.RestApi {
  constructor(
    scope: Construct,
    id: string,
    props: aws_apigateway.RestApiProps
  ) {
    super(scope, id, props);
  }

  /**
   * Creates a basic API with a root resource and a GET method.
   **/
  static createRootApi(scope: Construct, id: string, props: ApiProps) {
    const api = new ApiGateway(scope, id, props);

    const tokenAuthorizer = new aws_apigateway.TokenAuthorizer(
      scope,
      id + "TokenAuthorizer",
      {
        handler: props.tokenAuthorizer,
        resultsCacheTtl: Duration.seconds(0),
      }
    );

    props?.apis?.forEach((a) => {
      const integration = new aws_apigateway.LambdaIntegration(a.handler);
      const m = api.root.addMethod(a.method, integration, {
        authorizer: tokenAuthorizer,
      });
    });

    new CfnOutput(scope, `${props?.apiName}APIGatewayRestApiId`, {
      value: api.restApiId,
    });

    return api.root;
  }
}
