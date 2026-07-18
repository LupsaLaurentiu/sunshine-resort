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
  const isRomanian = locale === 'RO';

  const remainingAmount = Math.max(
    0,
    totalPrice - amountPaid,
  );

  const isFullyPaid = remainingAmount <= 0;

  return (
    <EmailLayout
      preview={
        isRomanian
          ? 'Plata a fost confirmată, iar rezervarea este garantată.'
          : 'Your payment has been confirmed and your reservation is secured.'
      }
      title={
        isRomanian
          ? `Rezervarea este confirmată, ${guestFirstName}`
          : `Your reservation is confirmed, ${guestFirstName}`
      }
    >
      <Text style={paragraphStyle}>
        {isRomanian
          ? 'Plata dumneavoastră a fost înregistrată cu succes. Rezervarea este acum confirmată, iar apartamentul a fost alocat pentru perioada selectată.'
          : 'Your payment has been successfully received. Your reservation is now confirmed, and the apartment has been allocated for the selected period.'}
      </Text>

      <Section style={successCardStyle}>
        <Text style={successTitleStyle}>
          {isRomanian
            ? 'Plată confirmată'
            : 'Payment confirmed'}
        </Text>

        <Text style={successTextStyle}>
          {isRomanian
            ? isFullyPaid
              ? 'Rezervarea a fost achitată integral.'
              : 'Avansul a fost achitat, iar diferența poate fi plătită ulterior conform condițiilor rezervării.'
            : isFullyPaid
              ? 'The reservation has been paid in full.'
              : 'The deposit has been paid. The remaining balance may be paid later according to the reservation terms.'}
        </Text>
      </Section>

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
          value={`${formatDate(
            checkIn,
            locale,
          )} · 14:00`}
        />

        <DetailRow
          label="Check-out"
          value={`${formatDate(
            checkOut,
            locale,
          )} · 10:00`}
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
              ? 'Cazare'
              : 'Accommodation'
          }
          value={roomNames.join(', ')}
        />
      </Section>

      <Section style={paymentCardStyle}>
        <Text style={paymentHeadingStyle}>
          {isRomanian
            ? 'Situația plății'
            : 'Payment summary'}
        </Text>

        <Hr style={dividerStyle} />

        <DetailRow
          label={
            isRomanian
              ? 'Sumă achitată'
              : 'Amount paid'
          }
          value={formatCurrency(
            amountPaid,
            locale,
          )}
        />

        <DetailRow
          label={
            isRomanian
              ? 'Valoare totală'
              : 'Total amount'
          }
          value={formatCurrency(
            totalPrice,
            locale,
          )}
        />

        <DetailRow
          label={
            isRomanian
              ? 'Diferență rămasă'
              : 'Remaining balance'
          }
          value={formatCurrency(
            remainingAmount,
            locale,
          )}
        />
      </Section>

      <Section style={noticeStyle}>
        <Text style={noticeTitleStyle}>
          {isRomanian
            ? 'Ce urmează?'
            : 'What happens next?'}
        </Text>

        <Text style={noticeTextStyle}>
          {isRomanian
            ? 'Cu 7 zile înainte de sosire veți primi un email cu recomandări și informații utile. Cu 24 de ore înainte de check-in vă vom trimite detaliile privind accesul, parcarea și sosirea la resort.'
            : 'Seven days before arrival, you will receive an email with recommendations and useful information. Twenty-four hours before check-in, we will send arrival, access and parking details.'}
        </Text>
      </Section>

      <Text style={closingStyle}>
        {isRomanian
          ? 'Vă mulțumim că ați ales Sunshine Resort. Vă așteptăm cu drag.'
          : 'Thank you for choosing Sunshine Resort. We look forward to welcoming you.'}
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
  const normalizedValue =
    value.slice(0, 10);

  const date = new Date(
    `${normalizedValue}T00:00:00.000Z`,
  );

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
  ).format(date);
}

function formatCurrency(
  value: number,
  locale: 'RO' | 'EN',
): string {
  return new Intl.NumberFormat(
    locale === 'RO'
      ? 'ro-RO'
      : 'en-GB',
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

const successCardStyle: React.CSSProperties = {
  marginBottom: '28px',
  padding: '22px 24px',
  backgroundColor: '#16180f',
  borderLeft: '3px solid #d4af37',
};

const successTitleStyle: React.CSSProperties = {
  margin: '0 0 8px',
  color: '#d4af37',
  fontSize: '16px',
  fontWeight: 700,
};

const successTextStyle: React.CSSProperties = {
  margin: 0,
  color: '#d0cbc2',
  fontSize: '14px',
  lineHeight: '24px',
};

const detailsCardStyle: React.CSSProperties = {
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

const paymentCardStyle: React.CSSProperties = {
  marginBottom: '28px',
  padding: '26px',
  backgroundColor: '#151515',
  border: '1px solid #2d2922',
  borderRadius: '8px',
};

const paymentHeadingStyle: React.CSSProperties = {
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
  width: '46%',
  verticalAlign: 'top',
};

const valueColumnStyle: React.CSSProperties = {
  width: '54%',
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

ReservationPaymentConfirmedEmail.PreviewProps = {
  guestFirstName: 'Marius',
  reservationId: 'SR-2026-0001',
  checkIn: '2026-11-05',
  checkOut: '2026-11-08',
  nights: 3,
  adults: 2,
  roomNames: ['Apartament Signature'],
  amountPaid: 1300,
  totalPrice: 2600,
  locale: 'RO' as const,
};