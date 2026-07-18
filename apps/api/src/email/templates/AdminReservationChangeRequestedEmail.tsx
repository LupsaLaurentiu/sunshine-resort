import * as React from 'react';
import {
  Column,
  Hr,
  Row,
  Section,
  Text,
} from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';

type AdminReservationChangeRequestedEmailProps = {
  reservationId: string;
  reservationChangeId: string;

  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;

  currentCheckIn: string;
  currentCheckOut: string;

  requestedCheckIn: string;
  requestedCheckOut: string;

  roomNames: string[];

  guestReason?: string | null;
  approvalDeadline?: string | null;
};

export function AdminReservationChangeRequestedEmail({
  reservationId,
  reservationChangeId,
  guestFirstName,
  guestLastName,
  guestEmail,
  guestPhone,
  currentCheckIn,
  currentCheckOut,
  requestedCheckIn,
  requestedCheckOut,
  roomNames,
  guestReason,
  approvalDeadline,
}: AdminReservationChangeRequestedEmailProps) {
  const guestFullName =
    `${guestFirstName} ${guestLastName}`.trim();

  return (
    <EmailLayout
      preview={`Cerere nouă de modificare pentru rezervarea ${reservationId}`}
      title="Cerere nouă de modificare"
    >
      <Text style={paragraphStyle}>
        Clientul a trimis o solicitare de modificare a perioadei
        rezervării. Cererea trebuie analizată în panoul de
        administrare.
      </Text>

      <Section style={highlightCardStyle}>
        <Text style={highlightTitleStyle}>
          Acțiune necesară
        </Text>

        <Text style={highlightTextStyle}>
          Verifică disponibilitatea pentru noua perioadă și aprobă
          sau respinge solicitarea înainte de expirarea termenului.
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
          label="ID solicitare"
          value={reservationChangeId}
        />

        <DetailRow
          label="Cazare"
          value={roomNames.join(', ')}
        />
      </Section>

      <Section style={comparisonCardStyle}>
        <Text style={sectionTitleStyle}>
          Modificarea solicitată
        </Text>

        <Hr style={dividerStyle} />

        <Text style={subheadingStyle}>
          Perioada actuală
        </Text>

        <DetailRow
          label="Check-in"
          value={formatDate(currentCheckIn)}
        />

        <DetailRow
          label="Check-out"
          value={formatDate(currentCheckOut)}
        />

        <Hr style={innerDividerStyle} />

        <Text style={subheadingStyle}>
          Perioada solicitată
        </Text>

        <DetailRow
          label="Check-in"
          value={formatDate(requestedCheckIn)}
        />

        <DetailRow
          label="Check-out"
          value={formatDate(requestedCheckOut)}
        />
      </Section>

      {guestReason ? (
        <Section style={reasonCardStyle}>
          <Text style={reasonTitleStyle}>
            Motivul clientului
          </Text>

          <Text style={reasonTextStyle}>
            {guestReason}
          </Text>
        </Section>
      ) : null}

      {approvalDeadline ? (
        <Section style={deadlineCardStyle}>
          <Text style={deadlineTitleStyle}>
            Termen de răspuns
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

const comparisonCardStyle: React.CSSProperties = {
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

const subheadingStyle: React.CSSProperties = {
  margin: '6px 0 8px',
  color: '#f1ede6',
  fontFamily:
    'Baskerville, Georgia, "Times New Roman", serif',
  fontSize: '17px',
  fontWeight: 400,
  lineHeight: '24px',
};

const dividerStyle: React.CSSProperties = {
  margin: '18px 0 10px',
  borderColor: '#302c25',
};

const innerDividerStyle: React.CSSProperties = {
  margin: '20px 0',
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

AdminReservationChangeRequestedEmail.PreviewProps = {
  reservationId: 'SR-2026-0001',
  reservationChangeId: 'CHG-2026-0001',

  guestFirstName: 'Marius',
  guestLastName: 'Popescu',
  guestEmail: 'marius@example.com',
  guestPhone: '0740000000',

  currentCheckIn: '2026-11-12',
  currentCheckOut: '2026-11-15',

  requestedCheckIn: '2026-11-19',
  requestedCheckOut: '2026-11-22',

  roomNames: [
    'Apartament Signature',
  ],

  guestReason:
    'Doresc să modific perioada din motive personale.',

  approvalDeadline:
    '2026-07-18T14:00:00.000Z',
};