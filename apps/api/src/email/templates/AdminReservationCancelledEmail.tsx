import * as React from 'react';
import {
  Column,
  Hr,
  Row,
  Section,
  Text,
} from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';

type AdminReservationCancelledEmailProps = {
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

  cancellationReason: string;

  previouslyPaidAmount: number;
  refundedAmount: number;
  retainedAmount: number;

  cancelledAt: string;
};

export function AdminReservationCancelledEmail({
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
  cancellationReason,
  previouslyPaidAmount,
  refundedAmount,
  retainedAmount,
  cancelledAt,
}: AdminReservationCancelledEmailProps) {
  const guestFullName =
    `${guestFirstName} ${guestLastName}`.trim();

  return (
    <EmailLayout
      preview={`Rezervarea ${reservationId} a fost anulată`}
      title="Rezervare anulată"
    >
      <Text style={paragraphStyle}>
        Rezervarea clientului a fost anulată și disponibilitatea
        apartamentelor trebuie actualizată automat în sistem.
      </Text>

      <Section style={warningCardStyle}>
        <Text style={warningTitleStyle}>
          Rezervare anulată
        </Text>

        <Text style={warningTextStyle}>
          Perioada rezervată a fost eliberată. Verifică situația
          rambursării și eventualele operațiuni administrative
          rămase.
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

        <DetailRow
          label="Data anulării"
          value={formatDateTime(cancelledAt)}
        />
      </Section>

      <Section style={financialCardStyle}>
        <Text style={sectionTitleStyle}>
          Situația financiară
        </Text>

        <Hr style={dividerStyle} />

        <DetailRow
          label="Sumă achitată anterior"
          value={formatCurrency(
            previouslyPaidAmount,
          )}
        />

        <DetailRow
          label="Sumă rambursată"
          value={formatCurrency(
            refundedAmount,
          )}
        />

        <DetailRow
          label="Sumă reținută"
          value={formatCurrency(
            retainedAmount,
          )}
        />
      </Section>

      <Section style={reasonCardStyle}>
        <Text style={reasonTitleStyle}>
          Motivul anulării
        </Text>

        <Text style={reasonTextStyle}>
          {cancellationReason}
        </Text>
      </Section>

      <Text style={closingStyle}>
        Rezervarea poate fi consultată în panoul administrativ
        Sunshine Resort.
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
): string {
  const normalizedValue =
    value.slice(0, 10);

  const date = new Date(
    `${normalizedValue}T00:00:00.000Z`,
  );

  return new Intl.DateTimeFormat(
    'ro-RO',
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
): string {
  return new Intl.DateTimeFormat(
    'ro-RO',
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
): string {
  return new Intl.NumberFormat(
    'ro-RO',
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
  color: '#d8d2c8',
  fontFamily:
    'Baskerville, Georgia, "Times New Roman", serif',
  fontSize: '19px',
  lineHeight: '32px',
};

const warningCardStyle: React.CSSProperties = {
  marginBottom: '28px',
  padding: '22px 24px',
  backgroundColor: '#1a1310',
  borderLeft: '3px solid #c9a96e',
};

const warningTitleStyle: React.CSSProperties = {
  margin: '0 0 8px',
  color: '#d7bb83',
  fontFamily:
    'Baskerville, Georgia, "Times New Roman", serif',
  fontSize: '18px',
  fontWeight: 400,
  lineHeight: '26px',
};

const warningTextStyle: React.CSSProperties = {
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

const financialCardStyle: React.CSSProperties = {
  marginBottom: '28px',
  padding: '26px',
  backgroundColor: '#151515',
  border: '1px solid #2d2922',
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

const reasonCardStyle: React.CSSProperties = {
  marginBottom: '28px',
  padding: '22px 24px',
  backgroundColor: '#151515',
  border: '1px solid #292929',
  borderRadius: '6px',
};

const reasonTitleStyle: React.CSSProperties = {
  margin: '0 0 8px',
  color: '#f1ede6',
  fontFamily:
    'Baskerville, Georgia, "Times New Roman", serif',
  fontSize: '17px',
  fontWeight: 400,
  lineHeight: '24px',
};

const reasonTextStyle: React.CSSProperties = {
  margin: 0,
  color: '#aaa39a',
  fontFamily:
    'Baskerville, Georgia, "Times New Roman", serif',
  fontSize: '16px',
  lineHeight: '27px',
  whiteSpace: 'pre-line',
};

const closingStyle: React.CSSProperties = {
  margin: 0,
  color: '#a8a197',
  fontFamily:
    'Baskerville, Georgia, "Times New Roman", serif',
  fontSize: '15px',
  lineHeight: '25px',
};

AdminReservationCancelledEmail.PreviewProps = {
  reservationId: 'SR-2026-0004',

  guestFirstName: 'Marius',
  guestLastName: 'Popescu',
  guestEmail: 'marius@example.com',
  guestPhone: '0740000000',

  checkIn: '2026-11-12',
  checkOut: '2026-11-15',

  nights: 3,
  adults: 2,

  roomNames: [
    'Apartament Signature',
  ],

  cancellationReason:
    'Clientul nu mai poate ajunge în perioada rezervată.',

  previouslyPaidAmount: 1300,
  refundedAmount: 1300,
  retainedAmount: 0,

  cancelledAt:
    '2026-07-18T11:30:00.000Z',
};