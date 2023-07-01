import { aws_lambda } from "aws-cdk-lib";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export class Lambda extends NodejsFunction {
  constructor(scope: Construct, id: string, props: NodejsFunctionProps) {
    super(scope, id, props);
  }

  static create(scope: Construct, id: string, props: NodejsFunctionProps) {
    const λ = new Lambda(scope, id, {
      ...props,
      bundling: {
        minify: false,
        target: "es2020",
        externalModules: ["aws-sdk"],
      },
      entry: props.entry,
      runtime: aws_lambda.Runtime.NODEJS_18_X,
      architecture: aws_lambda.Architecture.ARM_64,
    });

    return λ;
  }
}
