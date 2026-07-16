import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
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

export function EmailLayout({
  preview,
  title,
  children,
  buttonText,
  buttonUrl,
}: EmailLayoutProps) {
  return (
    <Html lang="ro">
      <Head />

      <Preview>{preview}</Preview>

      <Body
        style={{
          margin: 0,
          padding: '40px 0',
          backgroundColor: '#050505',
          fontFamily:
            '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
        }}
      >
        <Container
          style={{
            width: '100%',
            maxWidth: '650px',
            margin: '0 auto',
            backgroundColor: '#0f0f0f',
            border: '1px solid #262626',
            borderRadius: '10px',
            overflow: 'hidden',
          }}
        >
          {/* Header */}

          <Section
            style={{
              paddingTop: '42px',
              paddingBottom: '32px',
              textAlign: 'center',
            }}
          >
            <Heading
              style={{
                margin: 0,
                color: '#D4AF37',
                fontWeight: 400,
                fontSize: '36px',
                letterSpacing: '2px',
              }}
            >
              Sunshine Resort
            </Heading>

            <Text
              style={{
                marginTop: '10px',
                color: '#C9C9C9',
                fontSize: '13px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}
            >
              Adults Only • Luxury Boutique Resort
            </Text>
          </Section>

          <Hr
            style={{
              borderColor: '#232323',
            }}
          />

          {/* Content */}

          <Section
            style={{
              padding: '45px',
            }}
          >
            <Heading
              style={{
                marginTop: 0,
                marginBottom: '25px',
                color: '#FFFFFF',
                fontWeight: 500,
                fontSize: '30px',
              }}
            >
              {title}
            </Heading>

            {children}

            {buttonText &&
              buttonUrl && (
                <Section
                  style={{
                    textAlign: 'center',
                    marginTop: '40px',
                  }}
                >
                  <Button
                    href={buttonUrl}
                    style={{
                      backgroundColor: '#D4AF37',
                      color: '#111111',
                      textDecoration: 'none',
                      padding: '15px 34px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '15px',
                    }}
                  >
                    {buttonText}
                  </Button>
                </Section>
              )}
          </Section>

          <Hr
            style={{
              borderColor: '#232323',
            }}
          />

          {/* Footer */}

          <Section
            style={{
              padding: '32px',
            }}
          >
            <Text
              style={{
                margin: 0,
                color: '#A0A0A0',
                textAlign: 'center',
                fontSize: '13px',
                lineHeight: '22px',
              }}
            >
              Sunshine Resort
            </Text>

            <Text
              style={{
                marginTop: '10px',
                color: '#777777',
                textAlign: 'center',
                fontSize: '13px',
                lineHeight: '22px',
              }}
            >
              Mulțumim că ați ales Sunshine Resort.
              <br />
              Acest mesaj a fost trimis automat.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}