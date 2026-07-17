import * as React from 'react';
import {
  Column,
  Hr,
  Row,
  Section,
  Text,
} from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';

type ReservationSevenDayReminderEmailProps = {
  guestFirstName: string;
  reservationId: string;

  checkIn: string;
  checkOut: string;

  checkInTime: string;
  checkOutTime: string;

  nights: number;
  adults: number;

  roomNames: string[];

  resortAddress: string;
  resortPhone: string;

  mapsUrl?: string;
  locale?: 'RO' | 'EN';
};

export function ReservationSevenDayReminderEmail({
  guestFirstName,
  reservationId,
  checkIn,
  checkOut,
  checkInTime,
  checkOutTime,
  nights,
  adults,
  roomNames,
  resortAddress,
  resortPhone,
  mapsUrl,
  locale = 'RO',
}: ReservationSevenDayReminderEmailProps) {
  const isRomanian = locale === 'RO';

  return (
    <EmailLayout
      preview={
        isRomanian
          ? 'Mai sunt 7 zile până la sejurul dumneavoastră la Sunshine Resort.'
          : 'Only 7 days remain until your stay at Sunshine Resort.'
      }
      title={
        isRomanian
          ? `Ne vedem în curând, ${guestFirstName}`
          : `See you soon, ${guestFirstName}`
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
          ? 'Mai sunt doar 7 zile până la sosirea dumneavoastră la Sunshine Resort. Sejurul este confirmat, iar apartamentul este pregătit pentru perioada rezervată.'
          : 'Only 7 days remain until your arrival at Sunshine Resort. Your stay is confirmed, and the apartment is reserved for your selected dates.'}
      </Text>

      <Section style={detailsCardStyle}>
        <Text style={sectionTitleStyle}>
          {isRomanian
            ? 'Detaliile sejurului'
            : 'Stay details'}
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
          value={`${formatDate(checkIn, locale)} · ${checkInTime}`}
        />

        <DetailRow
          label="Check-out"
          value={`${formatDate(checkOut, locale)} · ${checkOutTime}`}
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

      <Section style={informationCardStyle}>
        <Text style={sectionTitleStyle}>
          {isRomanian
            ? 'Informații utile'
            : 'Useful information'}
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

        <DetailRow
          label={
            isRomanian
              ? 'Ora de check-out'
              : 'Check-out time'
          }
          value={checkOutTime}
        />
      </Section>

      <Section style={noticeStyle}>
        <Text style={noticeTitleStyle}>
          {isRomanian
            ? 'Înainte de sosire'
            : 'Before arrival'}
        </Text>

        <Text style={noticeTextStyle}>
          {isRomanian
            ? 'Cu 24 de ore înainte de check-in veți primi un nou email cu ultimele informații privind accesul, parcarea și sosirea la resort.'
            : 'Twenty-four hours before check-in, you will receive another email with the latest access, parking and arrival information.'}
        </Text>
      </Section>

      <Section style={recommendationsStyle}>
        <Text style={recommendationsTitleStyle}>
          {isRomanian
            ? 'Pentru un sejur cât mai plăcut'
            : 'For a pleasant stay'}
        </Text>

        <Text style={recommendationsTextStyle}>
          {isRomanian
            ? 'Vă recomandăm să verificați prognoza meteo înainte de plecare și să ne contactați dacă ora estimată a sosirii se modifică semnificativ.'
            : 'We recommend checking the weather forecast before departure and contacting us if your estimated arrival time changes significantly.'}
        </Text>
      </Section>

      <Text style={closingStyle}>
        {isRomanian
          ? 'Vă așteptăm cu drag la Sunshine Resort.'
          : 'We look forward to welcoming you to Sunshine Resort.'}
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
  margin: '0 0 24px',
  color: '#d0cbc2',
  fontSize: '16px',
  lineHeight: '29px',
};

const detailsCardStyle: React.CSSProperties = {
  marginBottom: '28px',
  padding: '26px',
  backgroundColor: '#151515',
  border: '1px solid #2d2922',
  borderRadius: '8px',
};

const informationCardStyle: React.CSSProperties = {
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
  color: '#f1ede6',
  fontSize: '14px',
  fontWeight: 600,
  lineHeight: '20px',
  textAlign: 'right',
};

const noticeStyle: React.CSSProperties = {
  marginBottom: '28px',
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

const recommendationsStyle: React.CSSProperties = {
  marginBottom: '30px',
  padding: '22px 24px',
  backgroundColor: '#151515',
  border: '1px solid #292929',
  borderRadius: '6px',
};

const recommendationsTitleStyle: React.CSSProperties = {
  margin: '0 0 8px',
  color: '#f1ede6',
  fontSize: '15px',
  fontWeight: 700,
};

const recommendationsTextStyle: React.CSSProperties = {
  margin: 0,
  color: '#aaa39a',
  fontSize: '14px',
  lineHeight: '24px',
};

const closingStyle: React.CSSProperties = {
  margin: 0,
  color: '#a8a197',
  fontSize: '14px',
  lineHeight: '25px',
};

ReservationSevenDayReminderEmail.PreviewProps = {
  guestFirstName: 'Marius',
  reservationId: 'SR-2026-0001',
  checkIn: '2026-11-12',
  checkOut: '2026-11-15',
  checkInTime: '14:00',
  checkOutTime: '10:00',
  nights: 3,
  adults: 2,
  roomNames: ['Apartament Signature'],
  resortAddress:
    'Colibița, Bistrița-Năsăud, România',
  resortPhone: '+40 700 000 000',
  mapsUrl:
    'https://maps.google.com',
  locale: 'RO' as const,
};