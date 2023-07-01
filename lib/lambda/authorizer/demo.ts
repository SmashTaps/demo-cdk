import { APIGatewayTokenAuthorizerEvent, Callback, Context } from "aws-lambda";

declare let verifyToken: (token: string) => Promise<{
  role: "admin" | "role1" | "role2";
  customRole: boolean;
}>;

declare let generatePolicy: (
  principalId: string,
  effect: "Allow" | "Deny",
  resource: string
) => {
  principalId: string | undefined;
  policyDocument: {
    Version: string;
    Statement: {
      Action: string;
      Effect: "Allow" | "Deny";
      Resource: string;
    }[];
  };
};

declare let getScope: (methodArn: string) => string;

declare let constructPermissions: <
  T extends string,
  R extends string,
  F extends string,
  M extends string
>(
  tenant: T,
  role: R,
  feature: F,
  method: M
) => `${T}#${R}#${F}#${M}`;

declare let validPermission: (permission: string) => Promise<boolean>;

const contributorPermissions = ["get/org", "put/org", "patch/org"];

export async function handler(
  event: APIGatewayTokenAuthorizerEvent,
  context: Context,
  callback: Callback
) {
  console.log(event);
  try {
    const { role, customRole } = await verifyToken(event.authorizationToken);

    if (role === "admin") {
      return callback(null, generatePolicy("user", "Allow", event.methodArn));
    }

    if (
      role === "role1" &&
      contributorPermissions.includes(getScope(event.methodArn))
    ) {
      return callback(null, generatePolicy("user", "Allow", event.methodArn));
    }

    if (customRole) {
      const permission = constructPermissions(
        "32d4c5c0-97c2-44eb-bd89-86d46a4771ec",
        "role",
        "testFeature",
        "get"
      );

      const hasPermission = await validPermission(permission);

      if (hasPermission) {
        return callback(null, generatePolicy("user", "Allow", event.methodArn));
      }
    }
  } catch (error) {
    return callback("Unauthorized");
  }
}
