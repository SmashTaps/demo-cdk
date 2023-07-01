import { NestedStack, NestedStackProps, aws_lambda } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ApiGateway } from "../../../constructs/apigateway";
import { HttpMethod } from "aws-cdk-lib/aws-events";
import { Lambda } from "../../../constructs/lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

interface TestFeatureProps extends NestedStackProps {}

export default class extends NestedStack {
  constructor(scope: Construct, id: string, props?: TestFeatureProps) {
    super(scope, id, props);

    const testFeatureGetLambda = Lambda.create(this, "testFeatureGetLambda", {
      entry: "lib/stateless/features/testFeature/fns/get.ts",
      handler: "handler",
      functionName: "testFeatureGetLambda",
    });

    const tokenAuthorizer = new NodejsFunction(this, "tfAuthorizer", {
      entry: "lib/stateless/features/testFeature/fns/authorizer.ts",
      handler: "handler",
      functionName: "tfAuthorizer",
      bundling: {
        minify: false,
        target: "es2020",
        externalModules: ["aws-sdk"],
      },
    });

    const restApi = ApiGateway.createRootApi(this, "restApi", {
      restApiName: "testFeature",
      id: "testFeature",
      apiName: "testFeature",
      tokenAuthorizer,
      apis: [
        {
          method: HttpMethod.GET,
          handler: testFeatureGetLambda,
        },
      ],
    });
  }
}
