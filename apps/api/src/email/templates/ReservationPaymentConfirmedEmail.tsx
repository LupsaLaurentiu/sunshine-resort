import * as React from 'react';
import {
  Column,
  Hr,
  Row,
  Section,
  Text,
} from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';

type ReservationPaymentConfirmedEmailProps = {
  guestFirstName: string;
  reservationId: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  roomNames: string[];
  amountPaid: number;
  totalPrice: number;
  locale?: 'RO' | 'EN';
};

export function ReservationPaymentConfirmedEmail({
  guestFirstName,
  reservationId,
  checkIn,
  checkOut,
  nights,
  adults,
  roomNames,
  amountPaid,
  totalPrice,
  locale = 'RO',
}: ReservationPaymentConfirmedEmailProps) {
  const isRo = locale === 'RO';

  return (
    <EmailLayout
      preview={
        isRo
          ? 'Plata a fost confirmată.'
          : 'Your payment has been confirmed.'
      }
      title={
        isRo
          ? `Rezervarea este confirmată, ${guestFirstName}!`
          : `Your reservation is confirmed, ${guestFirstName}!`
      }
    >
      <Text style={paragraph}>
        {isRo
          ? 'Plata dumneavoastră a fost înregistrată cu succes. Rezervarea este acum garantată și vă așteptăm cu drag la Sunshine Resort.'
          : 'Your payment has been successfully received. Your reservation is now guaranteed and we look forward to welcoming you to Sunshine Resort.'}
      </Text>

      <Section style={card}>
        <Text style={cardTitle}>
          {isRo
            ? 'Rezumat rezervare'
            : 'Reservation summary'}
        </Text>

        <Hr style={divider} />

        <DetailRow
          label={
            isRo
              ? 'Număr rezervare'
              : 'Reservation'
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
            isRo
              ? 'Nopți'
              : 'Nights'
          }
          value={String(nights)}
        />

        <DetailRow
          label={
            isRo
              ? 'Adulți'
              : 'Adults'
          }
          value={String(adults)}
        />

        <DetailRow
          label={
            isRo
              ? 'Apartament'
              : 'Accommodation'
          }
          value={roomNames.join(', ')}
        />

        <DetailRow
          label={
            isRo
              ? 'Achitat'
              : 'Paid'
          }
          value={money(amountPaid, locale)}
        />

        <DetailRow
          label={
            isRo
              ? 'Valoare rezervare'
              : 'Reservation value'
          }
          value={money(totalPrice, locale)}
        />
      </Section>

      <Section style={notice}>
        <Text style={noticeTitle}>
          {isRo
            ? 'Ne vedem curând!'
            : 'See you soon!'}
        </Text>

        <Text style={noticeText}>
          {isRo
            ? 'Cu 24 de ore înainte de check-in veți primi toate informațiile utile privind sosirea, parcarea și accesul în resort.'
            : '24 hours before check-in you will receive all arrival information, parking details and useful instructions.'}
        </Text>
      </Section>
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
    <Row>
      <Column style={{ width: '42%' }}>
        <Text style={labelStyle}>
          {label}
        </Text>
      </Column>

      <Column style={{ width: '58%' }}>
        <Text style={valueStyle}>
          {value}
        </Text>
      </Column>
    </Row>
  );
}

function formatDate(
  value: string,
  locale: 'RO' | 'EN',
) {
  return new Intl.DateTimeFormat(
    locale === 'RO'
      ? 'ro-RO'
      : 'en-GB',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    },
  ).format(new Date(`${value}T00:00:00Z`));
}

function money(
  value: number,
  locale: 'RO' | 'EN',
) {
  return new Intl.NumberFormat(
    locale === 'RO'
      ? 'ro-RO'
      : 'en-GB',
    {
      style: 'currency',
      currency: 'RON',
    },
  ).format(value);
}

const paragraph: React.CSSProperties = {
  color: '#d8d8d8',
  fontSize: '16px',
  lineHeight: '29px',
};

const card: React.CSSProperties = {
  backgroundColor: '#151515',
  border: '1px solid #2c2923',
  borderRadius: '8px',
  padding: '25px',
  marginTop: '30px',
};

const cardTitle: React.CSSProperties = {
  color: '#D4AF37',
  margin: 0,
  fontWeight: 700,
};

const divider: React.CSSProperties = {
  borderColor: '#2d2d2d',
  margin: '18px 0',
};

const labelStyle: React.CSSProperties = {
  color: '#8f887c',
  fontSize: '13px',
};

const valueStyle: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 600,
  textAlign: 'right',
};

const notice: React.CSSProperties = {
  marginTop: '35px',
  padding: '20px',
  backgroundColor: '#18150f',
  borderLeft: '3px solid #D4AF37',
};

const noticeTitle: React.CSSProperties = {
  color: '#D4AF37',
  margin: '0 0 8px',
  fontWeight: 700,
};

const noticeText: React.CSSProperties = {
  color: '#d8d8d8',
  margin: 0,
  lineHeight: '26px',
};

ReservationPaymentConfirmedEmail.PreviewProps = {
  guestFirstName: 'Andrei',
  reservationId: 'SR-2026-001',
  checkIn: '2026-09-07',
  checkOut: '2026-09-10',
  nights: 3,
  adults: 2,
  roomNames: ['Apartament Signature'],
  amountPaid: 1200,
  totalPrice: 2400,
  locale: 'RO' as const,
};