import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

interface StatelessProps extends StackProps {}

export default class Stateless extends Stack {
  constructor(scope: Construct, id: string, props?: StatelessProps) {
    super(scope, id, props);
  }
}
