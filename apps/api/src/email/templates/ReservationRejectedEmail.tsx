import * as React from 'react';
import {
  Column,
  Hr,
  Row,
  Section,
  Text,
} from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';

type ReservationRejectedEmailProps = {
  guestFirstName: string;
  reservationId: string;
  checkIn: string;
  checkOut: string;
  roomNames: string[];
  rejectionReason: string;
  locale?: 'RO' | 'EN';
};

export function ReservationRejectedEmail({
  guestFirstName,
  reservationId,
  checkIn,
  checkOut,
  roomNames,
  rejectionReason,
  locale = 'RO',
}: ReservationRejectedEmailProps) {
  const isRomanian = locale === 'RO';

  return (
    <EmailLayout
      preview={
        isRomanian
          ? 'Actualizare privind cererea dumneavoastră de rezervare.'
          : 'An update regarding your reservation request.'
      }
      title={
        isRomanian
          ? `Actualizare privind rezervarea, ${guestFirstName}`
          : `Reservation update, ${guestFirstName}`
      }
    >
      <Text style={paragraphStyle}>
        {isRomanian
          ? 'Vă mulțumim pentru interesul acordat Sunshine Resort.'
          : 'Thank you for your interest in Sunshine Resort.'}
      </Text>

      <Text style={paragraphStyle}>
        {isRomanian
          ? 'Din păcate, cererea dumneavoastră de rezervare nu a putut fi aprobată pentru perioada solicitată.'
          : 'Unfortunately, your reservation request could not be approved for the requested period.'}
      </Text>

      <Section style={detailsCardStyle}>
        <Text style={detailsHeadingStyle}>
          {isRomanian
            ? 'Detaliile solicitării'
            : 'Request details'}
        </Text>

        <Hr style={dividerStyle} />

        <DetailRow
          label={
            isRomanian
              ? 'Număr rezervare'
              : 'Reservation number'
          }
          value={reservationId}
        />

        <DetailRow
          label="Check-in"
          value={`${formatDate(checkIn, locale)} · 14:00`}
        />

        <DetailRow
          label="Check-out"
          value={`${formatDate(checkOut, locale)} · 10:00`}
        />

        <DetailRow
          label={
            isRomanian
              ? 'Cazare solicitată'
              : 'Requested accommodation'
          }
          value={roomNames.join(', ')}
        />
      </Section>

      <Section style={reasonCardStyle}>
        <Text style={reasonTitleStyle}>
          {isRomanian
            ? 'Motivul respingerii'
            : 'Reason'}
        </Text>

        <Text style={reasonTextStyle}>
          {rejectionReason}
        </Text>
      </Section>

      <Text style={closingStyle}>
        {isRomanian
          ? 'Puteți verifica o altă perioadă disponibilă pe website-ul Sunshine Resort sau ne puteți contacta pentru asistență.'
          : 'You may check another available period on the Sunshine Resort website or contact us for assistance.'}
      </Text>
    </EmailLayout>
  );
}

type DetailRowProps = {
  label: string;
  value: string;
};

function DetailRow({
  label,
  value,
}: DetailRowProps) {
  return (
    <Row style={detailRowStyle}>
      <Column style={labelColumnStyle}>
        <Text style={detailLabelStyle}>
          {label}
        </Text>
      </Column>

      <Column style={valueColumnStyle}>
        <Text style={detailValueStyle}>
          {value}
        </Text>
      </Column>
    </Row>
  );
}

function formatDate(
  value: string,
  locale: 'RO' | 'EN',
): string {
  const normalizedValue = value.slice(0, 10);

  const date = new Date(
    `${normalizedValue}T00:00:00.000Z`,
  );

  return new Intl.DateTimeFormat(
    locale === 'RO' ? 'ro-RO' : 'en-GB',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    },
  ).format(date);
}

const paragraphStyle: React.CSSProperties = {
  margin: '0 0 20px',
  color: '#d0cbc2',
  fontSize: '16px',
  lineHeight: '29px',
};

const detailsCardStyle: React.CSSProperties = {
  marginTop: '32px',
  marginBottom: '28px',
  padding: '26px',
  backgroundColor: '#151515',
  border: '1px solid #2d2922',
  borderRadius: '8px',
};

const detailsHeadingStyle: React.CSSProperties = {
  margin: 0,
  color: '#d4af37',
  fontSize: '17px',
  fontWeight: 700,
  letterSpacing: '0.5px',
};

const dividerStyle: React.CSSProperties = {
  margin: '18px 0 10px',
  borderColor: '#302c25',
};

const detailRowStyle: React.CSSProperties = {
  width: '100%',
};

const labelColumnStyle: React.CSSProperties = {
  width: '42%',
  verticalAlign: 'top',
};

const valueColumnStyle: React.CSSProperties = {
  width: '58%',
  verticalAlign: 'top',
};

const detailLabelStyle: React.CSSProperties = {
  margin: '9px 0',
  color: '#8f887c',
  fontSize: '13px',
  lineHeight: '20px',
};

const detailValueStyle: React.CSSProperties = {
  margin: '9px 0',
  color: '#f1ede6',
  fontSize: '14px',
  fontWeight: 600,
  lineHeight: '20px',
  textAlign: 'right',
};

const reasonCardStyle: React.CSSProperties = {
  marginBottom: '30px',
  padding: '22px 24px',
  backgroundColor: '#1a1412',
  borderLeft: '3px solid #b98570',
};

const reasonTitleStyle: React.CSSProperties = {
  margin: '0 0 10px',
  color: '#d7b3a4',
  fontSize: '15px',
  fontWeight: 700,
};

const reasonTextStyle: React.CSSProperties = {
  margin: 0,
  color: '#d0c6c0',
  fontSize: '14px',
  lineHeight: '24px',
  whiteSpace: 'pre-line',
};

const closingStyle: React.CSSProperties = {
  margin: 0,
  color: '#a8a197',
  fontSize: '14px',
  lineHeight: '25px',
};

ReservationRejectedEmail.PreviewProps = {
  guestFirstName: 'Andrei',
  reservationId: 'SR-2026-0001',
  checkIn: '2026-09-07',
  checkOut: '2026-09-10',
  roomNames: ['Apartament Signature'],
  rejectionReason:
    'Apartamentul solicitat nu mai este disponibil pentru întreaga perioadă selectată.',
  locale: 'RO' as const,
};