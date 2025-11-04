import { Amplify } from 'aws-amplify'

export function configureAmplify() {
  const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID
  const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID

  if (!userPoolId || !userPoolClientId) {
    console.warn('Cognito configuration missing. Authentication will not work.')
    return
  }

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
        loginWith: {
          email: true,
        },
        signUpVerificationMethod: 'code',
        userAttributes: {
          email: {
            required: true,
          },
        },
        passwordFormat: {
          minLength: 8,
          requireLowercase: true,
          requireUppercase: true,
          requireNumbers: true,
          requireSpecialCharacters: false,
        },
      },
    },
  }, {
    ssr: true,
  })
}

