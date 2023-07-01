import getPublicKeys from "./getPublicKeys";
import constructIssuer from "./constructCongnitoIssuer";
import * as jsonwebtoken from "jsonwebtoken";
import { promisify } from "util";

export async function verifyToken(
  token: any,
  cognitoPoolId: string,
  region: string
) {
  // const cognitoIssuer = constructIssuer(region, cognitoPoolId);
  const verifyPromised = promisify(jsonwebtoken.verify.bind(jsonwebtoken));

  try {
    const tokenSections = (token || "").split(".");
    if (tokenSections.length < 2) {
      throw new Error("requested token is invalid");
    }

    // const headerJSON = Buffer.from(tokenSections[0], "base64").toString("utf8");

    // const header = JSON.parse(headerJSON);

    // const keys = await getPublicKeys(region, cognitoPoolId);

    // const key = keys[header.kid];

    // if (key === undefined) {
    //   throw new Error("Unknown kid");
    // }

    // const claim: any = await verifyPromised(token.pem);
    const claim: any = await verifyPromised(token);

    const currentSeconds = Math.floor(new Date().valueOf() / 1000);

    const { exp, auth_time, iss, token_use, client_id, sub, role, customRole } =
      claim;

    if (currentSeconds > exp || currentSeconds < auth_time) {
      throw new Error("Expired or invalid");
    }
    // if (iss !== cognitoIssuer) {
    //   throw new Error("Invalid claim issuer");
    // }
    if (token_use !== "id") {
      throw new Error("claim use is not access");
    }

    return {
      userName: sub,
      clientId: client_id,
      isValid: true,
      role,
      customRole,
    };
  } catch (error) {
    console.error(error);
    return { userName: "", clientId: "", error, isValid: false };
  }
}
