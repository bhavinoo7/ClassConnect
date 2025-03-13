import { Html, Head, Font, Preview, Section, Row, Heading, Text } from "@react-email/components";
  
  interface VerificationEmailProps {
    username:string;
    id: string;
    password: string;
  }
  
  export default function DivisionCredential({ username,id, password }: VerificationEmailProps) {
    return (
      <Html lang="en" dir="ltr">
        <Head>
          <title>Access Credential</title>
          <Font
            fontFamily="Roboto"
            fallbackFontFamily="Verdana"
            webFont={{
              url: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
              format: 'woff2',
            }}
            fontWeight={400}
            fontStyle="normal"
          />
        </Head>
        <Preview>Here&apos;s your Credential</Preview>
        <Section>
          <Row>
            <Heading as="h2">Hello {username},</Heading>
          </Row>
          <Row>
            <Text>
              Userid : {id}
            </Text>
          </Row>
          <Row>
            <Text>Password : {password}</Text> 
          </Row>
          <Row>
            <Text>
              If you did not request this code, please ignore this email.
            </Text>
          </Row>
         
        </Section>
      </Html>
    );
  }
