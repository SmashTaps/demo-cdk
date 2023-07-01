import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import testFeature from "./features/testFeature/testFeature";

interface StatelessProps extends StackProps {}

export class Stateless extends Stack {
  constructor(scope: Construct, id: string, props?: StatelessProps) {
    super(scope, id, props);

    const testFeatureInstance = new testFeature(this, "test_feature_ns");
  }
}
