import * as React from 'react';
import {
  Column,
  Hr,
  Row,
  Section,
  Text,
} from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';

type ReservationApprovedEmailProps = {
  guestFirstName: string;
  reservationId: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  roomNames: string[];
  totalPrice: number;
  depositAmount: number;
  paymentDeadline: string;
  paymentUrl: string;
  locale?: 'RO' | 'EN';
};

export function ReservationApprovedEmail({
  guestFirstName,
  reservationId,
  checkIn,
  checkOut,
  nights,
  adults,
  roomNames,
  totalPrice,
  depositAmount,
  paymentDeadline,
  paymentUrl,
  locale = 'RO',
}: ReservationApprovedEmailProps) {
  const isRomanian = locale === 'RO';

  return (
    <EmailLayout
      preview={
        isRomanian
          ? 'Rezervarea a fost aprobată și așteaptă plata.'
          : 'Your reservation has been approved and is awaiting payment.'
      }
      title={
        isRomanian
          ? `Rezervarea a fost aprobată, ${guestFirstName}`
          : `Your reservation has been approved, ${guestFirstName}`
      }
      buttonText={
        isRomanian ? 'Plătește acum' : 'Pay now'
      }
      buttonUrl={paymentUrl}
    >
      <Text style={paragraphStyle}>
        {isRomanian
          ? 'Avem plăcerea să vă confirmăm că solicitarea dumneavoastră de rezervare a fost aprobată.'
          : 'We are pleased to confirm that your reservation request has been approved.'}
      </Text>

      <Text style={paragraphStyle}>
        {isRomanian
          ? 'Pentru garantarea rezervării, este necesară achitarea avansului sau a întregii sume înainte de expirarea termenului de plată.'
          : 'To secure your reservation, the deposit or the full amount must be paid before the payment deadline.'}
      </Text>

      <Section style={detailsCardStyle}>
        <Text style={detailsHeadingStyle}>
          {isRomanian
            ? 'Detaliile rezervării'
            : 'Reservation details'}
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
              ? 'Număr de nopți'
              : 'Number of nights'
          }
          value={String(nights)}
        />

        <DetailRow
          label={
            isRomanian ? 'Adulți' : 'Adults'
          }
          value={String(adults)}
        />

        <DetailRow
          label={
            isRomanian
              ? 'Cazare'
              : 'Accommodation'
          }
          value={roomNames.join(', ')}
        />

        <DetailRow
          label={
            isRomanian
              ? 'Valoare totală'
              : 'Total amount'
          }
          value={formatCurrency(totalPrice, locale)}
        />

        <DetailRow
          label={
            isRomanian
              ? 'Avans minim'
              : 'Minimum deposit'
          }
          value={formatCurrency(depositAmount, locale)}
        />

        <DetailRow
          label={
            isRomanian
              ? 'Termen de plată'
              : 'Payment deadline'
          }
          value={formatDateTime(
            paymentDeadline,
            locale,
          )}
        />
      </Section>

      <Section style={noticeStyle}>
        <Text style={noticeTitleStyle}>
          {isRomanian
            ? 'Rezervarea nu este încă garantată'
            : 'Your reservation is not yet secured'}
        </Text>

        <Text style={noticeTextStyle}>
          {isRomanian
            ? 'Dacă plata nu este finalizată până la termenul indicat, rezervarea va expira automat, iar apartamentul va redeveni disponibil.'
            : 'If payment is not completed before the stated deadline, the reservation will expire automatically and the apartment will become available again.'}
        </Text>
      </Section>

      <Text style={closingStyle}>
        {isRomanian
          ? 'După confirmarea plății, veți primi automat emailul final de confirmare a rezervării.'
          : 'Once payment is confirmed, you will automatically receive the final reservation confirmation email.'}
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
  ).format(new Date(value));
}

function formatCurrency(
  value: number,
  locale: 'RO' | 'EN',
): string {
  return new Intl.NumberFormat(
    locale === 'RO' ? 'ro-RO' : 'en-GB',
    {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(value);
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

ReservationApprovedEmail.PreviewProps = {
  guestFirstName: 'Andrei',
  reservationId: 'SR-2026-0001',
  checkIn: '2026-09-07',
  checkOut: '2026-09-10',
  nights: 3,
  adults: 2,
  roomNames: ['Apartament Signature'],
  totalPrice: 2400,
  depositAmount: 1200,
  paymentDeadline:
    '2026-07-17T14:00:00.000Z',
  paymentUrl:
    'https://checkout.stripe.com/example',
  locale: 'RO' as const,
};