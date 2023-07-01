import constructCognitoIssuer from "./constructCongnitoIssuer";
import * as jwkToPem from "jwk-to-pem";
import * as Axios from "axios";

export default async function getPublicKeys(region: any, cognitoPoolId: any) {
  let cacheKeys;
  const cognitoIssuer = constructCognitoIssuer(region, cognitoPoolId);

  if (!cacheKeys) {
    const url = `${cognitoIssuer}/.well-known/jwks.json`;
    const publicKeys = await Axios.default.get(url);
    cacheKeys = publicKeys.data.keys.reduce((agg: any, current: any) => {
      const pem = jwkToPem(current);
      agg[current.kid] = { instance: current, pem };
      return agg;
    }, {});

    return cacheKeys;
  } else {
    return cacheKeys;
  }
}
