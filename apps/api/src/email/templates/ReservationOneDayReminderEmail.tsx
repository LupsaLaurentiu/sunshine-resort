import * as React from 'react';
import {
  Column,
  Hr,
  Row,
  Section,
  Text,
} from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';

type ReservationOneDayReminderEmailProps = {
  guestFirstName: string;
  reservationId: string;

  checkIn: string;
  checkOut: string;

  checkInTime: string;
  checkOutTime: string;

  roomNames: string[];

  resortAddress: string;
  resortPhone: string;

  parkingInstructions?: string;
  accessInstructions?: string;

  mapsUrl?: string;
  locale?: 'RO' | 'EN';
};

export function ReservationOneDayReminderEmail({
  guestFirstName,
  reservationId,
  checkIn,
  checkOut,
  checkInTime,
  checkOutTime,
  roomNames,
  resortAddress,
  resortPhone,
  parkingInstructions,
  accessInstructions,
  mapsUrl,
  locale = 'RO',
}: ReservationOneDayReminderEmailProps) {
  const isRomanian = locale === 'RO';

  return (
    <EmailLayout
      preview={
        isRomanian
          ? 'Mâine începe sejurul dumneavoastră la Sunshine Resort.'
          : 'Your stay at Sunshine Resort begins tomorrow.'
      }
      title={
        isRomanian
          ? `Vă așteptăm mâine, ${guestFirstName}`
          : `We look forward to welcoming you tomorrow, ${guestFirstName}`
      }
      buttonText={
        mapsUrl
          ? isRomanian
            ? 'Deschide locația'
            : 'Open location'
          : undefined
      }
      buttonUrl={mapsUrl}
    >
      <Text style={paragraphStyle}>
        {isRomanian
          ? 'Mâine începe sejurul dumneavoastră la Sunshine Resort. Mai jos găsiți informațiile esențiale pentru sosire.'
          : 'Your stay at Sunshine Resort begins tomorrow. Below you will find the essential arrival information.'}
      </Text>

      <Section style={detailsCardStyle}>
        <Text style={sectionTitleStyle}>
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
          )} · ${checkInTime}`}
        />

        <DetailRow
          label="Check-out"
          value={`${formatDate(
            checkOut,
            locale,
          )} · ${checkOutTime}`}
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

      <Section style={arrivalCardStyle}>
        <Text style={sectionTitleStyle}>
          {isRomanian
            ? 'Informații pentru sosire'
            : 'Arrival information'}
        </Text>

        <Hr style={dividerStyle} />

        <DetailRow
          label={
            isRomanian
              ? 'Adresă'
              : 'Address'
          }
          value={resortAddress}
        />

        <DetailRow
          label={
            isRomanian
              ? 'Telefon'
              : 'Phone'
          }
          value={resortPhone}
        />

        <DetailRow
          label={
            isRomanian
              ? 'Ora de check-in'
              : 'Check-in time'
          }
          value={checkInTime}
        />
      </Section>

      {parkingInstructions ? (
        <Section style={instructionCardStyle}>
          <Text style={instructionTitleStyle}>
            {isRomanian
              ? 'Parcare'
              : 'Parking'}
          </Text>

          <Text style={instructionTextStyle}>
            {parkingInstructions}
          </Text>
        </Section>
      ) : null}

      {accessInstructions ? (
        <Section style={instructionCardStyle}>
          <Text style={instructionTitleStyle}>
            {isRomanian
              ? 'Acces'
              : 'Access'}
          </Text>

          <Text style={instructionTextStyle}>
            {accessInstructions}
          </Text>
        </Section>
      ) : null}

      <Section style={noticeStyle}>
        <Text style={noticeTitleStyle}>
          {isRomanian
            ? 'Vă rugăm să ne anunțați'
            : 'Please let us know'}
        </Text>

        <Text style={noticeTextStyle}>
          {isRomanian
            ? 'Dacă ora estimată a sosirii se modifică semnificativ, vă rugăm să ne contactați telefonic.'
            : 'If your estimated arrival time changes significantly, please contact us by phone.'}
        </Text>
      </Section>

      <Text style={closingStyle}>
        {isRomanian
          ? 'Drum bun și vă așteptăm cu drag la Sunshine Resort.'
          : 'Have a safe journey. We look forward to welcoming you to Sunshine Resort.'}
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

const paragraphStyle: React.CSSProperties = {
  margin: '0 0 28px',
  color: '#D8D2C8',
  fontFamily:
    'Baskerville, Georgia, "Times New Roman", serif',
  fontSize: '20px',
  lineHeight: '34px',
};

const detailsCardStyle: React.CSSProperties = {
  marginBottom: '28px',
  padding: '26px',
  backgroundColor: '#151515',
  border: '1px solid #2d2922',
  borderRadius: '8px',
};

const arrivalCardStyle: React.CSSProperties = {
  marginBottom: '28px',
  padding: '26px',
  backgroundColor: '#151515',
  border: '1px solid #2d2922',
  borderRadius: '8px',
};

const sectionTitleStyle: React.CSSProperties = {
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

const instructionCardStyle: React.CSSProperties = {
  marginBottom: '24px',
  padding: '22px 24px',
  backgroundColor: '#151515',
  border: '1px solid #292929',
  borderRadius: '6px',
};

const instructionTitleStyle: React.CSSProperties = {
  margin: '0 0 8px',
  color: '#f1ede6',
  fontSize: '15px',
  fontWeight: 700,
};

const instructionTextStyle: React.CSSProperties = {
  margin: 0,
  color: '#aaa39a',
  fontSize: '14px',
  lineHeight: '24px',
  whiteSpace: 'pre-line',
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

ReservationOneDayReminderEmail.PreviewProps = {
  guestFirstName: 'Marius',
  reservationId: 'SR-2026-0001',
  checkIn: '2026-11-12',
  checkOut: '2026-11-15',
  checkInTime: '14:00',
  checkOutTime: '10:00',
  roomNames: ['Apartament Signature'],
  resortAddress:
    'Colibița, Bistrița-Năsăud, România',
  resortPhone: '+40 700 000 000',
  parkingInstructions:
    'Parcarea este disponibilă în interiorul proprietății.',
  accessInstructions:
    'La sosire, vă rugăm să contactați numărul resortului pentru instrucțiunile de acces.',
  mapsUrl: 'https://maps.google.com',
  locale: 'RO' as const,
};