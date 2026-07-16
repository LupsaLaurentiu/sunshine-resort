import * as React from 'react';
import { Text } from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';

type TestEmailProps = {
  subject: string;
  message: string;
};

export function TestEmail({
  subject,
  message,
}: TestEmailProps) {
  return (
    <EmailLayout
      preview={subject}
      title={subject}
      buttonText="Vizitează Sunshine Resort"
      buttonUrl="https://sunshineresort.ro"
    >
      <Text
        style={{
          color: '#D6D6D6',
          fontSize: '16px',
          lineHeight: '30px',
          margin: 0,
          whiteSpace: 'pre-line',
        }}
      >
        {message}
      </Text>

      <Text
        style={{
          color: '#D4AF37',
          fontSize: '15px',
          lineHeight: '28px',
          marginTop: '30px',
        }}
      >
        Dacă primiți acest email, înseamnă că serviciul de email
        Sunshine Resort este configurat și funcționează corect.
      </Text>
    </EmailLayout>
  );
}

TestEmail.PreviewProps = {
  subject: 'Test Sunshine Resort',
  message:
    'Acesta este primul email trimis din backend-ul Sunshine Resort.',
};