import * as React from 'react';
import {
  Column,
  Hr,
  Row,
  Section,
  Text,
} from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';

type AdminPaymentConfirmedEmailProps = {
  reservationId: string;

  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;

  checkIn: string;
  checkOut: string;

  nights: number;
  adults: number;

  roomNames: string[];

  paymentType: string;
  amountPaid: number;
  totalPrice: number;
  remainingAmount: number;

  paymentId: string;
  stripePaymentIntentId?: string | null;
  paidAt: string;
};

export function AdminPaymentConfirmedEmail({
  reservationId,
  guestFirstName,
  guestLastName,
  guestEmail,
  guestPhone,
  checkIn,
  checkOut,
  nights,
  adults,
  roomNames,
  paymentType,
  amountPaid,
  totalPrice,
  remainingAmount,
  paymentId,
  stripePaymentIntentId,
  paidAt,
}: AdminPaymentConfirmedEmailProps) {
  const guestFullName =
    `${guestFirstName} ${guestLastName}`.trim();

  const isFullyPaid = remainingAmount <= 0;

  return (
    <EmailLayout
      preview={`Plată confirmată pentru rezervarea ${reservationId}`}
      title="Plată confirmată"
    >
      <Text style={paragraphStyle}>
        Plata clientului a fost confirmată prin Stripe, iar
        rezervarea a fost actualizată automat în sistem.
      </Text>

      <Section style={successCardStyle}>
        <Text style={successTitleStyle}>
          Rezervare confirmată
        </Text>

        <Text style={successTextStyle}>
          {isFullyPaid
            ? 'Rezervarea a fost achitată integral.'
            : 'Avansul a fost achitat. Diferența rămasă va fi achitată ulterior.'}
        </Text>
      </Section>

      <Section style={detailsCardStyle}>
        <Text style={sectionTitleStyle}>
          Client
        </Text>

        <Hr style={dividerStyle} />

        <DetailRow
          label="Nume"
          value={guestFullName}
        />

        <DetailRow
          label="Email"
          value={guestEmail}
        />

        <DetailRow
          label="Telefon"
          value={guestPhone}
        />
      </Section>

      <Section style={detailsCardStyle}>
        <Text style={sectionTitleStyle}>
          Rezervare
        </Text>

        <Hr style={dividerStyle} />

        <DetailRow
          label="ID rezervare"
          value={reservationId}
        />

        <DetailRow
          label="Check-in"
          value={`${formatDate(checkIn)} · 14:00`}
        />

        <DetailRow
          label="Check-out"
          value={`${formatDate(checkOut)} · 10:00`}
        />

        <DetailRow
          label="Nopți"
          value={String(nights)}
        />

        <DetailRow
          label="Adulți"
          value={String(adults)}
        />

        <DetailRow
          label="Cazare"
          value={roomNames.join(', ')}
        />
      </Section>

      <Section style={paymentCardStyle}>
        <Text style={sectionTitleStyle}>
          Plata
        </Text>

        <Hr style={dividerStyle} />

        <DetailRow
          label="Tip plată"
          value={formatPaymentType(paymentType)}
        />

        <DetailRow
          label="Sumă achitată"
          value={formatCurrency(amountPaid)}
        />

        <DetailRow
          label="Valoare totală"
          value={formatCurrency(totalPrice)}
        />

        <DetailRow
          label="Diferență rămasă"
          value={formatCurrency(remainingAmount)}
        />

        <DetailRow
          label="Data plății"
          value={formatDateTime(paidAt)}
        />
      </Section>

      <Section style={technicalCardStyle}>
        <Text style={technicalTitleStyle}>
          Referințe tehnice
        </Text>

        <Hr style={dividerStyle} />

        <DetailRow
          label="ID plată"
          value={paymentId}
        />

        {stripePaymentIntentId ? (
          <DetailRow
            label="Stripe Payment Intent"
            value={stripePaymentIntentId}
          />
        ) : null}
      </Section>

      <Text style={closingStyle}>
        Nu este necesară nicio acțiune imediată. Rezervarea poate
        fi consultată în panoul administrativ Sunshine Resort.
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

function formatDate(value: string): string {
  const normalizedValue = value.slice(0, 10);

  const date = new Date(
    `${normalizedValue}T00:00:00.000Z`,
  );

  return new Intl.DateTimeFormat('ro-RO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('ro-RO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Bucharest',
  }).format(new Date(value));
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPaymentType(
  paymentType: string,
): string {
  switch (paymentType) {
    case 'DEPOSIT':
      return 'Avans';

    case 'FULL':
      return 'Plată integrală';

    case 'REMAINING_BALANCE':
      return 'Diferență de plată';

    case 'MODIFICATION_DIFFERENCE':
      return 'Diferență modificare';

    default:
      return paymentType;
  }
}

const paragraphStyle: React.CSSProperties = {
  margin: '0 0 28px',
  color: '#d8d2c8',
  fontFamily:
    'Baskerville, Georgia, "Times New Roman", serif',
  fontSize: '19px',
  lineHeight: '32px',
};

const successCardStyle: React.CSSProperties = {
  marginBottom: '28px',
  padding: '22px 24px',
  backgroundColor: '#15190f',
  borderLeft: '3px solid #c9a96e',
};

const successTitleStyle: React.CSSProperties = {
  margin: '0 0 8px',
  color: '#d7bb83',
  fontFamily:
    'Baskerville, Georgia, "Times New Roman", serif',
  fontSize: '18px',
  fontWeight: 400,
  lineHeight: '26px',
};

const successTextStyle: React.CSSProperties = {
  margin: 0,
  color: '#c9c2b7',
  fontFamily:
    'Baskerville, Georgia, "Times New Roman", serif',
  fontSize: '16px',
  lineHeight: '27px',
};

const detailsCardStyle: React.CSSProperties = {
  marginBottom: '28px',
  padding: '26px',
  backgroundColor: '#151515',
  border: '1px solid #2d2922',
  borderRadius: '8px',
};

const paymentCardStyle: React.CSSProperties = {
  marginBottom: '28px',
  padding: '26px',
  backgroundColor: '#151515',
  border: '1px solid #2d2922',
  borderRadius: '8px',
};

const technicalCardStyle: React.CSSProperties = {
  marginBottom: '28px',
  padding: '26px',
  backgroundColor: '#111111',
  border: '1px solid #292929',
  borderRadius: '8px',
};

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  color: '#d7bb83',
  fontFamily:
    'Baskerville, Georgia, "Times New Roman", serif',
  fontSize: '20px',
  fontWeight: 400,
  lineHeight: '28px',
};

const technicalTitleStyle: React.CSSProperties = {
  margin: 0,
  color: '#a8a197',
  fontFamily:
    'Baskerville, Georgia, "Times New Roman", serif',
  fontSize: '18px',
  fontWeight: 400,
  lineHeight: '26px',
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
  fontFamily:
    'Baskerville, Georgia, "Times New Roman", serif',
  fontSize: '14px',
  lineHeight: '21px',
};

const detailValueStyle: React.CSSProperties = {
  margin: '9px 0',
  color: '#f1ede6',
  fontFamily:
    'Baskerville, Georgia, "Times New Roman", serif',
  fontSize: '15px',
  fontWeight: 400,
  lineHeight: '22px',
  textAlign: 'right',
  wordBreak: 'break-word',
};

const closingStyle: React.CSSProperties = {
  margin: 0,
  color: '#a8a197',
  fontFamily:
    'Baskerville, Georgia, "Times New Roman", serif',
  fontSize: '15px',
  lineHeight: '25px',
};

AdminPaymentConfirmedEmail.PreviewProps = {
  reservationId: 'SR-2026-0003',

  guestFirstName: 'Marius',
  guestLastName: 'Popescu',
  guestEmail: 'marius@example.com',
  guestPhone: '0740000000',

  checkIn: '2026-11-12',
  checkOut: '2026-11-15',

  nights: 3,
  adults: 2,

  roomNames: ['Apartament Signature'],

  paymentType: 'DEPOSIT',
  amountPaid: 1300,
  totalPrice: 2600,
  remainingAmount: 1300,

  paymentId: 'pay_2026_0003',
  stripePaymentIntentId: 'pi_test_123456789',
  paidAt: '2026-07-17T13:47:31.741Z',
};