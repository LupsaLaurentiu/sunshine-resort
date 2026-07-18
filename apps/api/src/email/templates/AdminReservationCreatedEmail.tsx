import * as React from 'react';
import {
  Column,
  Hr,
  Row,
  Section,
  Text,
} from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';

type AdminReservationCreatedEmailProps = {
  reservationId: string;

  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;
  guestCountry?: string | null;

  checkIn: string;
  checkOut: string;

  nights: number;
  adults: number;

  roomNames: string[];

  totalPrice: number;
  depositAmount: number;

  guestNotes?: string | null;
  approvalDeadline?: string | null;
};

export function AdminReservationCreatedEmail({
  reservationId,
  guestFirstName,
  guestLastName,
  guestEmail,
  guestPhone,
  guestCountry,
  checkIn,
  checkOut,
  nights,
  adults,
  roomNames,
  totalPrice,
  depositAmount,
  guestNotes,
  approvalDeadline,
}: AdminReservationCreatedEmailProps) {
  const guestFullName =
    `${guestFirstName} ${guestLastName}`.trim();

  return (
    <EmailLayout
      preview={`Cerere nouă de rezervare de la ${guestFullName}`}
      title="Cerere nouă de rezervare"
    >
      <Text style={paragraphStyle}>
        A fost înregistrată o nouă cerere de rezervare prin
        website-ul Sunshine Resort. Verifică disponibilitatea și
        aprobă sau respinge cererea în termenul stabilit.
      </Text>

      <Section style={highlightCardStyle}>
        <Text style={highlightTitleStyle}>
          Acțiune necesară
        </Text>

        <Text style={highlightTextStyle}>
          Rezervarea este în starea de așteptare a aprobării și
          blochează temporar inventarul selectat.
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

        {guestCountry ? (
          <DetailRow
            label="Țară"
            value={guestCountry}
          />
        ) : null}
      </Section>

      <Section style={detailsCardStyle}>
        <Text style={sectionTitleStyle}>
          Detaliile rezervării
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
          Valoarea rezervării
        </Text>

        <Hr style={dividerStyle} />

        <DetailRow
          label="Total"
          value={formatCurrency(totalPrice)}
        />

        <DetailRow
          label="Avans minim"
          value={formatCurrency(depositAmount)}
        />
      </Section>

      {guestNotes ? (
        <Section style={notesCardStyle}>
          <Text style={notesTitleStyle}>
            Observațiile clientului
          </Text>

          <Text style={notesTextStyle}>
            {guestNotes}
          </Text>
        </Section>
      ) : null}

      {approvalDeadline ? (
        <Section style={deadlineCardStyle}>
          <Text style={deadlineTitleStyle}>
            Termen limită pentru răspuns
          </Text>

          <Text style={deadlineTextStyle}>
            {formatDateTime(approvalDeadline)}
          </Text>
        </Section>
      ) : null}

      <Text style={closingStyle}>
        Cererea poate fi gestionată din panoul administrativ
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

function formatDate(value: string): string {
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

function formatDateTime(value: string): string {
  const date = new Date(value);

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
  ).format(date);
}

function formatCurrency(value: number): string {
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

const highlightCardStyle: React.CSSProperties = {
  marginBottom: '28px',
  padding: '22px 24px',
  backgroundColor: '#19160f',
  borderLeft: '3px solid #c9a96e',
};

const highlightTitleStyle: React.CSSProperties = {
  margin: '0 0 8px',
  color: '#d7bb83',
  fontFamily:
    'Baskerville, Georgia, "Times New Roman", serif',
  fontSize: '18px',
  fontWeight: 400,
  lineHeight: '26px',
};

const highlightTextStyle: React.CSSProperties = {
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
};

const notesCardStyle: React.CSSProperties = {
  marginBottom: '28px',
  padding: '22px 24px',
  backgroundColor: '#151515',
  border: '1px solid #292929',
  borderRadius: '6px',
};

const notesTitleStyle: React.CSSProperties = {
  margin: '0 0 8px',
  color: '#f1ede6',
  fontFamily:
    'Baskerville, Georgia, "Times New Roman", serif',
  fontSize: '17px',
  fontWeight: 400,
  lineHeight: '24px',
};

const notesTextStyle: React.CSSProperties = {
  margin: 0,
  color: '#aaa39a',
  fontFamily:
    'Baskerville, Georgia, "Times New Roman", serif',
  fontSize: '16px',
  lineHeight: '27px',
  whiteSpace: 'pre-line',
};

const deadlineCardStyle: React.CSSProperties = {
  marginBottom: '28px',
  padding: '22px 24px',
  backgroundColor: '#19160f',
  borderLeft: '3px solid #c9a96e',
};

const deadlineTitleStyle: React.CSSProperties = {
  margin: '0 0 8px',
  color: '#d7bb83',
  fontFamily:
    'Baskerville, Georgia, "Times New Roman", serif',
  fontSize: '17px',
  fontWeight: 400,
  lineHeight: '24px',
};

const deadlineTextStyle: React.CSSProperties = {
  margin: 0,
  color: '#f1ede6',
  fontFamily:
    'Baskerville, Georgia, "Times New Roman", serif',
  fontSize: '16px',
  lineHeight: '25px',
};

const closingStyle: React.CSSProperties = {
  margin: 0,
  color: '#a8a197',
  fontFamily:
    'Baskerville, Georgia, "Times New Roman", serif',
  fontSize: '15px',
  lineHeight: '25px',
};

AdminReservationCreatedEmail.PreviewProps = {
  reservationId: 'SR-2026-0002',

  guestFirstName: 'Marius',
  guestLastName: 'Popescu',
  guestEmail: 'marius@example.com',
  guestPhone: '0740000000',
  guestCountry: 'România',

  checkIn: '2026-11-12',
  checkOut: '2026-11-15',

  nights: 3,
  adults: 2,

  roomNames: [
    'Apartament Signature',
  ],

  totalPrice: 2600,
  depositAmount: 1300,

  guestNotes:
    'Estimăm că vom ajunge în jurul orei 17:00.',

  approvalDeadline:
    '2026-07-19T15:00:00.000Z',
};