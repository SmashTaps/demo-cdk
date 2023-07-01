import { APIGatewayTokenAuthorizerEvent, Callback, Context } from "aws-lambda";
import { verifyToken } from "./helpers/verifyToken";

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

const role1Permissions = ["patch", "patch"];

export async function handler(
  event: APIGatewayTokenAuthorizerEvent,
  context: Context,
  callback: Callback
) {
  try {
    // const { role, customRole } = await verifyToken(
    //   event.authorizationToken,
    //   "abc",
    //   "us-east-1"
    // );

    const role = "admin";

    const customRole = false;

    console.log(event);

    console.log(role);

    if (role === "admin") {
      return callback(
        null,
        generatePolicy("user", "Allow", event.methodArn, {
          context: {
            role: "admin",
          },
        })
      );
    }

    if (
      role === "role1" &&
      role1Permissions.includes(getScope(event.methodArn))
    ) {
      console.log(role, role1Permissions, getScope(event.methodArn));
      callback(
        null,
        generatePolicy("user", "Allow", [event.methodArn], {
          role: "role1",
        })
      );
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
        callback(null, generatePolicy("user", "Allow", [event.methodArn]));
      }
    }
  } catch (error) {
    console.log(error);
    callback("Unauthorized");
  }
}

export function generatePolicy(
  principalId: any,
  effect: any,
  resource: any,
  context?: any
) {
  const authResponse = {
    principalId,
    context,
  };

  if (effect && resource) {
    var policyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    };
    //@ts-ignore
    authResponse.policyDocument = policyDocument;
  }

  return authResponse;
}

function getScope(methodArn: string) {
  const cleanedArn = methodArn.endsWith("/")
    ? methodArn.slice(0, -1)
    : methodArn;

  const arnParts = cleanedArn.split(":");
  return arnParts[arnParts.length - 1]
    .split("/")
    .slice(2)
    .join("/")
    .toLowerCase();
}
