import * as React from 'react';
import {
  Hr,
  Section,
  Text,
} from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';

type ReservationPostStayEmailProps = {
  guestFirstName: string;
  reservationId: string;

  checkIn: string;
  checkOut: string;

  roomNames: string[];

  googleReviewUrl?: string;
  bookingReviewUrl?: string;
  directBookingUrl?: string;

  locale?: 'RO' | 'EN';
};

export function ReservationPostStayEmail({
  guestFirstName,
  reservationId,
  checkIn,
  checkOut,
  roomNames,
  googleReviewUrl,
  bookingReviewUrl,
  directBookingUrl,
  locale = 'RO',
}: ReservationPostStayEmailProps) {
  const isRomanian = locale === 'RO';

  const primaryReviewUrl =
    googleReviewUrl ?? bookingReviewUrl;

  return (
    <EmailLayout
      preview={
        isRomanian
          ? 'Vă mulțumim că ați ales Sunshine Resort.'
          : 'Thank you for choosing Sunshine Resort.'
      }
      title={
        isRomanian
          ? `Vă mulțumim, ${guestFirstName}`
          : `Thank you, ${guestFirstName}`
      }
      buttonText={
        primaryReviewUrl
          ? isRomanian
            ? 'Lasă-ne o recenzie'
            : 'Leave us a review'
          : undefined
      }
      buttonUrl={primaryReviewUrl}
    >
      <Text style={paragraphStyle}>
        {isRomanian
          ? 'Sperăm că sejurul dumneavoastră la Sunshine Resort a fost relaxant și că ați plecat cu amintiri frumoase.'
          : 'We hope your stay at Sunshine Resort was relaxing and that you left with wonderful memories.'}
      </Text>

      <Text style={paragraphStyle}>
        {isRomanian
          ? 'Vă mulțumim că ne-ați ales și că ne-ați oferit ocazia să vă găzduim.'
          : 'Thank you for choosing us and for giving us the opportunity to host you.'}
      </Text>

      <Section style={stayCardStyle}>
        <Text style={sectionTitleStyle}>
          {isRomanian
            ? 'Sejurul dumneavoastră'
            : 'Your stay'}
        </Text>

        <Hr style={dividerStyle} />

        <Text style={detailTextStyle}>
          <strong>
            {isRomanian
              ? 'Număr rezervare: '
              : 'Reservation number: '}
          </strong>

          {reservationId}
        </Text>

        <Text style={detailTextStyle}>
          <strong>
            {isRomanian
              ? 'Perioadă: '
              : 'Period: '}
          </strong>

          {formatDate(checkIn, locale)}
          {' – '}
          {formatDate(checkOut, locale)}
        </Text>

        <Text style={detailTextStyle}>
          <strong>
            {isRomanian
              ? 'Cazare: '
              : 'Accommodation: '}
          </strong>

          {roomNames.join(', ')}
        </Text>
      </Section>

      {primaryReviewUrl ? (
        <Section style={reviewCardStyle}>
          <Text style={reviewTitleStyle}>
            {isRomanian
              ? 'Cum a fost experiența dumneavoastră?'
              : 'How was your experience?'}
          </Text>

          <Text style={reviewTextStyle}>
            {isRomanian
              ? 'Recenzia dumneavoastră ne ajută să îmbunătățim experiența oferită și îi ajută pe viitorii oaspeți să descopere Sunshine Resort.'
              : 'Your review helps us improve the experience we provide and helps future guests discover Sunshine Resort.'}
          </Text>
        </Section>
      ) : null}

      {googleReviewUrl && bookingReviewUrl ? (
        <Section style={alternativeReviewStyle}>
          <Text style={alternativeReviewTitleStyle}>
            {isRomanian
              ? 'Puteți lăsa recenzia pe platforma preferată:'
              : 'You can leave your review on your preferred platform:'}
          </Text>

          <Text style={linkTextStyle}>
            <a
              href={googleReviewUrl}
              style={linkStyle}
            >
              Google
            </a>
          </Text>

          <Text style={linkTextStyle}>
            <a
              href={bookingReviewUrl}
              style={linkStyle}
            >
              Booking.com
            </a>
          </Text>
        </Section>
      ) : null}

      {directBookingUrl ? (
        <Section style={returnCardStyle}>
          <Text style={returnTitleStyle}>
            {isRomanian
              ? 'Vă așteptăm din nou'
              : 'We would love to welcome you again'}
          </Text>

          <Text style={returnTextStyle}>
            {isRomanian
              ? 'Pentru un viitor sejur, puteți verifica disponibilitatea și rezerva direct pe website-ul Sunshine Resort.'
              : 'For a future stay, you can check availability and book directly through the Sunshine Resort website.'}
          </Text>

          <Text style={directBookingLinkTextStyle}>
            <a
              href={directBookingUrl}
              style={directBookingLinkStyle}
            >
              {isRomanian
                ? 'Rezervă din nou'
                : 'Book again'}
            </a>
          </Text>
        </Section>
      ) : null}

      <Text style={closingStyle}>
        {isRomanian
          ? 'Cu apreciere, echipa Sunshine Resort.'
          : 'Warm regards, the Sunshine Resort team.'}
      </Text>
    </EmailLayout>
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

const stayCardStyle: React.CSSProperties = {
  marginTop: '28px',
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
  margin: '18px 0',
  borderColor: '#302c25',
};

const detailTextStyle: React.CSSProperties = {
  margin: '10px 0',
  color: '#d0cbc2',
  fontSize: '14px',
  lineHeight: '23px',
};

const reviewCardStyle: React.CSSProperties = {
  marginBottom: '28px',
  padding: '24px',
  backgroundColor: '#19160f',
  borderLeft: '3px solid #d4af37',
};

const reviewTitleStyle: React.CSSProperties = {
  margin: '0 0 8px',
  color: '#d4af37',
  fontSize: '16px',
  fontWeight: 700,
};

const reviewTextStyle: React.CSSProperties = {
  margin: 0,
  color: '#c9c2b7',
  fontSize: '14px',
  lineHeight: '24px',
};

const alternativeReviewStyle: React.CSSProperties = {
  marginBottom: '28px',
  padding: '22px 24px',
  backgroundColor: '#151515',
  border: '1px solid #292929',
  borderRadius: '6px',
};

const alternativeReviewTitleStyle:
  React.CSSProperties = {
    margin: '0 0 12px',
    color: '#f1ede6',
    fontSize: '14px',
    fontWeight: 700,
    lineHeight: '22px',
  };

const linkTextStyle: React.CSSProperties = {
  margin: '8px 0',
};

const linkStyle: React.CSSProperties = {
  color: '#d4af37',
  fontSize: '14px',
  fontWeight: 700,
  textDecoration: 'underline',
};

const returnCardStyle: React.CSSProperties = {
  marginBottom: '28px',
  padding: '24px',
  backgroundColor: '#151515',
  border: '1px solid #2d2922',
  borderRadius: '8px',
};

const returnTitleStyle: React.CSSProperties = {
  margin: '0 0 8px',
  color: '#f1ede6',
  fontSize: '16px',
  fontWeight: 700,
};

const returnTextStyle: React.CSSProperties = {
  margin: '0 0 14px',
  color: '#aaa39a',
  fontSize: '14px',
  lineHeight: '24px',
};

const directBookingLinkTextStyle:
  React.CSSProperties = {
    margin: 0,
  };

const directBookingLinkStyle:
  React.CSSProperties = {
    color: '#d4af37',
    fontSize: '14px',
    fontWeight: 700,
    textDecoration: 'underline',
  };

const closingStyle: React.CSSProperties = {
  margin: 0,
  color: '#a8a197',
  fontSize: '14px',
  lineHeight: '25px',
};

ReservationPostStayEmail.PreviewProps = {
  guestFirstName: 'Marius',
  reservationId: 'SR-2026-0001',
  checkIn: '2026-11-12',
  checkOut: '2026-11-15',
  roomNames: ['Apartament Signature'],
  googleReviewUrl:
    'https://www.google.com',
  bookingReviewUrl:
    'https://www.booking.com',
  directBookingUrl:
    'https://sunshineresort.ro/ro/rezerva',
  locale: 'RO' as const,
};