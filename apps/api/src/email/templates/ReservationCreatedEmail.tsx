import * as React from 'react';
import {
  Column,
  Hr,
  Row,
  Section,
  Text,
} from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';

type ReservationCreatedEmailProps = {
  guestFirstName: string;
  reservationId: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  roomNames: string[];
  approvalDeadline?: string | null;
  locale?: 'RO' | 'EN';
};

export function ReservationCreatedEmail({
  guestFirstName,
  reservationId,
  checkIn,
  checkOut,
  nights,
  adults,
  roomNames,
  approvalDeadline,
  locale = 'RO',
}: ReservationCreatedEmailProps) {
  const isRomanian = locale === 'RO';

  const preview = isRomanian
    ? 'Cererea dumneavoastră de rezervare a fost înregistrată.'
    : 'Your reservation request has been received.';

  const title = isRomanian
    ? `Cererea a fost înregistrată, ${guestFirstName}`
    : `Your request has been received, ${guestFirstName}`;

  const formattedCheckIn = formatDate(checkIn, locale);
  const formattedCheckOut = formatDate(checkOut, locale);

  return (
    <EmailLayout
      preview={preview}
      title={title}
    >
      <Text style={paragraphStyle}>
        {isRomanian
          ? 'Vă mulțumim că ați ales Sunshine Resort. Am primit cererea dumneavoastră de rezervare, iar administratorul va verifica disponibilitatea și detaliile sejurului.'
          : 'Thank you for choosing Sunshine Resort. We have received your reservation request, and our administrator will verify the availability and stay details.'}
      </Text>

      <Text style={paragraphStyle}>
        {isRomanian
          ? 'Rezervarea nu este încă confirmată. Veți primi un nou email imediat ce solicitarea este aprobată sau respinsă.'
          : 'The reservation is not confirmed yet. You will receive another email as soon as the request is approved or declined.'}
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
          label={
            isRomanian
              ? 'Check-in'
              : 'Check-in'
          }
          value={`${formattedCheckIn} · 14:00`}
        />

        <DetailRow
          label={
            isRomanian
              ? 'Check-out'
              : 'Check-out'
          }
          value={`${formattedCheckOut} · 10:00`}
        />

        <DetailRow
          label={
            isRomanian
              ? 'Număr de nopți'
              : 'Number of nights'
          }
          value={String(nights)}
        />

        <DetailRow
          label={
            isRomanian
              ? 'Adulți'
              : 'Adults'
          }
          value={String(adults)}
        />

        <DetailRow
          label={
            isRomanian
              ? 'Cazare selectată'
              : 'Selected accommodation'
          }
          value={roomNames.join(', ')}
        />

        {approvalDeadline ? (
          <DetailRow
            label={
              isRomanian
                ? 'Valabilitatea solicitării'
                : 'Request validity'
            }
            value={formatDateTime(
              approvalDeadline,
              locale,
            )}
          />
        ) : null}
      </Section>

      <Section style={noticeStyle}>
        <Text style={noticeTitleStyle}>
          {isRomanian
            ? 'Ce urmează?'
            : 'What happens next?'}
        </Text>

        <Text style={noticeTextStyle}>
          {isRomanian
            ? 'După verificarea solicitării, veți primi un email cu rezultatul. Dacă rezervarea este aprobată, emailul va conține instrucțiunile pentru plată.'
            : 'After your request is reviewed, you will receive an email with the outcome. If the reservation is approved, the email will include payment instructions.'}
        </Text>
      </Section>

      <Text style={closingStyle}>
        {isRomanian
          ? 'Pentru întrebări suplimentare, ne puteți contacta folosind datele disponibile pe website-ul Sunshine Resort.'
          : 'For any additional questions, you can contact us using the details available on the Sunshine Resort website.'}
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
  const date = new Date(
    `${value.slice(0, 10)}T00:00:00.000Z`,
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

function formatDateTime(
  value: string,
  locale: 'RO' | 'EN',
): string {
  const date = new Date(value);

  return new Intl.DateTimeFormat(
    locale === 'RO' ? 'ro-RO' : 'en-GB',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Bucharest',
    },
  ).format(date);
}

const paragraphStyle: React.CSSProperties = {
  margin: '0 0 28px',
  color: '#D8D2C8',
  fontFamily:
    'Baskerville, Georgia, "Times New Roman", serif',
  fontSize: '20px',
  lineHeight: '34px',
};

const detailsCardStyle: React.CSSProperties = {
  marginTop: '32px',
  marginBottom: '32px',
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
  color: '#F1EDE6',
  fontFamily:
    'Baskerville, Georgia, "Times New Roman", serif',
  fontSize: '16px',
  fontWeight: 400,
  lineHeight: '24px',
  textAlign: 'right',
};

const noticeStyle: React.CSSProperties = {
  marginBottom: '30px',
  padding: '22px 24px',
  backgroundColor: '#19160f',
  borderLeft: '3px solid #d4af37',
};

const noticeTitleStyle: React.CSSProperties = {
  margin: '0 0 8px',
  color: '#d4af37',
  fontSize: '15px',
  fontWeight: 700,
};

const noticeTextStyle: React.CSSProperties = {
  margin: 0,
  color: '#c9c2b7',
  fontSize: '14px',
  lineHeight: '24px',
};

const closingStyle: React.CSSProperties = {
  margin: 0,
  color: '#a8a197',
  fontSize: '14px',
  lineHeight: '25px',
};

ReservationCreatedEmail.PreviewProps = {
  guestFirstName: 'Andrei',
  reservationId: 'SR-2026-0001',
  checkIn: '2026-09-07',
  checkOut: '2026-09-10',
  nights: 3,
  adults: 2,
  roomNames: ['Apartament Signature'],
  approvalDeadline:
    '2026-07-17T14:00:00.000Z',
  locale: 'RO' as const,
};