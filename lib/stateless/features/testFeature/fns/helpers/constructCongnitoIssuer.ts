export default function constructCognitoIssuer(
  region: any,
  cognitoPoolId: any
) {
  return `https://cognito-idp.${region}.amazonaws.com/${cognitoPoolId}`;
}
