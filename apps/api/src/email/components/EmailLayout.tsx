import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';

type EmailLayoutProps = {
  preview: string;
  title: string;
  children: React.ReactNode;
  buttonText?: string;
  buttonUrl?: string;
};

const logoUrl =
  process.env.EMAIL_LOGO_URL ??
  'https://sunshineresort.ro/email/logo-sunshine.png';

export function EmailLayout({
  preview,
  title,
  children,
  buttonText,
  buttonUrl,
}: EmailLayoutProps) {
  return (
    <Html>
      <Head>
        <style>
          {`
            @media only screen and (max-width: 620px) {
              .email-container {
                width: 100% !important;
              }

              .email-content {
                padding-left: 24px !important;
                padding-right: 24px !important;
              }

              .email-header {
                padding-left: 24px !important;
                padding-right: 24px !important;
              }

              .email-title {
                font-size: 30px !important;
                line-height: 38px !important;
              }

              .email-logo {
                width: 180px !important;
              }
            }
          `}
        </style>
      </Head>

      <Preview>{preview}</Preview>

      <Body style={bodyStyle}>
        <Container
          className="email-container"
          style={containerStyle}
        >
          <Section
            className="email-header"
            style={headerStyle}
          >
            <Img
              className="email-logo"
              src={logoUrl}
              width="220"
              alt="Sunshine Resort"
              style={logoStyle}
            />

            <Text style={taglineStyle}>
              ADULTS ONLY · LUXURY RETREAT
            </Text>
          </Section>

          <Hr style={dividerStyle} />

          <Section
            className="email-content"
            style={contentStyle}
          >
            <Heading
              className="email-title"
              style={titleStyle}
            >
              {title}
            </Heading>

            {children}

            {buttonText && buttonUrl ? (
              <Section style={buttonSectionStyle}>
                <Button
                  href={buttonUrl}
                  style={buttonStyle}
                >
                  {buttonText}
                </Button>
              </Section>
            ) : null}
          </Section>

          <Hr style={dividerStyle} />

          <Section style={footerStyle}>
            <Text style={footerMutedStyle}>
              Mesaj trimis automat din sistemul Sunshine Resort.
            </Text>

            <Text style={footerAccentStyle}>
              Vă rugăm să nu răspundeți direct la acest email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle: React.CSSProperties = {
  margin: 0,
  padding: '28px 12px',
  backgroundColor: '#f3f2ef',
  fontFamily:
    'Baskerville, Georgia, "Times New Roman", serif',
};

const containerStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '760px',
  margin: '0 auto',
  backgroundColor: '#090909',
  border: '1px solid #2c2923',
};

const headerStyle: React.CSSProperties = {
  padding: '42px 56px 34px',
  textAlign: 'center',
};

const logoStyle: React.CSSProperties = {
  display: 'block',
  width: '260px',
  maxWidth: '100%',
  height: 'auto',
  margin: '0 auto 20px',
};

const taglineStyle: React.CSSProperties = {
  margin: 0,
  color: '#bba886',

  fontFamily:
    'Baskerville, Georgia, serif',

  fontSize: '13px',
  letterSpacing: '5px',
  textTransform: 'uppercase',
};

const dividerStyle: React.CSSProperties = {
  margin: 0,
  borderColor: '#2a2722',
};

const contentStyle: React.CSSProperties = {
  padding: '54px 56px 58px',
};

const titleStyle: React.CSSProperties = {
  margin: '0 0 34px',
  color: '#F7F4EE',

  fontFamily:
    'Baskerville, Georgia, "Times New Roman", serif',

  fontSize: '40px',
  fontWeight: 400,
  lineHeight: '50px',
  letterSpacing: '-0.4px',
};

const buttonSectionStyle: React.CSSProperties = {
  marginTop: '34px',
};

const buttonStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '14px 24px',
  backgroundColor: '#cda434',
  color: '#090909',
  fontFamily:
    'Arial, Helvetica, sans-serif',
  fontSize: '14px',
  fontWeight: 700,
  lineHeight: '20px',
  textDecoration: 'none',
  borderRadius: '2px',
};

const footerStyle: React.CSSProperties = {
  padding: '30px 56px 34px',
  textAlign: 'center',
};

const footerMutedStyle: React.CSSProperties = {
  margin: '0 0 8px',
  color: '#777066',
  fontFamily:
    'Arial, Helvetica, sans-serif',
  fontSize: '12px',
  lineHeight: '19px',
};

const footerAccentStyle: React.CSSProperties = {
  margin: 0,
  color: '#bd9531',
  fontFamily:
    'Arial, Helvetica, sans-serif',
  fontSize: '12px',
  lineHeight: '19px',
};